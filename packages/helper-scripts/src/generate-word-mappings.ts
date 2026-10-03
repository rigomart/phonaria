import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
	cmuVariantToIpa,
	EnglishPhonemeContrasts,
	phonemeVariantToCmuArpa,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";

type WordMapping = {
	word: string;
	phonemic: string;
	cmuArpa?: string;
	status: "found" | "missing" | "multiple";
	variants?: string[];
};

export function buildWordMappings(dictionary: Record<string, readonly string[]>) {
	const words = new Set(
		EnglishPhonemeContrasts.flatMap(({ minimalPairs }) =>
			minimalPairs.flatMap(({ words }) => words),
		),
	);
	const mappings: WordMapping[] = [...words].sort().map((word) => {
		const variants = dictionary[word] ?? dictionary[word.toUpperCase()];
		if (!variants?.length) return { word, phonemic: "", status: "missing" };
		const arpaVariants = [...new Set(variants.map(phonemeVariantToCmuArpa))];
		if (arpaVariants.length !== 1) {
			return { word, phonemic: "", status: "multiple", variants: arpaVariants };
		}
		return {
			word,
			phonemic: cmuVariantToIpa(variants[0]),
			cmuArpa: arpaVariants[0],
			status: "found",
		};
	});
	return {
		meta: {
			generatedAt: new Date().toISOString(),
			total: mappings.length,
			found: mappings.filter(({ status }) => status === "found").length,
			missing: mappings.filter(({ status }) => status === "missing").length,
			multiple: mappings.filter(({ status }) => status === "multiple").length,
		},
		mappings,
	};
}

function main() {
	// The catalog is validated against this bundled dictionary. An explicit full
	// dictionary override remains available for inspecting generated CMUDict data.
	const dictionary: Record<string, string[]> = process.env.CMUDICT_JSON_PATH
		? JSON.parse(readFileSync(process.env.CMUDICT_JSON_PATH, "utf8")).data
		: EnglishCuratedTop10k.words;
	const report = buildWordMappings(dictionary);
	const outputPath = resolve(__dirname, "..", "..", "audio-gen", "data", "cmu-arpa-mappings.json");
	mkdirSync(dirname(outputPath), { recursive: true });
	writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
	console.log(
		`Catalog: ${report.meta.total} words; ${report.meta.found} found, ${report.meta.missing} missing, ${report.meta.multiple} ambiguous`,
	);
	console.log(`Report: ${outputPath}`);
	if (report.meta.missing || report.meta.multiple) {
		console.error(
			"Missing or ambiguous words have no API pronunciation; resolve them before generation.",
		);
		process.exitCode = 1;
	}
}

if (require.main === module) main();
