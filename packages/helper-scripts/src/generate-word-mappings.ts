import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
	EnglishContrastsByPhonemeId,
	EnglishPhonemeAllophones,
	EnglishPhonemeSpellingPatterns,
} from "@phonaria/phonetics-data";

type CMUDict = {
	meta: {
		formatVersion: number;
		source: string;
		sourceUrl: string;
		generatedAt: string;
		wordCount: number;
		variantCount: number;
		skippedLineCount: number;
		deduplicatedVariantCount: number;
	};
	data: Record<string, string[]>;
};

type WordMapping = {
	word: string;
	phonemic: string;
	cmuArpa?: string;
	status: "found" | "missing" | "multiple";
	variants?: string[];
};

type Report = {
	meta: {
		generatedAt: string;
		total: number;
		found: number;
		missing: number;
		multiple: number;
	};
	mappings: WordMapping[];
};

function normalizeWord(word: string): string {
	return word.trim().toUpperCase();
}

function getCmudictPath(): string {
	const envPath = process.env.CMUDICT_JSON_PATH;
	if (envPath) return envPath;

	const defaultPath = resolve(
		__dirname,
		"..",
		"..",
		"..",
		"phonetics-data",
		"data",
		"en",
		"dict",
		"cmudict.json",
	);
	if (existsSync(defaultPath)) return defaultPath;

	const legacyPath = resolve(
		__dirname,
		"..",
		"..",
		"..",
		"apps",
		"web",
		"src",
		"data",
		"dict",
		"cmudict.json",
	);
	if (existsSync(legacyPath)) return legacyPath;

	throw new Error(
		`CMUDict JSON not found. Set CMUDICT_JSON_PATH or generate it at ${defaultPath}.`,
	);
}

function loadCMUDict(): CMUDict {
	const content = readFileSync(getCmudictPath(), "utf8");
	return JSON.parse(content);
}

function lookupCMUArpa(word: string, cmudict: CMUDict): WordMapping {
	const normalized = normalizeWord(word);
	const variants = cmudict.data[normalized];

	if (!variants || variants.length === 0) {
		return {
			word,
			phonemic: "",
			status: "missing",
		};
	}

	if (variants.length > 1) {
		return {
			word,
			phonemic: "",
			cmuArpa: variants[0], // Use first variant
			status: "multiple",
			variants,
		};
	}

	return {
		word,
		phonemic: "",
		cmuArpa: variants[0],
		status: "found",
	};
}

function collectFromSpellingPatterns(cmudict: CMUDict): WordMapping[] {
	const mappings: WordMapping[] = [];

	for (const entry of Object.values(EnglishPhonemeSpellingPatterns ?? {})) {
		if (!entry) continue;
		for (const example of entry.examples) {
			const mapping = lookupCMUArpa(example.word, cmudict);
			mapping.phonemic = example.phonemic;
			mappings.push(mapping);
		}
	}

	return mappings;
}

function collectFromContrasts(cmudict: CMUDict): WordMapping[] {
	const mappings: WordMapping[] = [];

	for (const matches of Object.values(EnglishContrastsByPhonemeId ?? {})) {
		if (!matches) continue;
		for (const match of matches) {
			for (const pair of match.minimalPairs) {
				for (const item of pair) {
					const mapping = lookupCMUArpa(item.word, cmudict);
					mapping.phonemic = item.phonemic;
					mappings.push(mapping);
				}
			}
		}
	}

	return mappings;
}

function collectFromAllophones(cmudict: CMUDict): WordMapping[] {
	const mappings: WordMapping[] = [];

	for (const entry of Object.values(EnglishPhonemeAllophones ?? {})) {
		if (!entry) continue;
		for (const variant of entry) {
			for (const example of variant.examples) {
				const mapping = lookupCMUArpa(example.word, cmudict);
				mapping.phonemic = example.phonemic;
				mappings.push(mapping);
			}
		}
	}

	return mappings;
}

function buildReport(): Report {
	const cmudict = loadCMUDict();

	const spellingPatternMappings = collectFromSpellingPatterns(cmudict);
	const contrastMappings = collectFromContrasts(cmudict);
	const allophoneMappings = collectFromAllophones(cmudict);

	const allMappings = [...spellingPatternMappings, ...contrastMappings, ...allophoneMappings];

	// Deduplicate by word (case-insensitive), keeping first occurrence
	const byWord = new Map<string, WordMapping>();
	for (const mapping of allMappings) {
		const key = mapping.word.toLowerCase();
		if (!byWord.has(key)) {
			byWord.set(key, mapping);
		}
	}

	const uniqueMappings = Array.from(byWord.values()).sort((a, b) => a.word.localeCompare(b.word));

	const found = uniqueMappings.filter((m) => m.status === "found").length;
	const missing = uniqueMappings.filter((m) => m.status === "missing").length;
	const multiple = uniqueMappings.filter((m) => m.status === "multiple").length;

	return {
		meta: {
			generatedAt: new Date().toISOString(),
			total: uniqueMappings.length,
			found,
			missing,
			multiple,
		},
		mappings: uniqueMappings,
	};
}

function main() {
	console.log("🔍 Generating CMU ARPA mappings for example words...\n");

	const report = buildReport();

	const outputPath = resolve(__dirname, "..", "..", "audio-gen", "data", "cmu-arpa-mappings.json");

	mkdirSync(dirname(outputPath), { recursive: true });
	writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

	console.log(`✅ Generated CMU ARPA mappings report\n`);
	console.log(`📊 Statistics:`);
	console.log(`   Unique words:    ${report.meta.total}`);
	console.log(
		`   Found:           ${report.meta.found} (${((report.meta.found / report.meta.total) * 100).toFixed(1)}%)`,
	);
	console.log(
		`   Multiple:        ${report.meta.multiple} (${((report.meta.multiple / report.meta.total) * 100).toFixed(1)}%)`,
	);
	console.log(
		`   Missing:         ${report.meta.missing} (${((report.meta.missing / report.meta.total) * 100).toFixed(1)}%)`,
	);
	console.log(`\n📁 Output: ${outputPath}`);

	if (report.meta.missing > 0) {
		console.log(`\n⚠️  Missing words:`);
		const missingWords = report.mappings.filter((m) => m.status === "missing").map((m) => m.word);
		console.log(`   ${missingWords.join(", ")}`);
	}

	if (report.meta.multiple > 5) {
		console.log(`\n💡 ${report.meta.multiple} words have multiple pronunciations`);
		console.log(`   Using first variant by default`);
	}
}

if (require.main === module) {
	main();
}
