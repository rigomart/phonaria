import type {
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
} from "./core/articulatory-features";
import type {
	ConsonantSymbolId,
	DiphthongSymbolId,
	MonophthongSymbolId,
	PhonemeSymbolId,
} from "./core/ipa-registry";
import type {
	ConsonantArticulation,
	DiphthongVowelArticulation,
	MonophthongVowelArticulation,
	PhonemeArticulation,
} from "./core/phoneme-articulations";
import type { TargetLanguage } from "./core/types";
import {
	ConsonantArticulationRegistry,
	DiphthongVowelArticulationRegistry,
	FeatureValueByPhonemeRegistry,
	MonophthongVowelArticulationRegistry,
	PhonemeArticulationRegistry,
} from "./en/phoneme-articulations";
import {
	SpanishConsonantArticulationRegistry,
	SpanishDiphthongVowelArticulationRegistry,
	SpanishFeatureValueByPhonemeRegistry,
	SpanishMonophthongVowelArticulationRegistry,
	SpanishPhonemeArticulationRegistry,
} from "./es/phoneme-articulations";

export type LanguageConsonantArticulationRegistry = Partial<
	Record<ConsonantSymbolId, ConsonantArticulation>
>;

export type LanguageMonophthongVowelArticulationRegistry = Partial<
	Record<MonophthongSymbolId, MonophthongVowelArticulation>
>;

export type LanguageDiphthongVowelArticulationRegistry = Partial<
	Record<DiphthongSymbolId, DiphthongVowelArticulation>
>;

export type LanguagePhonemeArticulationRegistry = Partial<
	Record<PhonemeSymbolId, PhonemeArticulation>
>;

export type LanguageFeatureValueByPhonemeRegistry = {
	[K in PhonemeArticulatoryFeatureKey]: Partial<
		Record<PhonemeSymbolId, PhonemeArticulatoryFeatures[K]>
	>;
};

const languageConsonantArticulationRegistry: Record<
	TargetLanguage,
	LanguageConsonantArticulationRegistry
> = {
	en: ConsonantArticulationRegistry,
	es: SpanishConsonantArticulationRegistry,
};

const languageMonophthongArticulationRegistry: Record<
	TargetLanguage,
	LanguageMonophthongVowelArticulationRegistry
> = {
	en: MonophthongVowelArticulationRegistry,
	es: SpanishMonophthongVowelArticulationRegistry,
};

const languageDiphthongArticulationRegistry: Record<
	TargetLanguage,
	LanguageDiphthongVowelArticulationRegistry
> = {
	en: DiphthongVowelArticulationRegistry,
	es: SpanishDiphthongVowelArticulationRegistry,
};

const languagePhonemeArticulationRegistry: Record<
	TargetLanguage,
	LanguagePhonemeArticulationRegistry
> = {
	en: PhonemeArticulationRegistry,
	es: SpanishPhonemeArticulationRegistry,
};

const languageFeatureValueByPhonemeRegistry: Record<
	TargetLanguage,
	LanguageFeatureValueByPhonemeRegistry
> = {
	en: FeatureValueByPhonemeRegistry as LanguageFeatureValueByPhonemeRegistry,
	es: SpanishFeatureValueByPhonemeRegistry as LanguageFeatureValueByPhonemeRegistry,
};

export function getConsonantArticulationRegistryForLanguage(
	language: TargetLanguage,
): LanguageConsonantArticulationRegistry {
	return languageConsonantArticulationRegistry[language];
}

export function getMonophthongVowelArticulationRegistryForLanguage(
	language: TargetLanguage,
): LanguageMonophthongVowelArticulationRegistry {
	return languageMonophthongArticulationRegistry[language];
}

export function getDiphthongVowelArticulationRegistryForLanguage(
	language: TargetLanguage,
): LanguageDiphthongVowelArticulationRegistry {
	return languageDiphthongArticulationRegistry[language];
}

export function getPhonemeArticulationRegistryForLanguage(
	language: TargetLanguage,
): LanguagePhonemeArticulationRegistry {
	return languagePhonemeArticulationRegistry[language];
}

export function getFeatureValueByPhonemeRegistryForLanguage(
	language: TargetLanguage,
): LanguageFeatureValueByPhonemeRegistry {
	return languageFeatureValueByPhonemeRegistry[language];
}
