import type { CmuStressLevel, PhonemeSymbolId } from "@phonaria/phonetics-data";

export interface SpanishPhoneme {
	phonemeId: PhonemeSymbolId;
	ipa: string;
}

export interface SpanishSyllable {
	phonemes: SpanishPhoneme[];
	stress: CmuStressLevel;
}
