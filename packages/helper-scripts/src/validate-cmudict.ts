import { readFileSync } from "node:fs";
import { parsePhonemePronunciation } from "@phonaria/phonetics-data";

/** Validate every stored pronunciation and normalize whitespace before export. */
export function normalizeDictionaryPronunciations(
	data: Record<string, readonly string[]>,
): Record<string, string[]> {
	return Object.fromEntries(
		Object.entries(data).map(([word, variants]) => {
			if (!variants.length) throw new Error(`No pronunciations for '${word}'`);
			return [
				word,
				variants.map((variant) => {
					try {
						return parsePhonemePronunciation(variant).join(" ");
					} catch (cause) {
						throw new Error(`Invalid pronunciation for '${word}': ${variant}`, { cause });
					}
				}),
			];
		}),
	);
}

// Shared validation entry point for the Python curated-list generator.
if (require.main === module) {
	const sourcePath = process.argv[2];
	if (!sourcePath) throw new Error("A CMUDict JSON path is required");
	const payload = JSON.parse(readFileSync(sourcePath, "utf8"));
	process.stdout.write(JSON.stringify(normalizeDictionaryPronunciations(payload.data)));
}
