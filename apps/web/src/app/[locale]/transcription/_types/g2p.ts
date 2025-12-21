import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import type {
	G2PPhoneme,
	G2PStress,
	G2PSyllable,
	G2PWord,
} from "@/app/api/g2p/_schemas/g2p-api.schema";

/**
 * Frontend types for G2P (Grapheme-to-Phoneme) functionality
 * Mirrors the API types but includes frontend-specific extensions
 */

/**
 * G2P API request structure
 */
export interface G2PRequest {
	text: string;
}

// Re-export core types from the schema to ensure alignment
export type { G2PWord, G2PSyllable, G2PPhoneme, G2PStress };

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
	/** Symbol shown in the UI (IPA if known, CMU token otherwise) */
	symbol: string;
	/** Direct IPA string when available */
	ipa?: string;
	/** Original CMU token this phoneme came from */
	cmuToken: string;
	/** Canonical phoneme ID when the token is known */
	phonemeId: PhonemeSymbolId | null;
	/** Index in the original word */
	wordIndex: number;
	/** Index in the phoneme array */
	phonemeIndex: number;
}

export interface TranscribedSyllable {
	phonemes: TranscribedPhoneme[];
	stress: G2PStress;
}

/**
 * Frontend-specific: Enhanced word with transcription metadata
 */
export interface TranscribedWord {
	/** Original word text */
	word: string;
	/** Variants with enriched phoneme metadata */
	variants: TranscribedSyllable[][];
	/** Currently selected variant index */
	selectedVariantIndex: number;
	/** Index in the original text */
	wordIndex: number;
	/** Source that provided the transcription */
	source: "cmudict" | "fallback";
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
