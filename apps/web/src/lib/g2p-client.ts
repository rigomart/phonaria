/**
 * G2P API client and utilities
 */

import { consonants, type IpaPhoneme, vowels } from "shared-data";
import { createApiClient } from "@/lib/api-client";
import {
	type G2PRequestData,
	type G2PResponseData,
	g2pRequestSchema,
	g2pResponseSchema,
} from "@/lib/schemas/g2p";
import type { TranscribedPhoneme, TranscribedWord, TranscriptionResult } from "@/types/g2p";

// Create phoneme lookup map for quick access
const phonemeMap = new Map<string, IpaPhoneme>();
[...consonants, ...vowels].forEach((phoneme) => {
	phonemeMap.set(phoneme.symbol, phoneme);
});

/**
 * G2P API client instance
 */
const g2pApiClient = createApiClient({
	baseUrl: "", // Use relative URLs for internal API routes
	defaultHeaders: {
		"Content-Type": "application/json",
	},
	timeout: 15000, // 15 seconds for G2P processing
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
		const phonemes: TranscribedPhoneme[] = word.phonemes.map((symbol, phonemeIndex) => {
			const phonemeData = phonemeMap.get(symbol);
			return {
				symbol,
				wordIndex,
				phonemeIndex,
				phonemeData,
				isKnown: !!phonemeData,
			};
		});

		return {
			word: word.word,
			phonemes,
			wordIndex,
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

/**
 * Get phoneme data by IPA symbol
 */
export function getPhonemeBySymbol(symbol: string): IpaPhoneme | undefined {
	return phonemeMap.get(symbol);
}

/**
 * Check if a phoneme exists in our database
 */
export function isKnownPhoneme(symbol: string): boolean {
	return phonemeMap.has(symbol);
}

/**
 * Get all available phonemes for reference
 */
export function getAllPhonemes(): IpaPhoneme[] {
	return [...consonants, ...vowels];
}

/**
 * Update G2P API base URL (useful for different environments)
 */
export function setG2PApiUrl(baseUrl: string): void {
	g2pApiClient.setBaseUrl(baseUrl);
}
