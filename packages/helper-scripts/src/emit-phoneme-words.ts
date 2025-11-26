import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
	ContrastsByPhonemeIdRegistry,
	PhonemeAllophoneRegistry,
	PhonemeSpellingPatternRegistry,
} from "shared-data";

type WordSource = "spellingPatterns" | "contrasts" | "allophones";

type WordManifest = {
	meta: {
		generatedAt: string;
		source: "shared-data";
		total: number;
		sourceCounts: Record<WordSource, number>;
	};
	words: string[];
};

function normalizeWord(word: string): string {
	return word.trim().toLowerCase();
}

function collectFromSpellingPatterns(): string[] {
	const words = new Set<string>();

	for (const entry of Object.values(PhonemeSpellingPatternRegistry ?? {})) {
		if (!entry) continue;
		for (const example of entry.examples) {
			const normalized = normalizeWord(example.word);
			if (normalized) {
				words.add(normalized);
			}
		}
	}

	return Array.from(words);
}

function collectFromContrasts(): string[] {
	const words = new Set<string>();

	for (const matches of Object.values(ContrastsByPhonemeIdRegistry ?? {})) {
		if (!matches) continue;
		for (const match of matches) {
			for (const pair of match.minimalPairs) {
				for (const item of pair) {
					const normalized = normalizeWord(item.word);
					if (normalized) {
						words.add(normalized);
					}
				}
			}
		}
	}

	return Array.from(words);
}

function collectFromAllophones(): string[] {
	const words = new Set<string>();

	for (const entry of Object.values(PhonemeAllophoneRegistry ?? {})) {
		if (!entry) continue;
		for (const variant of entry) {
			for (const example of variant.examples) {
				const normalized = normalizeWord(example.word);
				if (normalized) {
					words.add(normalized);
				}
			}
		}
	}

	return Array.from(words);
}

function buildManifest(): WordManifest {
	const spellingPatternWords = collectFromSpellingPatterns();
	const contrastWords = collectFromContrasts();
	const allophoneWords = collectFromAllophones();

	const uniqueWords = new Set<string>([
		...spellingPatternWords,
		...contrastWords,
		...allophoneWords,
	]);
	const sortedWords = Array.from(uniqueWords).sort();

	return {
		meta: {
			generatedAt: new Date().toISOString(),
			source: "shared-data",
			total: sortedWords.length,
			sourceCounts: {
				spellingPatterns: spellingPatternWords.length,
				contrasts: contrastWords.length,
				allophones: allophoneWords.length,
			},
		},
		words: sortedWords,
	};
}

function ensureDirectoryExists(filePath: string): void {
	const directory = dirname(filePath);
	mkdirSync(directory, { recursive: true });
}

function writeManifest(manifest: WordManifest, outputPath: string): void {
	ensureDirectoryExists(outputPath);
	writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function main() {
	const manifest = buildManifest();
	const outputPath = resolve(
		__dirname,
		"..",
		"..",
		"audio-generation",
		"data",
		"phoneme-words.json",
	);

	writeManifest(manifest, outputPath);

	console.log(`✅ Wrote ${manifest.words.length} words to ${outputPath}`);
	console.log(
		"   Source counts:",
		JSON.stringify(manifest.meta.sourceCounts, null, 2),
	);
}

if (require.main === module) {
	main();
}
