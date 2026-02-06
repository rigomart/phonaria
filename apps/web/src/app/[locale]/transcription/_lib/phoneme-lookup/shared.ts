/**
 * Shared utilities for tiered phoneme lookup.
 */
import { type CuratedWordData, EnglishCuratedTop1k } from "@phonaria/phonetics-data";
import type { G2PSyllable } from "../g2p/model";
import { syllabify } from "../g2p/syllabifier";

// Re-export tokenization for client-side use
export { tokenizeText } from "../g2p/text-processing";

/**
 * Tier 2 data loader with lazy initialization.
 * Cached at module level - loaded once per page lifecycle.
 * Safe to call multiple times; returns cached data after first load.
 */
let tier2Cache: CuratedWordData | null = null;

export async function loadTier2(): Promise<CuratedWordData> {
	if (!tier2Cache) {
		const module = await import("@phonaria/phonetics-data");
		tier2Cache = module.EnglishCuratedTop10k;
	}
	return tier2Cache;
}

/**
 * Convert CMU ARPABET string to syllabified structure.
 */
export function cmuToSyllables(cmuVariant: string): G2PSyllable[] {
	const tokens = cmuVariant.split(" ").filter((t) => t.length > 0);
	return syllabify(tokens);
}

/**
 * Look up a word in tier 1 (inline bundle).
 * Returns array of CMU variants or null if not found.
 */
export function lookupTier1(normalizedWord: string): string[] | null {
	return EnglishCuratedTop1k.words[normalizedWord] ?? null;
}

/**
 * Look up a word in tier 2 (lazy-loaded).
 * Returns array of CMU variants or null if not found.
 */
export function lookupTier2(tier2Data: CuratedWordData, normalizedWord: string): string[] | null {
	return tier2Data.words[normalizedWord] ?? null;
}
