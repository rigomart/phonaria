/**
 * Frontend types for G2P (Grapheme-to-Phoneme) functionality
 * Mirrors the API types but includes frontend-specific extensions
 */

import type { IpaPhoneme } from "shared-data";

/**
 * G2P API request structure
 */
export interface G2PRequest {
	text: string;
}

/**
 * Single word with its phonemic transcription
 */
export interface G2PWord {
	word: string;
	variants: string[][];
}

/**
 * G2P API response structure
 */
export interface G2PResponse {
	words: G2PWord[];
}

/**
 * G2P API error structure
 */
export interface G2PError {
	error: string;
	message: string;
}

/**
 * Frontend-specific: Enhanced phoneme with metadata for UI display
 */
export interface TranscribedPhoneme {
	/** IPA symbol */
	symbol: string;
	/** Index in the original word */
	wordIndex: number;
	/** Index in the phoneme array */
	phonemeIndex: number;
	/** Reference to full phoneme data if found */
	phonemeData?: IpaPhoneme;
	/** Whether this phoneme exists in our phoneme database */
	isKnown: boolean;
}

/**
 * Frontend-specific: Enhanced word with transcription metadata
 */
export interface TranscribedWord {
	/** Original word text */
	word: string;
	/** Variants with enriched phoneme metadata */
	variants: TranscribedPhoneme[][];
	/** Currently selected variant index */
	selectedVariantIndex: number;
	/** Index in the original text */
	wordIndex: number;
}

/**
 * Frontend-specific: Complete transcription result with metadata
 */
export interface TranscriptionResult {
	/** Original input text */
	originalText: string;
	/** Enhanced words with phoneme metadata */
	words: TranscribedWord[];
	/** Timestamp when transcription was generated */
	timestamp: Date;
}
