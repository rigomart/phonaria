/**
 * G2P Service - Phase 1.5 Implementation
 * Uses hybrid dictionary (core + extended) for fast startup and full coverage
 */

import type { G2PResponse, G2PWord } from "../schemas/g2p.js";
import { HybridDictionaryG2P } from "./hybrid-dictionary-g2p.js";

export interface G2PRequest {
	text: string;
}

// Single service instance - will be initialized on first use
const hybridDictionaryService = new HybridDictionaryG2P();

/**
 * Main transcription function using hybrid dictionary approach
 */
export async function transcribeText(request: G2PRequest): Promise<G2PResponse> {
	const { text } = request;

	if (!text?.trim()) {
		throw new Error("Text cannot be empty");
	}

	if (text.length > 500) {
		throw new Error("Text too long (maximum 500 characters)");
	}

	try {
		// Use the hybrid dictionary service
		const result = await hybridDictionaryService.transcribe(text);

		// Log for monitoring
		console.log(`Transcribed "${text}" -> ${result.words.length} words`);

		return result;
	} catch (error) {
		console.error("G2P transcription error:", error);
		throw new Error("Failed to transcribe text");
	}
}

/**
 * Get service statistics (useful for debugging and health checks)
 */
export function getServiceStats() {
	return hybridDictionaryService.getStats();
}

/**
 * Health check function
 */
export function isHealthy(): boolean {
	const stats = hybridDictionaryService.getStats();
	return stats.isHealthy;
}

/**
 * Export types for consistency
 */
export type { G2PWord, G2PResponse };
