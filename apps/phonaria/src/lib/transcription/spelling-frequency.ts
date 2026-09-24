import { loadTier2 } from "@/lib/phoneme-lookup/shared";
import type { SpellingFrequency } from "./spelling-suggestion";

let curatedRanks: Map<string, number> | null = null;

async function loadCuratedRanks(): Promise<Map<string, number>> {
	if (curatedRanks) return curatedRanks;
	const tier2 = await loadTier2();
	curatedRanks = new Map(Object.keys(tier2.words).map((word, index) => [word, index]));
	return curatedRanks;
}

/**
 * Frequency evidence from the curated top-10k. A word outside it gets no rank: the list
 * has nothing to say about it, which is not the same as knowing it is rare.
 */
export async function loadSpellingFrequency(): Promise<SpellingFrequency> {
	const rankByWord = await loadCuratedRanks();
	return {
		rank(word) {
			return rankByWord.get(word.toLowerCase()) ?? null;
		},
	};
}
