import { PhonemeIpaRegistry, type PhonemeSymbolId } from "./ipa-registry";

/**
 * CMU stress levels for vowels.
 * - "none": Unstressed vowel (0 in CMU notation)
 * - "primary": Primary stress (1 in CMU notation)
 * - "secondary": Secondary stress (2 in CMU notation)
 */
export type CmuStressLevel = "none" | "primary" | "secondary";

/**
 * Maps CMU ARPA tokens to phoneme symbol IDs.
 * Each stress variant (0, 1, 2) for vowels maps to the same base phoneme ID.
 * Note: AH0 maps to schwa (AX), while AH1/AH2 map to strut (AH).
 */
export const CmuArpaRegistry = {
	// Consonants
	P: "P",
	B: "B",
	T: "T",
	D: "D",
	K: "K",
	G: "G",
	F: "F",
	V: "V",
	TH: "TH",
	DH: "DH",
	S: "S",
	Z: "Z",
	SH: "SH",
	ZH: "ZH",
	HH: "H",
	M: "M",
	N: "N",
	NG: "NG",
	L: "L",
	R: "R",
	W: "W",
	Y: "Y",
	CH: "CH",
	JH: "J",

	// Monophthongs
	IY0: "I",
	IY1: "I",
	IY2: "I",
	UW0: "U",
	UW1: "U",
	UW2: "U",
	IH0: "IX",
	IH1: "IX",
	IH2: "IX",
	UH0: "UX",
	UH1: "UX",
	UH2: "UX",
	AH0: "AX",
	AH1: "AH",
	AH2: "AH",
	EH0: "E",
	EH1: "E",
	EH2: "E",
	AO0: "O",
	AO1: "O",
	AO2: "O",
	AE0: "AE",
	AE1: "AE",
	AE2: "AE",
	AA0: "A",
	AA1: "A",
	AA2: "A",

	// Diphthongs
	EY0: "EI",
	EY1: "EI",
	EY2: "EI",
	OW0: "OU",
	OW1: "OU",
	OW2: "OU",
	AY0: "AI",
	AY1: "AI",
	AY2: "AI",
	AW0: "AU",
	AW1: "AU",
	AW2: "AU",
	OY0: "OI",
	OY1: "OI",
	OY2: "OI",

	// R-colored vowels
	ER0: "ER",
	ER1: "ER",
	ER2: "ER",
} as const satisfies Record<string, PhonemeSymbolId>;

export type CmuArpaToken = keyof typeof CmuArpaRegistry;

/**
 * Maps a CMU ARPA token to a phoneme symbol ID.
 * Type-safe: only accepts valid CMU ARPA tokens.
 * @param token - The CMU ARPA token to map.
 * @returns The phoneme symbol ID.
 * @example
 * getPhonemeIdForCmuArpa("P") // "P"
 * getPhonemeIdForCmuArpa("AH0") // "AX"
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
 * getCmuArpaForPhonemeId("I") // ["IY0", "IY1", "IY2"]
 * getCmuArpaForPhonemeId("P") // ["P"]
 */
export function getCmuArpaForPhonemeId(phonemeId: PhonemeSymbolId): CmuArpaToken[] {
	return Object.entries(CmuArpaRegistry)
		.filter(([, id]) => id === phonemeId)
		.map(([token]) => token as CmuArpaToken);
}

/**
 * Maps phoneme symbol IDs to standard ARPABET labels (without stress markers).
 * Used as trie keys for phoneme search.
 * Note: Some phoneme IDs differ from their ARPABET counterparts:
 * - H (phoneme) maps to HH (ARPABET)
 * - J (phoneme) maps to JH (ARPABET)
 * - Vowel IDs use phonetic notation (I, IX, EI, etc.) vs ARPABET (IY, IH, EY, etc.)
 */
export const PhonemeArpabetLabel = {
	// Consonants
	P: "P",
	B: "B",
	T: "T",
	D: "D",
	K: "K",
	G: "G",
	F: "F",
	V: "V",
	TH: "TH",
	DH: "DH",
	S: "S",
	Z: "Z",
	SH: "SH",
	ZH: "ZH",
	H: "HH",
	M: "M",
	N: "N",
	NG: "NG",
	L: "L",
	R: "R",
	W: "W",
	Y: "Y",
	CH: "CH",
	J: "JH",

	// Monophthongs
	I: "IY",
	U: "UW",
	IX: "IH",
	UX: "UH",
	AX: "AX",
	E: "EH",
	AH: "AH",
	O: "AO",
	AE: "AE",
	A: "AA",
	ER: "ER",

	// Diphthongs
	EI: "EY",
	OU: "OW",
	AI: "AY",
	AU: "AW",
	OI: "OY",
} as const satisfies Record<PhonemeSymbolId, string>;

/**
 * Gets the standard ARPABET label for a phoneme ID (without stress markers).
 * @param phonemeId - The phoneme symbol ID.
 * @returns The standard ARPABET label.
 * @example
 * getArpabetForPhonemeId("P") // "P"
 * getArpabetForPhonemeId("AX") // "AX"
 */
export function getArpabetForPhonemeId(phonemeId: PhonemeSymbolId): string {
	return PhonemeArpabetLabel[phonemeId];
}

/**
 * Checks if a string is a valid CMU ARPA token.
 * @param token - The string to check.
 * @returns True if the token is a valid CMU ARPA token.
 */
export function isCmuArpaToken(token: string): token is CmuArpaToken {
	return token in CmuArpaRegistry;
}

/**
 * Converts a CMU pronunciation variant string to an IPA string.
 * Tokens that don't map to known phonemes are skipped.
 * @param variant - A space-separated CMU pronunciation string (e.g., "P AE1 T").
 * @returns The IPA representation (e.g., "pæt").
 * @example
 * cmuVariantToIpa("P AE1 T") // "pæt"
 * cmuVariantToIpa("K AE1 T S") // "kæts"
 * cmuVariantToIpa("HH AH0 L OW1") // "həloʊ"
 */
export function cmuVariantToIpa(variant: string): string {
	const tokens = variant.split(/\s+/).filter((t) => t.length > 0);
	const ipaSymbols: string[] = [];

	for (const token of tokens) {
		if (isCmuArpaToken(token)) {
			const phonemeId = CmuArpaRegistry[token];
			const ipa = PhonemeIpaRegistry[phonemeId];
			if (ipa) {
				ipaSymbols.push(ipa);
			}
		}
	}

	return ipaSymbols.join("");
}
