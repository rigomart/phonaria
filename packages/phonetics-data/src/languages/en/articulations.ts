import type {
	ConsonantArticulation,
	DiphthongVowelArticulation,
	MonophthongVowelArticulation,
	PhonemeArticulation,
	VowelType,
} from "../../core/phoneme-articulations";
import type {
	EnglishConsonantSymbolId,
	EnglishDiphthongSymbolId,
	EnglishMonophthongSymbolId,
	EnglishPhonemeSymbolId,
} from "../inventories";

export type { PhonemeArticulation, VowelType };

export const EnglishConsonantArticulations: Record<
	EnglishConsonantSymbolId,
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
		features: { manner: "plosive", place: "alveolar", voicing: "voiceless" },
	},
	D: {
		category: "consonant",
		features: { manner: "plosive", place: "alveolar", voicing: "voiced" },
	},
	G: {
		category: "consonant",
		features: { manner: "plosive", place: "velar", voicing: "voiced" },
	},
	K: {
		category: "consonant",
		features: { manner: "plosive", place: "velar", voicing: "voiceless" },
	},
	DH: {
		category: "consonant",
		features: { manner: "fricative", place: "dental", voicing: "voiced" },
	},
	TH: {
		category: "consonant",
		features: { manner: "fricative", place: "dental", voicing: "voiceless" },
	},
	F: {
		category: "consonant",
		features: { manner: "fricative", place: "labiodental", voicing: "voiceless" },
	},
	V: {
		category: "consonant",
		features: { manner: "fricative", place: "labiodental", voicing: "voiced" },
	},
	H: {
		category: "consonant",
		features: { manner: "fricative", place: "glottal", voicing: "voiceless" },
	},
	S: {
		category: "consonant",
		features: { manner: "fricative", place: "alveolar", voicing: "voiceless" },
	},
	SH: {
		category: "consonant",
		features: { manner: "fricative", place: "postalveolar", voicing: "voiceless" },
	},
	Z: {
		category: "consonant",
		features: { manner: "fricative", place: "alveolar", voicing: "voiced" },
	},
	ZH: {
		category: "consonant",
		features: { manner: "fricative", place: "postalveolar", voicing: "voiced" },
	},
	J: {
		category: "consonant",
		features: { manner: "affricate", place: "postalveolar", voicing: "voiced" },
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
	NG: {
		category: "consonant",
		features: { manner: "nasal", place: "velar", voicing: "voiced" },
	},
	L: {
		category: "consonant",
		features: { manner: "lateral-approximant", place: "alveolar", voicing: "voiced" },
	},
	R: {
		category: "consonant",
		features: { manner: "approximant", place: "postalveolar", voicing: "voiced" },
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

// Monophthong vowel articulations

export const EnglishMonophthongArticulations: Record<
	EnglishMonophthongSymbolId,
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
	IX: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "near-close",
			backness: "near-front",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	UX: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "near-close",
			backness: "near-back",
			roundness: "rounded",
			tenseness: "lax",
		},
	},
	AX: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "mid",
			backness: "central",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	E: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open-mid",
			backness: "front",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	AH: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open-mid",
			backness: "back",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	O: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open-mid",
			backness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
	},
	AE: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "near-open",
			backness: "front",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	A: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open",
			backness: "back",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	ER: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open-mid",
			backness: "central",
			roundness: "unrounded",
			tenseness: "tense",
			rhoticity: "r-colored",
		},
	},
};

// Diphthong vowel articulations

export const EnglishDiphthongArticulations: Record<
	EnglishDiphthongSymbolId,
	DiphthongVowelArticulation
> = {
	EI: {
		category: "vowel",
		vowelType: "diphthong",
		features: {
			height: "close-mid",
			backness: "front",
			roundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
	OU: {
		category: "vowel",
		vowelType: "diphthong",
		features: {
			height: "close-mid",
			backness: "back",
			roundness: "rounded",
			targetHeight: "near-close",
			targetBackness: "near-back",
			targetRoundness: "rounded",
		},
	},
	AI: {
		category: "vowel",
		vowelType: "diphthong",
		features: {
			height: "open",
			backness: "front",
			roundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
	AU: {
		category: "vowel",
		vowelType: "diphthong",
		features: {
			height: "open",
			backness: "front",
			roundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-back",
			targetRoundness: "rounded",
		},
	},
	OI: {
		category: "vowel",
		vowelType: "diphthong",
		features: {
			height: "open-mid",
			backness: "back",
			roundness: "rounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
};

export const EnglishPhonemeArticulations = {
	...EnglishConsonantArticulations,
	...EnglishMonophthongArticulations,
	...EnglishDiphthongArticulations,
} as const satisfies Record<EnglishPhonemeSymbolId, PhonemeArticulation>;
