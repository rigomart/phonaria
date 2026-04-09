/**
 * Counts the number of syllables in a CMU variant string.
 * Vowel nuclei are identified by tokens ending in a stress digit (0, 1, or 2).
 */
export function countSyllables(cmuVariant: string): number {
	return cmuVariant
		.split(" ")
		.filter((token) => token.length > 0)
		.filter((token) => /[012]$/.test(token)).length;
}

/**
 * Returns the minimum syllable count across all CMU variants for a word.
 * Some variants collapse syllables, so the minimum represents the most reduced form.
 */
export function getMinSyllableCount(cmuVariants: string[]): number {
	if (cmuVariants.length === 0) return 0;
	return Math.min(...cmuVariants.map(countSyllables));
}
