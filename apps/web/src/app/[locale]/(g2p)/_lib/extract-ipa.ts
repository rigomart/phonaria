import type { TranscribedSyllable, TranscribedWord } from "../_types/g2p";

/**
 * Extracts the complete IPA transcription from a word with the selected variant
 * Includes stress markers (ˈ primary, ˌ secondary) and syllable separators (·)
 */
export function extractIpaFromWord(word: TranscribedWord, selectedVariantIndex: number): string {
	const variant = word.variants[selectedVariantIndex];
	if (!variant || word.source === "fallback") {
		return "";
	}

	return variant
		.map((syllable: TranscribedSyllable, syllableIndex: number) => {
			let syllableText = "";

			// Add stress marker
			if (syllable.stress === "primary") {
				syllableText += "ˈ";
			} else if (syllable.stress === "secondary") {
				syllableText += "ˌ";
			}

			// Add phoneme symbols
			syllableText += syllable.phonemes.map((phoneme) => phoneme.symbol).join("");

			// Add syllable separator (except for last syllable)
			if (syllableIndex < variant.length - 1) {
				syllableText += "·";
			}

			return syllableText;
		})
		.join("");
}

/**
 * Extracts the complete IPA transcription from all words in a transcription result
 * Returns space-separated word transcriptions
 */
export function extractIpaFromWords(
	words: TranscribedWord[],
	selectedVariants: Record<number, number>,
): string {
	return words
		.map((word) => {
			const variantIndex = selectedVariants[word.wordIndex] ?? 0;
			return extractIpaFromWord(word, variantIndex);
		})
		.filter((ipa) => ipa.length > 0) // Filter out "not found" words
		.join(" ");
}
