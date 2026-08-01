import {
	type CuratedWordData,
	EnglishCuratedTop1k,
} from "@phonaria/phonetics-data/data/en/curated-1k";
import type { G2PSyllable } from "../g2p/model";
import { syllabify } from "../g2p/syllabifier";
import { createRetryableLoader } from "../retryable-loader";

export { tokenizeText } from "../g2p/text-processing";

/**
 * Tier 2 is a lazy chunk: fetched at most once, shared by concurrent callers,
 * and retryable after a failed load so callers can offer a working Retry.
 */
export const loadTier2: () => Promise<CuratedWordData> = createRetryableLoader(() =>
	import("@phonaria/phonetics-data/data/en/curated-10k").then(
		(module) => module.EnglishCuratedTop10k,
	),
);

export function cmuToSyllables(cmuVariant: string): G2PSyllable[] {
	const tokens = cmuVariant.split(" ").filter((t) => t.length > 0);
	return syllabify(tokens);
}

export function lookupTier1(normalizedWord: string): string[] | null {
	return EnglishCuratedTop1k.words[normalizedWord] ?? null;
}

export function lookupTier2(tier2Data: CuratedWordData, normalizedWord: string): string[] | null {
	return tier2Data.words[normalizedWord] ?? null;
}
