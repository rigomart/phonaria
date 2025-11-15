/**
 * G2P API client and utilities
 */

import type { PhonemeSymbolId } from "shared-data";
import type {
	G2PPhoneme,
	TranscribedPhoneme,
	TranscribedWord,
	TranscriptionResult,
} from "@/app/[locale]/(g2p)/_types/g2p";
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
 * Make a validated request to the G2P API
 */
async function callG2PAPI(request: G2PRequestData): Promise<G2PResponseData> {
	return g2pApiClient.post("/api/g2p", g2pRequestSchema, g2pResponseSchema, request);
}

/**
 * Transform API response into enriched frontend format
 */
function transformG2PResponse(
	response: G2PResponseData,
	originalText: string,
): TranscriptionResult {
	const words: TranscribedWord[] = response.words.map((word, wordIndex) => {
		const variants: TranscribedPhoneme[][] = word.variants.map((variant) =>
			variant.map((phoneme, phonemeIndex) =>
				mapPhonemeToTranscribed(phoneme, wordIndex, phonemeIndex),
			),
		);

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
	const response = await callG2PAPI(request);
	return transformG2PResponse(response, text);
}

function mapPhonemeToTranscribed(
	phoneme: G2PPhoneme,
	wordIndex: number,
	phonemeIndex: number,
): TranscribedPhoneme {
	if ("ipa" in phoneme && phoneme.phonemeId) {
		return {
			symbol: phoneme.ipa,
			ipa: phoneme.ipa,
			cmuToken: phoneme.cmuToken,
			phonemeId: phoneme.phonemeId as PhonemeSymbolId,
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
