import type { TranscriptionResult } from "./types/g2p";

export function extractIpaText(result: TranscriptionResult, selectedVariants: number[]): string {
	const ipaWords = result.words.map((word) => {
		const isUnknown = word.source === "fallback";
		if (isUnknown) return "";

		const selectedVariantIndex = selectedVariants[word.wordIndex] ?? 0;
		const currentVariant = word.variants[selectedVariantIndex] ?? [];

		const syllableStrings = currentVariant.map((syllable) => {
			let syllableText = "";
			if (syllable.stress === "primary") {
				syllableText += "ˈ";
			} else if (syllable.stress === "secondary") {
				syllableText += "ˌ";
			}
			syllableText += syllable.phonemes.map((p) => p.symbol).join("");
			return syllableText;
		});

		return syllableStrings.join(".");
	});

	return ipaWords.filter((w) => w.length > 0).join(" ");
}
