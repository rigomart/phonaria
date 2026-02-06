import curatedTop1kJson from "../data/en/curated/top-1k.json";
import curatedTop10kJson from "../data/en/curated/top-10k.json";
import cmudictJson from "../data/en/dict/cmudict.json";
import cmudictStatsJson from "../data/en/dict/cmudict-stats.json";
import type { TargetLanguage } from "./core/types";
import type { CmudictPayload, CmudictStatsPayload } from "./dict/types";

export const EnglishCmudictData = cmudictJson as CmudictPayload;
export const EnglishCmudictStatsData = cmudictStatsJson as CmudictStatsPayload;

/**
 * Curated word data structure for tiered client-side lookup.
 */
export interface CuratedWordData {
	meta: {
		version: string;
		tier: string;
		wordCount: number;
		generatedAt: string;
		license: string;
		attribution: string;
		sources: { wordfreq: string; cmudict: string };
	};
	/** Word to CMU ARPABET variants mapping (each word may have multiple pronunciations) */
	words: Record<string, string[]>;
}

/**
 * Top 1,000 most frequent English words with CMU pronunciations.
 * Covers ~80% of everyday usage. Bundled inline (~22KB).
 */
export const EnglishCuratedTop1k = curatedTop1kJson as CuratedWordData;

/**
 * Top 10,000 most frequent English words with CMU pronunciations.
 * Covers ~95% of learner vocabulary. Lazy-loaded (~273KB).
 */
export const EnglishCuratedTop10k = curatedTop10kJson as CuratedWordData;

export const CmudictDataByLanguage: Partial<Record<TargetLanguage, CmudictPayload>> = {
	en: EnglishCmudictData,
};

export const CmudictStatsDataByLanguage: Partial<Record<TargetLanguage, CmudictStatsPayload>> = {
	en: EnglishCmudictStatsData,
};

export const CuratedWordDataByLanguage: Partial<
	Record<
		TargetLanguage,
		{
			top1k: CuratedWordData;
			top10k: CuratedWordData;
		}
	>
> = {
	en: {
		top1k: EnglishCuratedTop1k,
		top10k: EnglishCuratedTop10k,
	},
};

export function getCmudictDataForLanguage(language: TargetLanguage): CmudictPayload | null {
	return CmudictDataByLanguage[language] ?? null;
}

export function getCmudictStatsDataForLanguage(
	language: TargetLanguage,
): CmudictStatsPayload | null {
	return CmudictStatsDataByLanguage[language] ?? null;
}

export function getCuratedWordDataForLanguage(language: TargetLanguage): {
	top1k: CuratedWordData;
	top10k: CuratedWordData;
} | null {
	return CuratedWordDataByLanguage[language] ?? null;
}

export type {
	ConsonantArticulatoryFeatures,
	ConsonantPhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
	PhonemeArticulatoryFeatureValueMap,
	VowelArticulatoryFeatures,
	VowelPhonemeArticulatoryFeatureKey,
} from "./core/articulatory-features";
export { PHONEME_ARTICULATORY_FEATURE_KEYS } from "./core/articulatory-features";
export type {
	ConsonantSymbolId,
	ConsonantSymbolIpa,
	DiphthongSymbolId,
	DiphthongSymbolIpa,
	MonophthongSymbolId,
	MonophthongSymbolIpa,
	PhonemeSymbolId,
	PhonemeSymbolIpa,
	PhonemeType,
	VowelSymbolId,
	VowelSymbolIpa,
} from "./core/ipa-registry";
export {
	ConsonantIpaRegistry,
	DiphthongIpaRegistry,
	getIpaForPhonemeId,
	getPhonemeCategory,
	getPhonemeType,
	isConsonantPhoneme,
	isVowelPhoneme,
	MonophthongIpaRegistry,
	PhonemeCount,
	PhonemeIpaRegistry,
	VowelIpaRegistry,
} from "./core/ipa-registry";
export type {
	EnglishConsonantSymbolId,
	EnglishDiphthongSymbolId,
	EnglishMonophthongSymbolId,
	EnglishPhonemeSymbolId,
	LanguageConsonantSymbolId,
	LanguageDiphthongSymbolId,
	LanguageMonophthongSymbolId,
	LanguagePhonemeCount,
	LanguagePhonemeId,
	LanguagePhonemeInventory,
	LanguagePhonemeSubset,
	SpanishConsonantSymbolId,
	SpanishDiphthongSymbolId,
	SpanishMonophthongSymbolId,
	SpanishPhonemeSymbolId,
} from "./core/language-phoneme-inventories";
export {
	EnglishPhonemeInventory,
	getLanguagePhonemeCount,
	getLanguagePhonemeIds,
	getLanguagePhonemeInventory,
	isPhonemeInLanguage,
	LanguagePhonemeInventoryRegistry,
	SpanishPhonemeInventory,
} from "./core/language-phoneme-inventories";
export type {
	ConsonantArticulation,
	DiphthongVowelArticulation,
	DiphthongVowelArticulatoryFeatures,
	FeatureValueLookup,
	MonophthongVowelArticulation,
	PhonemeArticulation,
	VowelType,
} from "./core/phoneme-articulations";
export { type PhonemeCategory, TARGET_LANGUAGES, type TargetLanguage } from "./core/types";
export type { CmudictPayload, CmudictStatsPayload, PhonemeTrieNode } from "./dict/types";
export {
	CmuArpaRegistry,
	type CmuArpaToken,
	type CmuStressLevel,
	cmuVariantToIpa,
	extractBasePhonemeId,
	getArpabetForEnglishPhonemeId,
	getCmuArpaForEnglishPhonemeId,
	getPhonemeIdForCmuArpa,
	isCmuArpaToken,
	isEnglishPhonemeSymbolId,
	isValidPhonemeToken,
	PhonemeArpabetLabel,
	tryExtractBasePhonemeId,
} from "./en/cmu-arpa-registry";
export {
	type AllophoneExample,
	EnglishPhonemeAllophoneRegistry,
	type LanguagePhonemeAllophoneRegistry,
	type PhonemeAllophone,
	type PhonemeAllophoneContextKey,
} from "./en/phoneme-allophones";
export {
	EnglishContrastsByPhonemeIdRegistry,
	type LanguagePhonemeContrastRegistry,
	type PhonemeContrast,
	type PhonemeContrastPair,
} from "./en/phoneme-contrasts";
export {
	EnglishPhonemeSpellingPatternRegistry,
	type LanguageSpellingPatternRegistry,
	type SpellingPattern,
} from "./en/phoneme-patterns";
export type {
	LanguageArticulationData,
	LanguageConsonantArticulationRegistry,
	LanguageDiphthongVowelArticulationRegistry,
	LanguageFeatureValueByPhonemeRegistry,
	LanguageMonophthongVowelArticulationRegistry,
	LanguagePhonemeArticulationRegistry,
} from "./language-articulation-registry";
export {
	getConsonantArticulationRegistryForLanguage,
	getDiphthongVowelArticulationRegistryForLanguage,
	getFeatureValueByPhonemeRegistryForLanguage,
	getLanguageArticulationData,
	getMonophthongVowelArticulationRegistryForLanguage,
	getPhonemeArticulationRegistryForLanguage,
	LanguageArticulationRegistry,
} from "./language-articulation-registry";
export {
	getAllophoneRegistryForLanguage,
	getCmuArpaRegistryForLanguage,
	getContrastRegistryForLanguage,
	getSpellingPatternRegistryForLanguage,
	LanguageDataRegistry,
} from "./language-data-selectors";
export type {
	LanguageFeatureCapabilities,
	LanguageFeatureKey,
} from "./language-feature-capabilities";
export {
	getLanguageFeatureCapabilities,
	hasLanguageFeature,
	LANGUAGE_FEATURE_KEYS,
	LanguageFeatureCapabilitiesRegistry,
} from "./language-feature-capabilities";
