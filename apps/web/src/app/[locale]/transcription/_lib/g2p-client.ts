import { PhonemeIpaRegistry, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import type {
	G2PPhoneme,
	TranscribedPhoneme,
	TranscribedSyllable,
	TranscribedWord,
	TranscriptionResult,
} from "@/app/[locale]/transcription/_types/g2p";
import { api } from "@/lib/eden/client";

/**
 * Main G2P client function
 * Converts text to phonemic transcription with enhanced metadata
 */
export async function transcribeText(text: string): Promise<TranscriptionResult> {
	if (!text.trim()) {
		throw new Error("Text cannot be empty");
	}

	const { data, error } = await api.g2p.post({ text: text.trim() });

	if (error) {
		const message =
			error.value && typeof error.value === "object" && "message" in error.value
				? String(error.value.message)
				: "Failed to transcribe text";
		throw new Error(message);
	}

	if (!data || !("words" in data)) {
		throw new Error("No data received from transcription service");
	}

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
		originalText: text,
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
	return phoneme.phonemeId in PhonemeIpaRegistry;
}
