import {
	getContrastRegistryForLanguage,
	getIpaForPhonemeId,
	type MinimalPair,
	type PhonemeContrastMatch,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";

/** A sound to compare against, with minimal pairs led by the looked-up sound's word. */
export interface PhonemeComparison {
	contrastId: string;
	partnerId: PhonemeSymbolId;
	partnerIpa: string;
	pairs: readonly MinimalPair[];
}

/**
 * Sounds that form a minimal-pair contrast with `phonemeId`, each with its
 * first `pairLimit` pairs. Empty when the accent has no contrast data.
 */
export function getPhonemeComparisons(
	targetAccent: TargetAccent,
	phonemeId: PhonemeSymbolId,
	pairLimit = 2,
): PhonemeComparison[] {
	const registry = getContrastRegistryForLanguage(targetAccent) as Partial<
		Record<PhonemeSymbolId, readonly PhonemeContrastMatch[]>
	> | null;

	return (registry?.[phonemeId] ?? []).map((match) => ({
		contrastId: match.contrastId,
		partnerId: match.partnerId,
		partnerIpa: getIpaForPhonemeId(match.partnerId),
		pairs: match.minimalPairs.slice(0, pairLimit),
	}));
}
