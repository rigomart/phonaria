import {
	type CuratedWordData,
	EnglishCuratedTop1k,
} from "@phonaria/phonetics-data/data/en/curated-1k";
import type { G2PSyllable } from "../g2p/model";
import { syllabify } from "../g2p/syllabifier";

export { tokenizeText } from "../g2p/text-processing";

let tier2Cache: CuratedWordData | null = null;

export async function loadTier2(): Promise<CuratedWordData> {
	if (!tier2Cache) {
		const module = await import("@phonaria/phonetics-data/data/en/curated-10k");
		tier2Cache = module.EnglishCuratedTop10k;
	}
	return tier2Cache;
}

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
