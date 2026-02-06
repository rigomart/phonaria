import { PhonemeIpaMap, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import type {
	TranscribedPhoneme,
	TranscribedSyllable,
	TranscribedWord,
	TranscriptionResult,
} from "@/app/[locale]/transcription/_types/g2p";
import type { G2PResponse } from "./g2p/model";

/** Inferred types from G2P API response */
type G2PWord = G2PResponse["words"][number];
type G2PPhoneme = G2PWord["variants"][number][number]["phonemes"][number];

/**
 * Transform API response into enriched frontend format with UI-specific metadata
 * This includes wordIndex, phonemeIndex, selectedVariantIndex, and timestamp
 */
export function transformToTranscriptionResult(
	data: G2PResponse,
	originalText: string,
): TranscriptionResult {
	// Transform API response into enriched frontend format
	const words: TranscribedWord[] = data.words.map((word, wordIndex) => {
		const variants: TranscribedSyllable[][] = word.variants.map((variant) => {
			let globalPhonemeIndex = 0;
			return variant.map((syllable) => {
				const transcribedPhonemes = syllable.phonemes.map((phoneme) => {
					const transcribed = mapPhonemeToTranscribed(phoneme, wordIndex, globalPhonemeIndex);
					globalPhonemeIndex++;
					return transcribed;
				});

				return {
					phonemes: transcribedPhonemes,
					stress: syllable.stress,
				};
			});
		});

		return {
			word: word.word,
			variants,
			selectedVariantIndex: 0,
			wordIndex,
			source: word.source,
		};
	});

	return {
		originalText,
		words,
		timestamp: new Date(),
	};
}

function mapPhonemeToTranscribed(
	phoneme: G2PPhoneme,
	wordIndex: number,
	phonemeIndex: number,
): TranscribedPhoneme {
	if (isKnownPhoneme(phoneme)) {
		return {
			symbol: phoneme.ipa,
			ipa: phoneme.ipa,
			cmuToken: phoneme.cmuToken,
			phonemeId: phoneme.phonemeId,
			wordIndex,
			phonemeIndex,
		};
	}

	return {
		symbol: phoneme.cmuToken,
		cmuToken: phoneme.cmuToken,
		phonemeId: null,
		wordIndex,
		phonemeIndex,
	};
}

function isKnownPhoneme(
	phoneme: G2PPhoneme,
): phoneme is G2PPhoneme & { phonemeId: PhonemeSymbolId; ipa: string } {
	if (typeof phoneme.phonemeId !== "string") {
		return false;
	}
	return phoneme.phonemeId in PhonemeIpaMap;
}
