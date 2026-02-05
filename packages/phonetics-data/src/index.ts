import curatedTop1kJson from "../data/en/curated/top-1k.json";
import curatedTop10kJson from "../data/en/curated/top-10k.json";
import cmudictJson from "../data/en/dict/cmudict.json";
import cmudictStatsJson from "../data/en/dict/cmudict-stats.json";
import type { CmudictPayload, CmudictStatsPayload } from "./dict/types";

export const cmudictData = cmudictJson as CmudictPayload;
export const cmudictStatsData = cmudictStatsJson as CmudictStatsPayload;

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
export const curatedTop1k = curatedTop1kJson as CuratedWordData;

/**
 * Top 10,000 most frequent English words with CMU pronunciations.
 * Covers ~95% of learner vocabulary. Lazy-loaded (~273KB).
 */
export const curatedTop10k = curatedTop10kJson as CuratedWordData;

export type {
	ConsonantArticulatoryFeatures,
	ConsonantPhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
	VowelArticulatoryFeatures,
	VowelPhonemeArticulatoryFeatureKey,
} from "./core/articulatory-features";
export type {
	ConsonantSymbolId,
	ConsonantSymbolIpa,
	DiphthongSymbolId,
	DiphthongSymbolIpa,
	MonophthongSymbolId,
	MonophthongSymbolIpa,
	PhonemeSymbolId,
	PhonemeSymbolIpa,
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
export type { PhonemeCategory, TargetLanguage } from "./core/types";
export type { CmudictPayload, CmudictStatsPayload, PhonemeTrieNode } from "./dict/types";
export {
	CmuArpaRegistry,
	type CmuArpaToken,
	type CmuStressLevel,
	cmuVariantToIpa,
	extractBasePhonemeId,
	getArpabetForPhonemeId,
	getCmuArpaForPhonemeId,
	getPhonemeIdForCmuArpa,
	isCmuArpaToken,
	isValidPhonemeToken,
	PhonemeArpabetLabel,
} from "./en/cmu-arpa-registry";
export {
	type AllophoneExample,
	type PhonemeAllophone,
	type PhonemeAllophoneContextKey,
	PhonemeAllophoneRegistry,
} from "./en/phoneme-allophones";
export {
	ConsonantArticulationRegistry,
	DiphthongVowelArticulationRegistry,
	FeatureValueByPhonemeRegistry,
	MonophthongVowelArticulationRegistry,
	type PhonemeArticulation,
	PhonemeArticulationRegistry,
	type VowelType,
} from "./en/phoneme-articulations";
export {
	ContrastsByPhonemeIdRegistry,
	type PhonemeContrast,
	type PhonemeContrastPair,
} from "./en/phoneme-contrasts";
export {
	PhonemeSpellingPatternRegistry,
	type SpellingPattern,
} from "./en/phoneme-patterns";
export {
	SpanishConsonantArticulationRegistry,
	SpanishDiphthongVowelArticulationRegistry,
	SpanishFeatureValueByPhonemeRegistry,
	SpanishMonophthongVowelArticulationRegistry,
	type SpanishPhonemeArticulation,
	SpanishPhonemeArticulationRegistry,
} from "./es/phoneme-articulations";
export type {
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
	getMonophthongVowelArticulationRegistryForLanguage,
	getPhonemeArticulationRegistryForLanguage,
} from "./language-articulation-registry";
