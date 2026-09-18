import type { TranscribedSyllable, TranscribedWord, TranscriptionResult } from "./types/g2p";

function formatVariantIpa(syllables: TranscribedSyllable[]): string {
	return syllables
		.map((syllable) => {
			let syllableText = "";
			if (syllable.stress === "primary") {
				syllableText += "ˈ";
			} else if (syllable.stress === "secondary") {
				syllableText += "ˌ";
			}
			syllableText += syllable.phonemes.map((p) => p.symbol).join("");
			return syllableText;
		})
		.join(".");
}

export function extractWordIpa(
	word: Pick<TranscribedWord, "source" | "variants">,
	selectedVariantIndex: number,
): string {
	if (word.source === "fallback") return "";
	const currentVariant = word.variants[selectedVariantIndex] ?? [];
	return formatVariantIpa(currentVariant);
}

export function extractIpaText(result: TranscriptionResult, selectedVariants: number[]): string {
	const ipaWords = result.words.map((word) =>
		extractWordIpa(word, selectedVariants[word.wordIndex] ?? 0),
	);

	return ipaWords.filter((w) => w.length > 0).join(" ");
}
