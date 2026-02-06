import type {
	LanguageConsonantSymbolId,
	LanguageDiphthongSymbolId,
	LanguageMonophthongSymbolId,
	LanguagePhonemeId,
} from "./core/language-phoneme-inventories";
import { getLanguagePhonemeIds } from "./core/language-phoneme-inventories";
import {
	buildFeatureValueByPhoneme,
	type ConsonantArticulation,
	type DiphthongVowelArticulation,
	type FeatureValueLookup,
	type MonophthongVowelArticulation,
	type PhonemeArticulation,
} from "./core/phoneme-articulations";
import type { TargetLanguage } from "./core/types";
import {
	ConsonantArticulationRegistry,
	DiphthongVowelArticulationRegistry,
	MonophthongVowelArticulationRegistry,
	PhonemeArticulationRegistry,
} from "./en/phoneme-articulations";
import {
	SpanishConsonantArticulationRegistry,
	SpanishDiphthongVowelArticulationRegistry,
	SpanishMonophthongVowelArticulationRegistry,
	SpanishPhonemeArticulationRegistry,
} from "./es/phoneme-articulations";

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
	consonants: ConsonantArticulationRegistry,
	monophthongs: MonophthongVowelArticulationRegistry,
	diphthongs: DiphthongVowelArticulationRegistry,
	phonemes: PhonemeArticulationRegistry,
	featureValuesByPhoneme: buildFeatureValueByPhoneme(
		getLanguagePhonemeIds("en"),
		PhonemeArticulationRegistry,
	),
} satisfies LanguageArticulationData<"en">;

const SpanishLanguageArticulationData = {
	consonants: SpanishConsonantArticulationRegistry,
	monophthongs: SpanishMonophthongVowelArticulationRegistry,
	diphthongs: SpanishDiphthongVowelArticulationRegistry,
	phonemes: SpanishPhonemeArticulationRegistry,
	featureValuesByPhoneme: buildFeatureValueByPhoneme(
		getLanguagePhonemeIds("es"),
		SpanishPhonemeArticulationRegistry,
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
