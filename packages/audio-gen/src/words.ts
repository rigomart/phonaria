import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type WordWithPhonemic = {
	word: string;
	phonemic: string;
	cmuArpa?: string;
};

type WordMapping = {
	word: string;
	phonemic: string;
	cmuArpa?: string;
	status: "found" | "missing" | "multiple";
	variants?: string[];
};

type MappingsFile = {
	meta: {
		generatedAt: string;
		total: number;
		found: number;
		missing: number;
		multiple: number;
	};
	mappings: WordMapping[];
};

/**
 * Loads word mappings from the generated cmu-arpa-mappings.json file.
 * Returns unique words with their phonemic (IPA) and CMU ARPA transcriptions.
 */
export function collectWordsWithPhonemic(): WordWithPhonemic[] {
	const mappingsPath = resolve(__dirname, "..", "data", "cmu-arpa-mappings.json");
	const content = readFileSync(mappingsPath, "utf8");
	const data: MappingsFile = JSON.parse(content);

	// Dedupe by word (lowercase), keeping first occurrence
	const byWord = new Map<string, WordWithPhonemic>();
	for (const mapping of data.mappings) {
		const normalized = mapping.word.trim().toLowerCase();
		if (!byWord.has(normalized)) {
			byWord.set(normalized, {
				word: normalized,
				phonemic: mapping.phonemic,
				cmuArpa: mapping.cmuArpa,
			});
		}
	}

	return Array.from(byWord.values()).sort((a, b) => a.word.localeCompare(b.word));
}
