import { PhonemeIpaMap, type PhonemeSymbolId } from "../../core/ipa-map";
import type { EnglishPhonemeSymbolId } from "../inventories";

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
export const CmuArpaMap = {
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
} as const satisfies Record<string, EnglishPhonemeSymbolId>;

export type CmuArpaToken = keyof typeof CmuArpaMap;

/**
 * Maps a CMU ARPA token to a phoneme symbol ID.
 * Type-safe: only accepts valid CMU ARPA tokens.
 * @param token - The CMU ARPA token to map.
 * @returns The phoneme symbol ID.
 * @example
 * getPhonemeIdForCmuArpa("P") // "P"
 * getPhonemeIdForCmuArpa("AH0") // "AX"
 */
export function getPhonemeIdForCmuArpa(token: CmuArpaToken): EnglishPhonemeSymbolId {
	return CmuArpaMap[token];
}

/**
 * Reverse lookup: gets all CMU ARPA tokens that map to a phoneme ID.
 * Returns an array since multiple tokens can map to the same phoneme (e.g., IY0, IY1, IY2).
 * @param phonemeId - The phoneme symbol ID.
 * @returns Array of CMU ARPA tokens that map to this phoneme.
 * @example
 * getCmuArpaForEnglishPhonemeId("I") // ["IY0", "IY1", "IY2"]
 * getCmuArpaForEnglishPhonemeId("P") // ["P"]
 */
export function getCmuArpaForEnglishPhonemeId(phonemeId: EnglishPhonemeSymbolId): CmuArpaToken[] {
	return Object.entries(CmuArpaMap)
		.filter(([, id]) => id === phonemeId)
		.map(([token]) => token)
		.filter(isCmuArpaToken);
}

/** Split either notation on whitespace; this does not validate sounds or stress. */
export function tokenizePronunciation(variant: string): string[] {
	return variant.trim() ? variant.trim().split(/\s+/) : [];
}

function pronunciationTokens(variant: string): string[] {
	const tokens = tokenizePronunciation(variant);
	if (!tokens.length) throw new Error("A pronunciation cannot be empty");
	return tokens;
}

/** Parse raw CMU notation, requiring exactly one 0/1/2 suffix on vowels, none on consonants. */
export function parseCmuPronunciation(variant: string): CmuArpaToken[] {
	return pronunciationTokens(variant).map((token) => {
		if (!isCmuArpaToken(token)) throw new Error(`Invalid CMU ARPA token: ${token}`);
		return token;
	});
}

function cmuTokenToPhonemeToken(token: CmuArpaToken): string {
	return CmuArpaMap[token] + (token.match(/[012]$/)?.[0] ?? "");
}

// Derive the stored-token grammar from the raw CMU mapping so both directions
// agree, including AH0 -> AX0 and AH1/AH2 -> AH1/AH2.
const cmuTokenByPhonemeToken = new Map<string, CmuArpaToken>(
	(Object.keys(CmuArpaMap) as CmuArpaToken[]).map((token) => [
		cmuTokenToPhonemeToken(token),
		token,
	]),
);

/** Validate a stored English token, including its vowel/consonant stress rules. */
export function isValidEnglishPhonemeToken(token: string): boolean {
	return cmuTokenByPhonemeToken.has(token);
}

/**
 * Parse stored English IDs, not raw CMU. Vowels require one 0/1/2 suffix,
 * consonants forbid stress; schwa is AX0 and strut is AH1 or AH2.
 * Rejects empty input and any invalid token without dropping sounds.
 * Does not enforce vowel presence or word-level stress counts.
 */
export function parsePhonemePronunciation(variant: string): string[] {
	return pronunciationTokens(variant).map((token) => {
		if (!isValidEnglishPhonemeToken(token)) {
			throw new Error(`Invalid English pronunciation token: ${token}`);
		}
		return token;
	});
}

/** Convert raw CMU to stored English IDs, preserving every sound and stress. */
export function cmuArpaVariantToPhonemeVariant(variant: string): string {
	return parseCmuPronunciation(variant).map(cmuTokenToPhonemeToken).join(" ");
}

/** Convert validated stored English IDs to raw CMU, preserving every sound and stress. */
export function phonemeVariantToCmuArpa(variant: string): string {
	return parsePhonemePronunciation(variant)
		.map((token) => cmuTokenByPhonemeToken.get(token))
		.join(" ");
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
} as const satisfies Record<EnglishPhonemeSymbolId, string>;

/**
 * Gets the standard ARPABET label for a phoneme ID (without stress markers).
 * @param phonemeId - The phoneme symbol ID.
 * @returns The standard ARPABET label.
 * @example
 * getArpabetForEnglishPhonemeId("P") // "P"
 * getArpabetForEnglishPhonemeId("AX") // "AX"
 */
export function getArpabetForEnglishPhonemeId(phonemeId: EnglishPhonemeSymbolId): string {
	return PhonemeArpabetLabel[phonemeId];
}

export function isEnglishPhonemeSymbolId(
	phonemeId: PhonemeSymbolId,
): phonemeId is EnglishPhonemeSymbolId {
	return Object.getOwnPropertyDescriptor(PhonemeArpabetLabel, phonemeId) !== undefined;
}

/**
 * Checks if a string is a valid CMU ARPA token.
 * @param token - The string to check.
 * @returns True if the token is a valid CMU ARPA token.
 */
export function isCmuArpaToken(token: string): token is CmuArpaToken {
	return Object.getOwnPropertyDescriptor(CmuArpaMap, token) !== undefined;
}

/**
 * Recognizes a core ID after removing at most one optional 0/1/2 suffix.
 * This is not pronunciation validation: P1, AX1, bare vowels, and Spanish IDs
 * can all yield a base ID. Use parsePhonemePronunciation for stored English.
 * cmudict.json stores phoneme IDs with stress (e.g., "AX0", "OU1").
 * @example
 * extractBasePhonemeId("AU1") // "AU"
 * extractBasePhonemeId("P") // "P"
 * extractBasePhonemeId("AX0") // "AX"
 */
export function tryExtractBasePhonemeId(token: string): PhonemeSymbolId | null {
	const baseId = token.replace(/[012]$/, "");
	if (Object.getOwnPropertyDescriptor(PhonemeIpaMap, baseId) === undefined) {
		return null;
	}
	return baseId as PhonemeSymbolId;
}

export function extractBasePhonemeId(token: string): PhonemeSymbolId {
	const baseId = tryExtractBasePhonemeId(token);
	if (!baseId) {
		throw new Error(`Invalid phoneme token: ${token}`);
	}
	return baseId;
}

/**
 * Legacy base-ID recognition predicate; does not validate pronunciation stress.
 * @deprecated Use tryExtractBasePhonemeId for recognition or
 * isValidEnglishPhonemeToken for stored English pronunciation validation.
 */
export function isValidPhonemeToken(token: string): boolean {
	return tryExtractBasePhonemeId(token) !== null;
}

export type PhonemeIpaConversionOptions = {
	mode?: "strict" | "tolerant";
};

/**
 * Convert stored English pronunciation IDs to IPA. Strict by default.
 * Explicit tolerant mode recognizes all core IDs with optional stress, skips
 * unknown tokens, ignores stress validity, and renders empty input as "".
 * Neither mode interprets raw CMU notation; stress marks are omitted in IPA.
 */
export function phonemeVariantToIpa(
	variant: string,
	{ mode = "strict" }: PhonemeIpaConversionOptions = {},
): string {
	if (mode === "strict") {
		return parsePhonemePronunciation(variant)
			.map((token) => PhonemeIpaMap[extractBasePhonemeId(token)])
			.join("");
	}
	return tokenizePronunciation(variant)
		.map((token) => {
			const id = tryExtractBasePhonemeId(token);
			return id ? PhonemeIpaMap[id] : "";
		})
		.join("");
}

/**
 * Legacy tolerant conversion of internal IDs (despite the CMU name).
 * @deprecated Use phonemeVariantToIpa(variant, { mode: "tolerant" }) to opt in
 * explicitly, or omit the option for strict stored-English validation.
 */
export function cmuVariantToIpa(variant: string): string {
	return phonemeVariantToIpa(variant, { mode: "tolerant" });
}
