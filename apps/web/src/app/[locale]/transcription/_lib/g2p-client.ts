import { PhonemeIpaRegistry, type PhonemeSymbolId } from "shared-data";
import type {
	G2PPhoneme,
	TranscribedPhoneme,
	TranscribedSyllable,
	TranscribedWord,
	TranscriptionResult,
} from "@/app/[locale]/transcription/_types/g2p";
import { createApiClient } from "@/lib/api/api-client";
import {
	type G2PRequestData,
	type G2PResponseData,
	g2pRequestSchema,
	g2pResponseSchema,
} from "./g2p-schema";

/**
 * G2P API client instance
 */
const g2pApiClient = createApiClient({
	baseUrl: "",
	defaultHeaders: {
		"Content-Type": "application/json",
	},
	timeout: 15000,
});

/**
 * Transform API response into enriched frontend format
 */
function transformG2PResponse(
	response: G2PResponseData,
	originalText: string,
): TranscriptionResult {
	const words: TranscribedWord[] = response.words.map((word, wordIndex) => {
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

/**
 * Main G2P client function
 * Converts text to phonemic transcription with enhanced metadata
 */
export async function transcribeText(text: string): Promise<TranscriptionResult> {
	if (!text.trim()) {
		throw new Error("Text cannot be empty");
	}

	const request: G2PRequestData = { text: text.trim() };
	const response = await g2pApiClient.post(
		"/api/g2p",
		g2pRequestSchema,
		g2pResponseSchema,
		request,
	);
	return transformG2PResponse(response, text);
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
