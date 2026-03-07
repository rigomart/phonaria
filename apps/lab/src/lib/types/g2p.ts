import type { CmuStressLevel, PhonemeSymbolId } from "@phonaria/phonetics-data";

export interface TranscribedPhoneme {
	symbol: string;
	ipa?: string;
	cmuToken: string;
	phonemeId: PhonemeSymbolId | null;
	wordIndex: number;
	phonemeIndex: number;
}

export interface TranscribedSyllable {
	phonemes: TranscribedPhoneme[];
	stress: CmuStressLevel;
}

export interface TranscribedWord {
	word: string;
	variants: TranscribedSyllable[][];
	selectedVariantIndex: number;
	wordIndex: number;
	source: "cmudict" | "fallback" | "rules";
}

export interface TranscriptionResult {
	originalText: string;
	words: TranscribedWord[];
	timestamp: Date;
}
