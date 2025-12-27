import type { PhonemeSymbolId } from "./ipa-registry";

/**
 * Maps CMU ARPA tokens to phoneme symbol IDs.
 * Each stress variant (0, 1, 2) for vowels maps to the same base phoneme ID.
 */
export const CmuArpaRegistry = {
	// Consonants
	P: "voiceless-bilabial-plosive",
	B: "voiced-bilabial-plosive",
	T: "voiceless-alveolar-plosive",
	D: "voiced-alveolar-plosive",
	K: "voiceless-velar-plosive",
	G: "voiced-velar-plosive",
	F: "voiceless-labiodental-fricative",
	V: "voiced-labiodental-fricative",
	TH: "voiceless-dental-fricative",
	DH: "voiced-dental-fricative",
	S: "voiceless-alveolar-fricative",
	Z: "voiced-alveolar-fricative",
	SH: "voiceless-postalveolar-fricative",
	ZH: "voiced-postalveolar-fricative",
	HH: "voiceless-glottal-fricative",
	M: "voiced-bilabial-nasal",
	N: "voiced-alveolar-nasal",
	NG: "voiced-velar-nasal",
	L: "voiced-alveolar-lateral-approximant",
	R: "voiced-postalveolar-approximant",
	W: "voiced-labial-velar-approximant",
	Y: "voiced-palatal-approximant",
	CH: "voiceless-postalveolar-affricate",
	JH: "voiced-postalveolar-affricate",

	// Monophthongs
	IY0: "close-front-unrounded",
	IY1: "close-front-unrounded",
	IY2: "close-front-unrounded",
	UW0: "close-back-rounded",
	UW1: "close-back-rounded",
	UW2: "close-back-rounded",
	IH0: "near-close-near-front-unrounded",
	IH1: "near-close-near-front-unrounded",
	IH2: "near-close-near-front-unrounded",
	UH0: "near-close-near-back-rounded",
	UH1: "near-close-near-back-rounded",
	UH2: "near-close-near-back-rounded",
	AH0: "mid-central-unrounded",
	AH1: "open-mid-back-unrounded",
	AH2: "open-mid-back-unrounded",
	EH0: "open-mid-front-unrounded",
	EH1: "open-mid-front-unrounded",
	EH2: "open-mid-front-unrounded",
	AO0: "open-mid-back-rounded",
	AO1: "open-mid-back-rounded",
	AO2: "open-mid-back-rounded",
	AE0: "near-open-front-unrounded",
	AE1: "near-open-front-unrounded",
	AE2: "near-open-front-unrounded",
	AA0: "open-back-unrounded",
	AA1: "open-back-unrounded",
	AA2: "open-back-unrounded",

	// Diphthongs
	EY0: "close-mid-front-unrounded-to-near-close-near-front-unrounded",
	EY1: "close-mid-front-unrounded-to-near-close-near-front-unrounded",
	EY2: "close-mid-front-unrounded-to-near-close-near-front-unrounded",
	OW0: "close-mid-back-rounded-to-near-close-near-back-rounded",
	OW1: "close-mid-back-rounded-to-near-close-near-back-rounded",
	OW2: "close-mid-back-rounded-to-near-close-near-back-rounded",
	AY0: "open-front-unrounded-to-near-close-near-front-unrounded",
	AY1: "open-front-unrounded-to-near-close-near-front-unrounded",
	AY2: "open-front-unrounded-to-near-close-near-front-unrounded",
	AW0: "open-front-unrounded-to-near-close-near-back-rounded",
	AW1: "open-front-unrounded-to-near-close-near-back-rounded",
	AW2: "open-front-unrounded-to-near-close-near-back-rounded",
	OY0: "open-mid-back-rounded-to-near-close-near-front-unrounded",
	OY1: "open-mid-back-rounded-to-near-close-near-front-unrounded",
	OY2: "open-mid-back-rounded-to-near-close-near-front-unrounded",

	// R-colored vowels
	ER0: "r-colored-open-mid-central",
	ER1: "r-colored-open-mid-central",
	ER2: "r-colored-open-mid-central",
} as const satisfies Record<string, PhonemeSymbolId>;

export type CmuArpaToken = keyof typeof CmuArpaRegistry;

/**
 * Maps a CMU ARPA token to a phoneme symbol ID.
 * Type-safe: only accepts valid CMU ARPA tokens.
 * @param token - The CMU ARPA token to map.
 * @returns The phoneme symbol ID.
 * @example
 * getPhonemeIdForCmuArpa("P") // "voiceless-bilabial-plosive"
 * getPhonemeIdForCmuArpa("AH0") // "mid-central-unrounded"
 */
export function getPhonemeIdForCmuArpa(token: CmuArpaToken): PhonemeSymbolId {
	return CmuArpaRegistry[token];
}

/**
 * Reverse lookup: gets all CMU ARPA tokens that map to a phoneme ID.
 * Returns an array since multiple tokens can map to the same phoneme (e.g., IY0, IY1, IY2).
 * @param phonemeId - The phoneme symbol ID.
 * @returns Array of CMU ARPA tokens that map to this phoneme.
 * @example
 * getCmuArpaForPhonemeId("close-front-unrounded") // ["IY0", "IY1", "IY2"]
 * getCmuArpaForPhonemeId("voiceless-bilabial-plosive") // ["P"]
 */
export function getCmuArpaForPhonemeId(phonemeId: PhonemeSymbolId): CmuArpaToken[] {
	return Object.entries(CmuArpaRegistry)
		.filter(([, id]) => id === phonemeId)
		.map(([token]) => token as CmuArpaToken);
}

/**
 * Maps phoneme symbol IDs to standard ARPABET labels (without stress markers).
 * Used as trie keys for phoneme search. Schwa=AX, strut=AH distinction is preserved.
 */
export const PhonemeArpabetLabel = {
	// Consonants
	"voiceless-bilabial-plosive": "P",
	"voiced-bilabial-plosive": "B",
	"voiceless-alveolar-plosive": "T",
	"voiced-alveolar-plosive": "D",
	"voiceless-velar-plosive": "K",
	"voiced-velar-plosive": "G",
	"voiceless-labiodental-fricative": "F",
	"voiced-labiodental-fricative": "V",
	"voiceless-dental-fricative": "TH",
	"voiced-dental-fricative": "DH",
	"voiceless-alveolar-fricative": "S",
	"voiced-alveolar-fricative": "Z",
	"voiceless-postalveolar-fricative": "SH",
	"voiced-postalveolar-fricative": "ZH",
	"voiceless-glottal-fricative": "HH",
	"voiced-bilabial-nasal": "M",
	"voiced-alveolar-nasal": "N",
	"voiced-velar-nasal": "NG",
	"voiced-alveolar-lateral-approximant": "L",
	"voiced-postalveolar-approximant": "R",
	"voiced-labial-velar-approximant": "W",
	"voiced-palatal-approximant": "Y",
	"voiceless-postalveolar-affricate": "CH",
	"voiced-postalveolar-affricate": "JH",

	// Monophthongs
	"close-front-unrounded": "IY",
	"close-back-rounded": "UW",
	"near-close-near-front-unrounded": "IH",
	"near-close-near-back-rounded": "UH",
	"mid-central-unrounded": "AX",
	"open-mid-front-unrounded": "EH",
	"open-mid-back-unrounded": "AH",
	"open-mid-back-rounded": "AO",
	"near-open-front-unrounded": "AE",
	"open-back-unrounded": "AA",
	"r-colored-open-mid-central": "ER",

	// Diphthongs
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": "EY",
	"close-mid-back-rounded-to-near-close-near-back-rounded": "OW",
	"open-front-unrounded-to-near-close-near-front-unrounded": "AY",
	"open-front-unrounded-to-near-close-near-back-rounded": "AW",
	"open-mid-back-rounded-to-near-close-near-front-unrounded": "OY",
} as const satisfies Record<PhonemeSymbolId, string>;

/**
 * Gets the standard ARPABET label for a phoneme ID (without stress markers).
 * @param phonemeId - The phoneme symbol ID.
 * @returns The standard ARPABET label.
 * @example
 * getArpabetForPhonemeId("voiceless-bilabial-plosive") // "P"
 * getArpabetForPhonemeId("mid-central-unrounded") // "AX"
 */
export function getArpabetForPhonemeId(phonemeId: PhonemeSymbolId): string {
	return PhonemeArpabetLabel[phonemeId];
}
