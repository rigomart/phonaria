import type { PhonemeSymbolId } from "../core/ipa-map";
import {
	buildFeatureValueByPhoneme,
	type ConsonantArticulation,
	type DiphthongVowelArticulation,
	type FeatureValueLookup,
	type MonophthongVowelArticulation,
	type PhonemeArticulation,
} from "../core/phoneme-articulations";
import type { TargetLanguage } from "../core/types";
import { EnglishPhonemeAllophones } from "../languages/en/allophones";
import {
	EnglishConsonantArticulations,
	EnglishDiphthongArticulations,
	EnglishMonophthongArticulations,
	EnglishPhonemeArticulations,
} from "../languages/en/articulations";
import { CmuArpaMap, type CmuArpaToken, type CmuStressLevel } from "../languages/en/cmu-arpa";
import { EnglishContrastsByPhonemeId } from "../languages/en/contrasts";
import { EnglishPhonemeSpellingPatterns } from "../languages/en/patterns";
import {
	SpanishConsonantArticulations,
	SpanishDiphthongArticulations,
	SpanishMonophthongArticulations,
	SpanishPhonemeArticulations,
} from "../languages/es/articulations";
import type {
	LanguageConsonantSymbolId,
	LanguageDiphthongSymbolId,
	LanguageMonophthongSymbolId,
	LanguagePhonemeId,
} from "../languages/inventories";
import { getLanguagePhonemeIds } from "../languages/inventories";
import type { PhonemeAllophone, PhonemeContrastMatch, SpellingPattern } from "../languages/types";

// Language articulation registry types

export type LanguageConsonantArticulationRegistry<
	TLanguage extends TargetLanguage = TargetLanguage,
> = Record<LanguageConsonantSymbolId<TLanguage>, ConsonantArticulation>;

export type LanguageMonophthongVowelArticulationRegistry<
	TLanguage extends TargetLanguage = TargetLanguage,
> = Record<LanguageMonophthongSymbolId<TLanguage>, MonophthongVowelArticulation>;

export type LanguageDiphthongVowelArticulationRegistry<
	TLanguage extends TargetLanguage = TargetLanguage,
> = Record<LanguageDiphthongSymbolId<TLanguage>, DiphthongVowelArticulation>;

export type LanguagePhonemeArticulationRegistry<TLanguage extends TargetLanguage = TargetLanguage> =
	Record<LanguagePhonemeId<TLanguage>, PhonemeArticulation>;

export type LanguageFeatureValueByPhonemeRegistry<
	TLanguage extends TargetLanguage = TargetLanguage,
> = FeatureValueLookup<LanguagePhonemeId<TLanguage>>;

export type LanguageArticulationData<TLanguage extends TargetLanguage> = {
	consonants: LanguageConsonantArticulationRegistry<TLanguage>;
	monophthongs: LanguageMonophthongVowelArticulationRegistry<TLanguage>;
	diphthongs: LanguageDiphthongVowelArticulationRegistry<TLanguage>;
	phonemes: LanguagePhonemeArticulationRegistry<TLanguage>;
	featureValuesByPhoneme: LanguageFeatureValueByPhonemeRegistry<TLanguage>;
};

const EnglishLanguageArticulationData = {
	consonants: EnglishConsonantArticulations,
	monophthongs: EnglishMonophthongArticulations,
	diphthongs: EnglishDiphthongArticulations,
	phonemes: EnglishPhonemeArticulations,
	featureValuesByPhoneme: buildFeatureValueByPhoneme(
		getLanguagePhonemeIds("en"),
		EnglishPhonemeArticulations,
	),
} satisfies LanguageArticulationData<"en">;

const SpanishLanguageArticulationData = {
	consonants: SpanishConsonantArticulations,
	monophthongs: SpanishMonophthongArticulations,
	diphthongs: SpanishDiphthongArticulations,
	phonemes: SpanishPhonemeArticulations,
	featureValuesByPhoneme: buildFeatureValueByPhoneme(
		getLanguagePhonemeIds("es"),
		SpanishPhonemeArticulations,
	),
} satisfies LanguageArticulationData<"es">;

export const LanguageArticulationRegistry = {
	en: EnglishLanguageArticulationData,
	es: SpanishLanguageArticulationData,
} satisfies {
	[L in TargetLanguage]: LanguageArticulationData<L>;
};

export function getLanguageArticulationData<TLanguage extends TargetLanguage>(
	language: TLanguage,
): (typeof LanguageArticulationRegistry)[TLanguage] {
	return LanguageArticulationRegistry[language];
}

export function getConsonantArticulationRegistryForLanguage<TLanguage extends TargetLanguage>(
	language: TLanguage,
): (typeof LanguageArticulationRegistry)[TLanguage]["consonants"] {
	return getLanguageArticulationData(language).consonants;
}

export function getMonophthongVowelArticulationRegistryForLanguage<
	TLanguage extends TargetLanguage,
>(language: TLanguage): (typeof LanguageArticulationRegistry)[TLanguage]["monophthongs"] {
	return getLanguageArticulationData(language).monophthongs;
}

export function getDiphthongVowelArticulationRegistryForLanguage<TLanguage extends TargetLanguage>(
	language: TLanguage,
): (typeof LanguageArticulationRegistry)[TLanguage]["diphthongs"] {
	return getLanguageArticulationData(language).diphthongs;
}

export function getPhonemeArticulationRegistryForLanguage<TLanguage extends TargetLanguage>(
	language: TLanguage,
): (typeof LanguageArticulationRegistry)[TLanguage]["phonemes"] {
	return getLanguageArticulationData(language).phonemes;
}

export function getFeatureValueByPhonemeRegistryForLanguage<TLanguage extends TargetLanguage>(
	language: TLanguage,
): (typeof LanguageArticulationRegistry)[TLanguage]["featureValuesByPhoneme"] {
	return getLanguageArticulationData(language).featureValuesByPhoneme;
}

// Per-feature language registries.
// To add support for a new language, register its data in the relevant registry.

export const LanguageCmuArpaDataRegistry = {
	en: CmuArpaMap,
	es: null,
} as const satisfies Record<TargetLanguage, Readonly<Record<string, string>> | null>;

export const LanguageAllophoneDataRegistry = {
	en: EnglishPhonemeAllophones,
	es: null,
} as const satisfies Record<
	TargetLanguage,
	Partial<Record<PhonemeSymbolId, ReadonlyArray<PhonemeAllophone>>> | null
>;

export const LanguageContrastDataRegistry = {
	en: EnglishContrastsByPhonemeId,
	es: null,
} as const satisfies Record<
	TargetLanguage,
	Partial<Record<PhonemeSymbolId, PhonemeContrastMatch[]>> | null
>;

export const LanguageSpellingPatternDataRegistry = {
	en: EnglishPhonemeSpellingPatterns,
	es: null,
} as const satisfies Record<
	TargetLanguage,
	Partial<Record<PhonemeSymbolId, SpellingPattern>> | null
>;

export function getCmuArpaRegistryForLanguage<TLanguage extends TargetLanguage>(
	language: TLanguage,
): (typeof LanguageCmuArpaDataRegistry)[TLanguage] {
	return LanguageCmuArpaDataRegistry[language];
}

export function getAllophoneRegistryForLanguage<TLanguage extends TargetLanguage>(
	language: TLanguage,
): (typeof LanguageAllophoneDataRegistry)[TLanguage] {
	return LanguageAllophoneDataRegistry[language];
}

export function getContrastRegistryForLanguage<TLanguage extends TargetLanguage>(
	language: TLanguage,
): (typeof LanguageContrastDataRegistry)[TLanguage] {
	return LanguageContrastDataRegistry[language];
}

export function getSpellingPatternRegistryForLanguage<TLanguage extends TargetLanguage>(
	language: TLanguage,
): (typeof LanguageSpellingPatternDataRegistry)[TLanguage] {
	return LanguageSpellingPatternDataRegistry[language];
}

export type { CmuArpaToken, CmuStressLevel };
