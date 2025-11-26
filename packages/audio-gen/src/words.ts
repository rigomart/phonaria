import {
	ContrastsByPhonemeIdRegistry,
	PhonemeAllophoneRegistry,
	PhonemeSpellingPatternRegistry,
} from "shared-data";

export type WordWithPhonemic = { word: string; phonemic: string };

function normalizeWord(word: string): string {
	return word.trim().toLowerCase();
}

function pushExamples(
	entries: WordWithPhonemic[],
	examples: ReadonlyArray<{ word: string; phonemic: string }>,
): void {
	for (const example of examples) {
		entries.push({ word: normalizeWord(example.word), phonemic: example.phonemic });
	}
}

/**
 * Collects unique words and their phonemic transcriptions from shared phoneme data.
 * Dedupes by normalized word, keeping the first encountered transcription.
 */
export function collectWordsWithPhonemic(): WordWithPhonemic[] {
	const entries: WordWithPhonemic[] = [];

	for (const pattern of Object.values(PhonemeSpellingPatternRegistry ?? {})) {
		if (pattern) pushExamples(entries, pattern.examples);
	}

	for (const matches of Object.values(ContrastsByPhonemeIdRegistry ?? {})) {
		if (!matches) continue;
		for (const match of matches) {
			for (const pair of match.minimalPairs) {
				pushExamples(entries, pair);
			}
		}
	}

	for (const variants of Object.values(PhonemeAllophoneRegistry ?? {})) {
		if (!variants) continue;
		for (const variant of variants) {
			pushExamples(entries, variant.examples);
		}
	}

	const byWord = new Map<string, WordWithPhonemic>();
	for (const entry of entries) {
		if (!byWord.has(entry.word)) {
			byWord.set(entry.word, entry);
		}
	}

	return Array.from(byWord.values()).sort((a, b) => a.word.localeCompare(b.word));
}
