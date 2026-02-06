import type { PhonemeCategory } from "./types";

// Consonants

export const ConsonantIpaMap = {
	P: "p",
	B: "b",
	T: "t",
	D: "d",
	G: "ɡ",
	K: "k",
	DH: "ð",
	TH: "θ",
	F: "f",
	V: "v",
	H: "h",
	S: "s",
	SH: "ʃ",
	Z: "z",
	ZH: "ʒ",
	X: "x",
	YH: "ʝ",
	J: "dʒ",
	CH: "tʃ",
	M: "m",
	N: "n",
	NY: "ɲ",
	NG: "ŋ",
	L: "l",
	R: "ɹ",
	RX: "ɾ",
	RR: "r",
	Y: "j",
	W: "w",
} as const;

export type ConsonantSymbolId = keyof typeof ConsonantIpaMap;
export type ConsonantSymbolIpa = (typeof ConsonantIpaMap)[ConsonantSymbolId];

// Vowels - Monophthongs

export const MonophthongIpaMap = {
	I: "i",
	U: "u",
	AA: "a",
	IX: "ɪ",
	UX: "ʊ",
	AX: "ə",
	E: "ɛ",
	EE: "e",
	AH: "ʌ",
	O: "ɔ",
	OO: "o",
	AE: "æ",
	A: "ɑ",
	ER: "ɝ",
} as const;

export type MonophthongSymbolId = keyof typeof MonophthongIpaMap;
export type MonophthongSymbolIpa = (typeof MonophthongIpaMap)[MonophthongSymbolId];

// Vowels - Diphthongs

export const DiphthongIpaMap = {
	EI: "eɪ",
	OU: "oʊ",
	AI: "aɪ",
	AU: "aʊ",
	OI: "ɔɪ",
} as const;

export type DiphthongSymbolId = keyof typeof DiphthongIpaMap;
export type DiphthongSymbolIpa = (typeof DiphthongIpaMap)[DiphthongSymbolId];

// Vowels - All

export const VowelIpaMap = {
	...MonophthongIpaMap,
	...DiphthongIpaMap,
} as const;

export type VowelSymbolId = keyof typeof VowelIpaMap;
export type VowelSymbolIpa = (typeof VowelIpaMap)[VowelSymbolId];

// All

export const PhonemeIpaMap = {
	...ConsonantIpaMap,
	...VowelIpaMap,
} as const;

export type PhonemeSymbolId = keyof typeof PhonemeIpaMap;
export type PhonemeSymbolIpa = (typeof PhonemeIpaMap)[PhonemeSymbolId];
export type PhonemeType = "consonant" | "monophthong" | "diphthong";

// Helper functions

export function isVowelPhoneme(phonemeId: PhonemeSymbolId): boolean {
	return phonemeId in VowelIpaMap;
}

export function isConsonantPhoneme(phonemeId: PhonemeSymbolId): boolean {
	return phonemeId in ConsonantIpaMap;
}

export function getPhonemeCategory(phonemeId: PhonemeSymbolId): PhonemeCategory {
	return isVowelPhoneme(phonemeId) ? "vowel" : "consonant";
}

/**
 * Returns the type of a phoneme ("consonant", "monophthong", "diphthong")
 * based on which registry it is found in.
 */
export function getPhonemeType(phonemeId: PhonemeSymbolId): PhonemeType {
	if (phonemeId in MonophthongIpaMap) {
		return "monophthong";
	}
	if (phonemeId in DiphthongIpaMap) {
		return "diphthong";
	}
	return "consonant";
}

/**
 * Gets the IPA symbol for a phoneme ID.
 * @param phonemeId - The phoneme symbol ID.
 * @returns The IPA symbol.
 * @example
 * getIpaForPhonemeId("P") // "p"
 * getIpaForPhonemeId("EE") // "e"
 */
export function getIpaForPhonemeId(phonemeId: PhonemeSymbolId): string {
	return PhonemeIpaMap[phonemeId];
}

// Phoneme counts
export const PhonemeCount = {
	consonants: Object.keys(ConsonantIpaMap).length,
	monophthongs: Object.keys(MonophthongIpaMap).length,
	diphthongs: Object.keys(DiphthongIpaMap).length,
	get vowels() {
		return this.monophthongs + this.diphthongs;
	},
	get total() {
		return this.consonants + this.vowels;
	},
} as const;
