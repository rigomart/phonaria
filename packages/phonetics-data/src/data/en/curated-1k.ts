import curatedTop1kJson from "../../../data/en/curated/top-1k.json";

/**
 * Curated word data structure for tiered client-side lookup.
 */
export interface CuratedWordData {
	meta: {
		version: string;
		tier: string;
		wordCount: number;
		generatedAt: string;
		license: string;
		attribution: string;
		sources: { wordfreq: string; cmudict: string };
	};
	/** Word to CMU ARPABET variants mapping (each word may have multiple pronunciations) */
	words: Record<string, string[]>;
}

/**
 * Top 1,000 most frequent English words with CMU pronunciations.
 * Covers ~80% of everyday usage. Bundled inline (~22KB).
 */
export const EnglishCuratedTop1k: CuratedWordData = curatedTop1kJson;
