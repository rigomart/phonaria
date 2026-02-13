import type { CmuStressLevel, PhonemeSymbolId } from "@phonaria/phonetics-data";

/**
 * Frontend types for G2P (Grapheme-to-Phoneme) functionality
 * API types are inferred from the Eden client - these are frontend-specific extensions
 */

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
	stress: CmuStressLevel;
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
	source: "cmudict" | "fallback" | "rules";
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
