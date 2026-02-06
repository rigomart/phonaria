import type {
	SpanishConsonantSymbolId,
	SpanishDiphthongSymbolId,
	SpanishMonophthongSymbolId,
	SpanishPhonemeSymbolId,
} from "../core/language-phoneme-inventories";
import type {
	ConsonantArticulation,
	DiphthongVowelArticulation,
	MonophthongVowelArticulation,
	PhonemeArticulation,
} from "../core/phoneme-articulations";

export type SpanishPhonemeArticulation = PhonemeArticulation;

export const SpanishConsonantArticulationRegistry: Record<
	SpanishConsonantSymbolId,
	ConsonantArticulation
> = {
	P: {
		category: "consonant",
		features: { manner: "plosive", place: "bilabial", voicing: "voiceless" },
	},
	B: {
		category: "consonant",
		features: { manner: "plosive", place: "bilabial", voicing: "voiced" },
	},
	T: {
		category: "consonant",
		features: { manner: "plosive", place: "dental", voicing: "voiceless" },
	},
	D: {
		category: "consonant",
		features: { manner: "plosive", place: "dental", voicing: "voiced" },
	},
	K: {
		category: "consonant",
		features: { manner: "plosive", place: "velar", voicing: "voiceless" },
	},
	G: {
		category: "consonant",
		features: { manner: "plosive", place: "velar", voicing: "voiced" },
	},
	F: {
		category: "consonant",
		features: { manner: "fricative", place: "labiodental", voicing: "voiceless" },
	},
	S: {
		category: "consonant",
		features: { manner: "fricative", place: "alveolar", voicing: "voiceless" },
	},
	X: {
		category: "consonant",
		features: { manner: "fricative", place: "velar", voicing: "voiceless" },
	},
	CH: {
		category: "consonant",
		features: { manner: "affricate", place: "postalveolar", voicing: "voiceless" },
	},
	M: {
		category: "consonant",
		features: { manner: "nasal", place: "bilabial", voicing: "voiced" },
	},
	N: {
		category: "consonant",
		features: { manner: "nasal", place: "alveolar", voicing: "voiced" },
	},
	NY: {
		category: "consonant",
		features: { manner: "nasal", place: "palatal", voicing: "voiced" },
	},
	L: {
		category: "consonant",
		features: { manner: "lateral-approximant", place: "alveolar", voicing: "voiced" },
	},
	RX: {
		category: "consonant",
		features: { manner: "tap", place: "alveolar", voicing: "voiced" },
	},
	RR: {
		category: "consonant",
		features: { manner: "trill", place: "alveolar", voicing: "voiced" },
	},
	YH: {
		category: "consonant",
		features: { manner: "fricative", place: "palatal", voicing: "voiced" },
	},
	Y: {
		category: "consonant",
		features: { manner: "approximant", place: "palatal", voicing: "voiced" },
	},
	W: {
		category: "consonant",
		features: { manner: "approximant", place: "labial-velar", voicing: "voiced" },
	},
};

export const SpanishMonophthongVowelArticulationRegistry: Record<
	SpanishMonophthongSymbolId,
	MonophthongVowelArticulation
> = {
	I: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "close",
			backness: "front",
			roundness: "unrounded",
			tenseness: "tense",
		},
	},
	E: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "close-mid",
			backness: "front",
			roundness: "unrounded",
			tenseness: "tense",
		},
	},
	AA: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open",
			backness: "central",
			roundness: "unrounded",
			tenseness: "tense",
		},
	},
	O: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "close-mid",
			backness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
	},
	U: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "close",
			backness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
	},
};

export const SpanishDiphthongVowelArticulationRegistry: Record<
	SpanishDiphthongSymbolId,
	DiphthongVowelArticulation
> = {};

export const SpanishPhonemeArticulationRegistry = {
	...SpanishConsonantArticulationRegistry,
	...SpanishMonophthongVowelArticulationRegistry,
	...SpanishDiphthongVowelArticulationRegistry,
} as const satisfies Record<SpanishPhonemeSymbolId, PhonemeArticulation>;
