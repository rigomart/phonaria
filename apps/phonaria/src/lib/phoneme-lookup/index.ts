import type { G2PSyllable } from "../g2p/model";
import { cmuToSyllables, loadTier2, lookupTier1, lookupTier2 } from "./shared";

export type LookupSource = "tier1" | "tier2";

export interface WordLookupResult {
	word: string;
	cmuVariants: string[];
	variants: G2PSyllable[][];
	source: LookupSource;
}

export interface BatchLookupResult {
	found: Map<string, WordLookupResult>;
	missing: string[];
}

export async function lookupWordClient(word: string): Promise<WordLookupResult | null> {
	const normalized = word.toLowerCase().trim();
	if (!normalized) return null;

	const tier1Variants = lookupTier1(normalized);
	if (tier1Variants) {
		return {
			word: normalized,
			cmuVariants: tier1Variants,
			variants: tier1Variants.map(cmuToSyllables),
			source: "tier1",
		};
	}

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

export async function batchLookup(words: string[]): Promise<BatchLookupResult> {
	const found = new Map<string, WordLookupResult>();
	const missing: string[] = [];
	const seen = new Set<string>();

	const tier2Data = await loadTier2();

	for (const word of words) {
		const normalized = word.toLowerCase().trim();
		if (!normalized) continue;

		if (seen.has(normalized)) continue;
		seen.add(normalized);

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

		missing.push(word);
	}

	return { found, missing };
}

export { tokenizeText } from "./shared";
