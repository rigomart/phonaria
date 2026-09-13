import { PhonemeIpaMap, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import type { TranscriptionOutput, TranscriptionPhoneme } from "@phonaria/transcription-service";
import type {
	TranscribedPhoneme,
	TranscribedSyllable,
	TranscribedWord,
	TranscriptionResult,
} from "./types/g2p";

export function transformToTranscriptionResult(
	data: TranscriptionOutput,
	originalText: string,
): TranscriptionResult {
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
	phoneme: TranscriptionPhoneme,
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

function isKnownPhoneme(phoneme: TranscriptionPhoneme): phoneme is TranscriptionPhoneme & {
	phonemeId: PhonemeSymbolId;
	ipa: string;
} {
	if (typeof phoneme.phonemeId !== "string") {
		return false;
	}
	return phoneme.phonemeId in PhonemeIpaMap;
}
