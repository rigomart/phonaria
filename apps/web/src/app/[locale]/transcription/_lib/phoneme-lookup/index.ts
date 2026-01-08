/**
 * Tiered client-side phoneme lookup.
 *
 * Provides instant lookups for common words before falling back to server.
 * - Tier 1: Top 1,000 words (~22KB, bundled inline)
 * - Tier 2: Top 10,000 words (~273KB, lazy-loaded)
 * - Tier 3: Server fallback (full 130k CMUDict via PostgreSQL)
 */
import type { G2PSyllable } from "../g2p/model";
import { cmuToSyllables, loadTier2, lookupTier1, lookupTier2 } from "./shared";

export type LookupSource = "tier1" | "tier2" | "server";

export interface WordLookupResult {
	/** Original word (lowercase) */
	word: string;
	/** CMU ARPABET pronunciation string (e.g., "HH AH0 L OW1") */
	cmu: string;
	/** Syllabified pronunciation */
	syllables: G2PSyllable[];
	/** Which tier provided this result */
	source: LookupSource;
}

export interface BatchLookupResult {
	/** Words found in client tiers, keyed by lowercase word */
	found: Map<string, WordLookupResult>;
	/** Original words not found in client tiers (preserves original casing for server) */
	missing: string[];
}

/**
 * Look up a single word through client-side tiers.
 * Returns null if not found (needs server lookup).
 */
export async function lookupWordClient(word: string): Promise<WordLookupResult | null> {
	const normalized = word.toLowerCase().trim();
	if (!normalized) return null;

	// Tier 1: Inline bundle
	const tier1Cmu = lookupTier1(normalized);
	if (tier1Cmu) {
		return {
			word: normalized,
			cmu: tier1Cmu,
			syllables: cmuToSyllables(tier1Cmu),
			source: "tier1",
		};
	}

	// Tier 2: Lazy-loaded
	const tier2Data = await loadTier2();
	const tier2Cmu = lookupTier2(tier2Data, normalized);
	if (tier2Cmu) {
		return {
			word: normalized,
			cmu: tier2Cmu,
			syllables: cmuToSyllables(tier2Cmu),
			source: "tier2",
		};
	}

	return null;
}

/**
 * Batch lookup for multiple words.
 * Returns found words (with source tier) and list of missing words for server.
 * More efficient than calling lookupWordClient in a loop - loads tier 2 once.
 */
export async function batchLookup(words: string[]): Promise<BatchLookupResult> {
	const found = new Map<string, WordLookupResult>();
	const missing: string[] = [];
	const seen = new Set<string>();

	// Pre-load tier 2 once for all lookups
	const tier2Data = await loadTier2();

	for (const word of words) {
		const normalized = word.toLowerCase().trim();
		if (!normalized) continue;

		// Skip if already processed (handles duplicates in both found and missing)
		if (seen.has(normalized)) continue;
		seen.add(normalized);

		// Check tier 1
		const tier1Cmu = lookupTier1(normalized);
		if (tier1Cmu) {
			found.set(normalized, {
				word: normalized,
				cmu: tier1Cmu,
				syllables: cmuToSyllables(tier1Cmu),
				source: "tier1",
			});
			continue;
		}

		// Check tier 2
		const tier2Cmu = lookupTier2(tier2Data, normalized);
		if (tier2Cmu) {
			found.set(normalized, {
				word: normalized,
				cmu: tier2Cmu,
				syllables: cmuToSyllables(tier2Cmu),
				source: "tier2",
			});
			continue;
		}

		// Not found - need server lookup
		missing.push(word);
	}

	return { found, missing };
}

// Re-export shared utilities for convenience
export { tokenizeText } from "./shared";
