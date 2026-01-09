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
	/** All CMU ARPABET pronunciation variants (e.g., ["DH AH0", "DH IY0"]) */
	cmuVariants: string[];
	/** Syllabified pronunciation variants (matches G2PWord.variants structure) */
	variants: G2PSyllable[][];
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
	const tier1Variants = lookupTier1(normalized);
	if (tier1Variants) {
		return {
			word: normalized,
			cmuVariants: tier1Variants,
			variants: tier1Variants.map(cmuToSyllables),
			source: "tier1",
		};
	}

	// Tier 2: Lazy-loaded
	const tier2Data = await loadTier2();
	const tier2Variants = lookupTier2(tier2Data, normalized);
	if (tier2Variants) {
		return {
			word: normalized,
			cmuVariants: tier2Variants,
			variants: tier2Variants.map(cmuToSyllables),
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
		const tier1Variants = lookupTier1(normalized);
		if (tier1Variants) {
			found.set(normalized, {
				word: normalized,
				cmuVariants: tier1Variants,
				variants: tier1Variants.map(cmuToSyllables),
				source: "tier1",
			});
			continue;
		}

		// Check tier 2
		const tier2Variants = lookupTier2(tier2Data, normalized);
		if (tier2Variants) {
			found.set(normalized, {
				word: normalized,
				cmuVariants: tier2Variants,
				variants: tier2Variants.map(cmuToSyllables),
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
