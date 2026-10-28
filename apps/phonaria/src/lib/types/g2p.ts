import type { CmuStressLevel, PhonemeSymbolId } from "@phonaria/phonetics-data";
import type { SpellingSuggestion } from "@/lib/transcription/spelling-suggestion";

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
	wordIndex: number;
	source: "cmudict" | "fallback";
}

export interface TranscriptionResult {
	originalText: string;
	words: TranscribedWord[];
	timestamp: Date;
	spellingSuggestion?: SpellingSuggestion | null;
}
