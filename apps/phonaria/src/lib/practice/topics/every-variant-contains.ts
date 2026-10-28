import {
	type PhonemeSymbolId,
	tokenizePronunciation,
	tryExtractBasePhonemeId,
} from "@phonaria/phonetics-data";

/** Builds a predicate that is false for a word with no variants. */
export function everyVariantContains(sound: PhonemeSymbolId) {
	return (variants: readonly string[]): boolean =>
		variants.length > 0 &&
		variants.every((variant) =>
			tokenizePronunciation(variant).some((token) => tryExtractBasePhonemeId(token) === sound),
		);
}
