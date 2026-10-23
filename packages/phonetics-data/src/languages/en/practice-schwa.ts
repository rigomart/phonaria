import practiceSchwaJson from "../../../data/en/practice-schwa.json";

export interface PracticeWordEntry {
	readonly word: string;
	readonly variant: string;
}

export const EnglishPracticeSchwa: readonly PracticeWordEntry[] = practiceSchwaJson;

/** Rejects missing, ambiguous, changed or duplicate pinned dictionary entries. */
export function validatePracticeEntries(
	entries: readonly PracticeWordEntry[],
	words: Readonly<Record<string, readonly string[]>>,
): void {
	const seen = new Set<string>();
	for (const { word, variant } of entries) {
		if (seen.has(word)) throw new Error(`Duplicate Practice word: "${word}"`);
		seen.add(word);
		const forms = words[word];
		if (forms?.length !== 1 || forms[0] !== variant) {
			throw new Error(
				`Pinned Practice pronunciation no longer matches the dictionary for "${word}"`,
			);
		}
	}
}
