import type {
	ConsonantSymbolId,
	DiphthongSymbolId,
	MonophthongSymbolId,
	PhonemeSymbolId,
	VowelSymbolId,
} from "../core/ipa-map";
import type { TargetAccent } from "../core/types";

const ENGLISH_CONSONANTS = [
	"P",
	"B",
	"T",
	"D",
	"K",
	"G",
	"F",
	"V",
	"TH",
	"DH",
	"S",
	"Z",
	"SH",
	"ZH",
	"H",
	"M",
	"N",
	"NG",
	"L",
	"R",
	"W",
	"Y",
	"CH",
	"J",
] as const satisfies readonly ConsonantSymbolId[];

const ENGLISH_MONOPHTHONGS = [
	"I",
	"U",
	"IX",
	"UX",
	"AX",
	"E",
	"AH",
	"O",
	"AE",
	"A",
	"ER",
] as const satisfies readonly MonophthongSymbolId[];

const ENGLISH_DIPHTHONGS = [
	"EI",
	"OU",
	"AI",
	"AU",
	"OI",
] as const satisfies readonly DiphthongSymbolId[];

const SPANISH_CONSONANTS = [
	"P",
	"B",
	"T",
	"D",
	"K",
	"G",
	"F",
	"S",
	"X",
	"CH",
	"M",
	"N",
	"NY",
	"L",
	"RX",
	"RR",
	"YH",
	"Y",
	"W",
] as const satisfies readonly ConsonantSymbolId[];

const SPANISH_MONOPHTHONGS = [
	"I",
	"EE",
	"AA",
	"OO",
	"U",
] as const satisfies readonly MonophthongSymbolId[];

const SPANISH_DIPHTHONGS = [] as const satisfies readonly DiphthongSymbolId[];

export const LanguagePhonemeInventoryMap = {
	"en-us": {
		consonants: ENGLISH_CONSONANTS,
		monophthongs: ENGLISH_MONOPHTHONGS,
		diphthongs: ENGLISH_DIPHTHONGS,
		vowels: [...ENGLISH_MONOPHTHONGS, ...ENGLISH_DIPHTHONGS],
		phonemes: [...ENGLISH_CONSONANTS, ...ENGLISH_MONOPHTHONGS, ...ENGLISH_DIPHTHONGS],
	},
	"es-419": {
		consonants: SPANISH_CONSONANTS,
		monophthongs: SPANISH_MONOPHTHONGS,
		diphthongs: SPANISH_DIPHTHONGS,
		vowels: [...SPANISH_MONOPHTHONGS, ...SPANISH_DIPHTHONGS],
		phonemes: [...SPANISH_CONSONANTS, ...SPANISH_MONOPHTHONGS, ...SPANISH_DIPHTHONGS],
	},
} as const satisfies Record<
	TargetAccent,
	{
		consonants: readonly ConsonantSymbolId[];
		monophthongs: readonly MonophthongSymbolId[];
		diphthongs: readonly DiphthongSymbolId[];
		vowels: readonly VowelSymbolId[];
		phonemes: readonly PhonemeSymbolId[];
	}
>;

type LanguagePhonemeInventoryMapType = typeof LanguagePhonemeInventoryMap;

export type LanguagePhonemeInventory<TLanguage extends TargetAccent = TargetAccent> =
	LanguagePhonemeInventoryMapType[TLanguage];

export type LanguagePhonemeSubset = keyof LanguagePhonemeInventory;

export type LanguagePhonemeId<TLanguage extends TargetAccent> =
	LanguagePhonemeInventoryMapType[TLanguage]["phonemes"][number];

export type LanguageConsonantSymbolId<TLanguage extends TargetAccent> =
	LanguagePhonemeInventoryMapType[TLanguage]["consonants"][number];

export type LanguageMonophthongSymbolId<TLanguage extends TargetAccent> =
	LanguagePhonemeInventoryMapType[TLanguage]["monophthongs"][number];

export type LanguageDiphthongSymbolId<TLanguage extends TargetAccent> =
	LanguagePhonemeInventoryMapType[TLanguage]["diphthongs"][number];

export type EnglishPhonemeSymbolId = LanguagePhonemeId<"en-us">;
export type EnglishConsonantSymbolId = LanguageConsonantSymbolId<"en-us">;
export type EnglishMonophthongSymbolId = LanguageMonophthongSymbolId<"en-us">;
export type EnglishDiphthongSymbolId = LanguageDiphthongSymbolId<"en-us">;

export type SpanishPhonemeSymbolId = LanguagePhonemeId<"es-419">;
export type SpanishConsonantSymbolId = LanguageConsonantSymbolId<"es-419">;
export type SpanishMonophthongSymbolId = LanguageMonophthongSymbolId<"es-419">;
export type SpanishDiphthongSymbolId = LanguageDiphthongSymbolId<"es-419">;

export const EnglishPhonemeInventory = LanguagePhonemeInventoryMap["en-us"];
export const SpanishPhonemeInventory = LanguagePhonemeInventoryMap["es-419"];

const languagePhonemeSets: Record<TargetAccent, ReadonlySet<PhonemeSymbolId>> = {
	"en-us": new Set(LanguagePhonemeInventoryMap["en-us"].phonemes),
	"es-419": new Set(LanguagePhonemeInventoryMap["es-419"].phonemes),
};

export function getLanguagePhonemeInventory<TLanguage extends TargetAccent>(
	language: TLanguage,
): LanguagePhonemeInventory<TLanguage> {
	return LanguagePhonemeInventoryMap[language];
}

export function getLanguagePhonemeIds<
	TLanguage extends TargetAccent,
	TSubset extends LanguagePhonemeSubset = "phonemes",
>(
	language: TLanguage,
	subset: TSubset = "phonemes" as TSubset,
): LanguagePhonemeInventory<TLanguage>[TSubset] {
	return LanguagePhonemeInventoryMap[language][subset];
}

export function isPhonemeInLanguage<TLanguage extends TargetAccent>(
	language: TLanguage,
	phonemeId: PhonemeSymbolId,
): phonemeId is LanguagePhonemeId<TLanguage> {
	return languagePhonemeSets[language].has(phonemeId);
}

export type LanguagePhonemeCount = {
	consonants: number;
	monophthongs: number;
	diphthongs: number;
	vowels: number;
	total: number;
};

function createLanguagePhonemeCount(inventory: LanguagePhonemeInventory): LanguagePhonemeCount {
	return {
		consonants: inventory.consonants.length,
		monophthongs: inventory.monophthongs.length,
		diphthongs: inventory.diphthongs.length,
		vowels: inventory.vowels.length,
		total: inventory.phonemes.length,
	};
}

const languagePhonemeCountRegistry: Record<TargetAccent, LanguagePhonemeCount> = {
	"en-us": createLanguagePhonemeCount(LanguagePhonemeInventoryMap["en-us"]),
	"es-419": createLanguagePhonemeCount(LanguagePhonemeInventoryMap["es-419"]),
};

export function getLanguagePhonemeCount(language: TargetAccent): LanguagePhonemeCount {
	return languagePhonemeCountRegistry[language];
}
