// Common spelling patterns for English phonemes
// Because English spelling is historically inconsistent, these represent general tendencies rather than fixed rules

import exampleWordsData from "../../data/example-words.json";
import type { PhonemeSymbolId } from "./symbols-registry";

//? Future: examples should be per pattern, also add fields for position (coda, onset, etc.)
type SpellingPattern = {
	patterns: string[];
	examples: {
		word: string;
		phonemic: string;
	}[];
};

// Import pattern data from shared JSON, cast to proper types
export const PhonemeSpellingPatternRegistry: Partial<Record<PhonemeSymbolId, SpellingPattern>> =
	exampleWordsData.patterns as Partial<Record<PhonemeSymbolId, SpellingPattern>>;
