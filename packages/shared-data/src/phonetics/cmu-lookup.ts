import type { PhonemeSymbolId } from "./symbols-registry";

/**
 * Maps CMU ARPA tokens to phoneme symbol IDs.
 * Each stress variant (0, 1, 2) for vowels maps to the same base phoneme ID.
 */
export const CmuSymbolRegistry = {
	// Consonants
	P: "voiceless-bilabial-stop",
	B: "voiced-bilabial-stop",
	T: "voiceless-alveolar-stop",
	D: "voiced-alveolar-stop",
	K: "voiceless-velar-stop",
	G: "voiced-velar-stop",
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

	// Rhotic vowels
	ER0: "mid-central-rhotic",
	ER1: "mid-central-rhotic",
	ER2: "mid-central-rhotic",
} as const satisfies Record<string, PhonemeSymbolId>;

export type CmuArpaToken = keyof typeof CmuSymbolRegistry;

/**
 * Safely maps a CMU ARPA token to a phoneme symbol ID.
 * @param token - The CMU ARPA token string to map.
 * @returns The phoneme symbol ID, or undefined if the token is not found.
 * @example
 * getSymbolIdForCmuToken("R") // "voiceless-bilabial-stop"
 * getSymbolIdForCmuToken("AH0") // "open-mid-back-unrounded"
 * getSymbolIdForCmuToken("UNKNOWN") // undefined
 */
export function getSymbolIdForCmuToken(token: string): PhonemeSymbolId | undefined {
	return CmuSymbolRegistry[token as CmuArpaToken];
}
