import type { PhonemeCategory } from "./types";

// Consonants

export const ConsonantIpaRegistry = {
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

export type ConsonantSymbolId = keyof typeof ConsonantIpaRegistry;
export type ConsonantSymbolIpa = (typeof ConsonantIpaRegistry)[ConsonantSymbolId];

// Vowels - Monophthongs

export const MonophthongIpaRegistry = {
	I: "i",
	U: "u",
	AA: "a",
	IX: "ɪ",
	UX: "ʊ",
	AX: "ə",
	E: "ɛ",
	AH: "ʌ",
	O: "ɔ",
	AE: "æ",
	A: "ɑ",
	ER: "ɝ",
} as const;

export type MonophthongSymbolId = keyof typeof MonophthongIpaRegistry;
export type MonophthongSymbolIpa = (typeof MonophthongIpaRegistry)[MonophthongSymbolId];

// Vowels - Diphthongs

export const DiphthongIpaRegistry = {
	EI: "eɪ",
	OU: "oʊ",
	AI: "aɪ",
	AU: "aʊ",
	OI: "ɔɪ",
} as const;

export type DiphthongSymbolId = keyof typeof DiphthongIpaRegistry;
export type DiphthongSymbolIpa = (typeof DiphthongIpaRegistry)[DiphthongSymbolId];

// Vowels - All

export const VowelIpaRegistry = {
	...MonophthongIpaRegistry,
	...DiphthongIpaRegistry,
} as const;

export type VowelSymbolId = keyof typeof VowelIpaRegistry;
export type VowelSymbolIpa = (typeof VowelIpaRegistry)[VowelSymbolId];

// All

export const PhonemeIpaRegistry = {
	...ConsonantIpaRegistry,
	...VowelIpaRegistry,
} as const;

export type PhonemeSymbolId = keyof typeof PhonemeIpaRegistry;
export type PhonemeSymbolIpa = (typeof PhonemeIpaRegistry)[PhonemeSymbolId];

// Helper functions

export function isVowelPhoneme(phonemeId: PhonemeSymbolId): boolean {
	return phonemeId in VowelIpaRegistry;
}

export function isConsonantPhoneme(phonemeId: PhonemeSymbolId): boolean {
	return phonemeId in ConsonantIpaRegistry;
}

export function getPhonemeCategory(phonemeId: PhonemeSymbolId): PhonemeCategory {
	return isVowelPhoneme(phonemeId) ? "vowel" : "consonant";
}

/**
 * Returns the type of a phoneme ("consonant", "monophthong", "diphthong")
 * based on which registry it is found in.
 */
export function getPhonemeType(phonemeId: PhonemeSymbolId) {
	if (phonemeId in MonophthongIpaRegistry) {
		return "monophthong";
	}
	if (phonemeId in DiphthongIpaRegistry) {
		return "diphthong";
	}
	return "consonant";
}

/**
 * Gets the IPA symbol for a phoneme ID.
 * Type-safe: only accepts valid phoneme IDs.
 * @param phonemeId - The phoneme symbol ID.
 * @returns The IPA symbol.
 * @example
 * getIpaForPhonemeId("P") // "p"
 * getIpaForPhonemeId("I") // "i"
 */
export function getIpaForPhonemeId(phonemeId: PhonemeSymbolId): string {
	return PhonemeIpaRegistry[phonemeId];
}

// Phoneme counts
export const PhonemeCount = {
	consonants: Object.keys(ConsonantIpaRegistry).length,
	monophthongs: Object.keys(MonophthongIpaRegistry).length,
	diphthongs: Object.keys(DiphthongIpaRegistry).length,
	get vowels() {
		return this.monophthongs + this.diphthongs;
	},
	get total() {
		return this.consonants + this.vowels;
	},
} as const;
