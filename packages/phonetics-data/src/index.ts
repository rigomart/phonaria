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
} from "./core/ipa-map";
export {
	ConsonantIpaMap,
	DiphthongIpaMap,
	getIpaForPhonemeId,
	getPhonemeCategory,
	getPhonemeType,
	isConsonantPhoneme,
	isVowelPhoneme,
	MonophthongIpaMap,
	PhonemeCount,
	PhonemeIpaMap,
	VowelIpaMap,
} from "./core/ipa-map";
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
export type { CuratedWordData } from "./data/en/curated-1k";
export type { CmudictPayload, CmudictStatsPayload, PhonemeTrieNode } from "./dict/types";
export { EnglishPhonemeAllophones } from "./languages/en/allophones";
export {
	CmuArpaMap,
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
} from "./languages/en/cmu-arpa";
export { EnglishContrastsByPhonemeId } from "./languages/en/contrasts";
export { EnglishPhonemeSpellingPatterns } from "./languages/en/patterns";
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
} from "./languages/inventories";
export {
	EnglishPhonemeInventory,
	getLanguagePhonemeCount,
	getLanguagePhonemeIds,
	getLanguagePhonemeInventory,
	isPhonemeInLanguage,
	LanguagePhonemeInventoryMap,
	SpanishPhonemeInventory,
} from "./languages/inventories";
export type {
	AllophoneExample,
	LanguagePhonemeAllophoneRegistry,
	LanguagePhonemeContrastRegistry,
	LanguageSpellingPatternRegistry,
	PhonemeAllophone,
	PhonemeAllophoneContextKey,
	PhonemeContrast,
	PhonemeContrastPair,
	SpellingPattern,
} from "./languages/types";
export type {
	LanguageFeatureCapabilities,
	LanguageFeatureKey,
} from "./registries/capabilities";
export {
	getLanguageFeatureCapabilities,
	hasLanguageFeature,
	LANGUAGE_FEATURE_KEYS,
	LanguageFeatureCapabilitiesRegistry,
} from "./registries/capabilities";
export type {
	LanguageArticulationData,
	LanguageConsonantArticulationRegistry,
	LanguageDiphthongVowelArticulationRegistry,
	LanguageFeatureValueByPhonemeRegistry,
	LanguageMonophthongVowelArticulationRegistry,
	LanguagePhonemeArticulationRegistry,
} from "./registries/registries";
export {
	getAllophoneRegistryForLanguage,
	getCmuArpaRegistryForLanguage,
	getConsonantArticulationRegistryForLanguage,
	getContrastRegistryForLanguage,
	getDiphthongVowelArticulationRegistryForLanguage,
	getFeatureValueByPhonemeRegistryForLanguage,
	getLanguageArticulationData,
	getMonophthongVowelArticulationRegistryForLanguage,
	getPhonemeArticulationRegistryForLanguage,
	getSpellingPatternRegistryForLanguage,
	LanguageAllophoneDataRegistry,
	LanguageArticulationRegistry,
	LanguageCmuArpaDataRegistry,
	LanguageContrastDataRegistry,
	LanguageSpellingPatternDataRegistry,
} from "./registries/registries";
