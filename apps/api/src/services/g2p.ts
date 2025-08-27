/**
 * G2P Service - Phonemize Implementation with Accurate Segmentation
 * Uses the phonemize npm package for grapheme-to-phoneme conversion
 * with improved phoneme segmentation to handle compound words and affricates
 */

import { phonemize } from "phonemize";
import { phonemeSegmenter } from "../lib/linguistic/index.js";
import type { G2PResponse, G2PWord } from "../schemas/g2p.js";

export interface G2PRequest {
	text: string;
}

/**
 * Main transcription function using phonemize with improved segmentation
 */
export async function transcribeText(request: G2PRequest): Promise<G2PResponse> {
	const { text } = request;

	try {
		// Use phonemize with returnArray to get token objects
		const tokens = phonemize(text, {
			returnArray: true,
			format: "ipa",
			stripStress: false,
		});

		// Group tokens by word and segment phonemes
		const wordMap = new Map<string, string[]>();
		const wordOrder: string[] = [];

		for (const token of tokens) {
			const word = token.word?.trim();
			if (!word) continue;

			if (!wordMap.has(word)) {
				wordMap.set(word, []);
				wordOrder.push(word);
			}

			// Use the improved phoneme segmenter instead of pushing the whole string
			if (token.phoneme?.trim()) {
				const segmentedPhonemes = phonemeSegmenter.segment(token.phoneme);
				console.log(`Segmented "${word}" (${token.phoneme}) -> [${segmentedPhonemes.join(", ")}]`);

				// Add all segmented phonemes to the word's phoneme array
				const existingPhonemes = wordMap.get(word)!;
				existingPhonemes.push(...segmentedPhonemes);
			}
		}

		// Convert to expected format
		const words: G2PWord[] = wordOrder.map((word) => ({
			word,
			phonemes: wordMap.get(word) || [],
		}));

		console.log(`Transcribed "${text}" -> ${words.length} words`);
		return { words };
	} catch (error) {
		console.error("G2P transcription error:", error);
		throw new Error("Failed to transcribe text");
	}
}

/**
 * Get service statistics
 */
export function getServiceStats() {
	const segmenterStats = phonemeSegmenter.getStats();
	return {
		serviceName: "phonemize-g2p",
		isHealthy: true,
		description: "Phonemize G2P service with improved phoneme segmentation",
		segmenter: segmenterStats,
	};
}

/**
 * Health check function
 */
export function isHealthy(): boolean {
	return true;
}

/**
 * Export types for consistency
 */
export type { G2PWord, G2PResponse };
