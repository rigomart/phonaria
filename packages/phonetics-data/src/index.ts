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
export { type PhonemeCategory, TARGET_ACCENTS, type TargetAccent } from "./core/types";
export type { CuratedWordData } from "./data/en/curated-1k";
export type {
	CmudictPayload,
	CmudictStatsPayload,
	PhonemeFrequencyPayload,
	PhonemeTrieNode,
} from "./dict/types";
export { type MergerNoteSegment, splitMergerNoteText } from "./formatters/merger-note";
export { formatPhonemeLabel } from "./formatters/phoneme-label";
export { type SpelledWordSegment, splitSpelledWord } from "./formatters/spelled-word";
export { EnglishPhonemeAllophones } from "./languages/en/allophones";
export {
	CmuArpaMap,
	type CmuArpaToken,
	type CmuStressLevel,
	cmuArpaVariantToPhonemeVariant,
	cmuVariantToIpa,
	extractBasePhonemeId,
	getArpabetForEnglishPhonemeId,
	getCmuArpaForEnglishPhonemeId,
	getPhonemeIdForCmuArpa,
	isCmuArpaToken,
	isEnglishPhonemeSymbolId,
	isValidEnglishPhonemeToken,
	isValidPhonemeToken,
	PhonemeArpabetLabel,
	type PhonemeIpaConversionOptions,
	parseCmuPronunciation,
	parsePhonemePronunciation,
	phonemeVariantToCmuArpa,
	phonemeVariantToIpa,
	tokenizePronunciation,
	tryExtractBasePhonemeId,
} from "./languages/en/cmu-arpa";
export { EnglishContrastsByPhonemeId, EnglishPhonemeContrasts } from "./languages/en/contrasts";
export { EnglishPhonemeFrequencies } from "./languages/en/frequency";
export { EnglishPhonemeMergerNotes } from "./languages/en/merger-notes";
export {
	findSubstitution,
	getSinglePronunciation,
	type PhonemeSubstitution,
	toBasePhonemeIds,
} from "./languages/en/minimal-pairs";
export { isOFormOf, OFormExceptions, preferOForms, spellsOVowel } from "./languages/en/o-forms";
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
	LanguagePhonemeFrequencyRegistry,
	LanguagePhonemeMergerNoteRegistry,
	LanguageSpellingPatternRegistry,
	MergerNote,
	MinimalPair,
	PhonemeAllophone,
	PhonemeAllophoneContextKey,
	PhonemeContrast,
	PhonemeContrastMatch,
	PhonemeFrequency,
	SpellingPattern,
	WordAudioForm,
	WordAudioManifest,
} from "./languages/types";
export type { LanguageFeatureCapabilities, LanguageFeatureKey } from "./registries/capabilities";
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
	getMergerNoteRegistryForLanguage,
	getMonophthongVowelArticulationRegistryForLanguage,
	getPhonemeArticulationRegistryForLanguage,
	getPhonemeFrequencyRegistryForLanguage,
	getSpellingPatternRegistryForLanguage,
	LanguageAllophoneDataRegistry,
	LanguageArticulationRegistry,
	LanguageCmuArpaDataRegistry,
	LanguageContrastDataRegistry,
	LanguageMergerNoteDataRegistry,
	LanguagePhonemeFrequencyDataRegistry,
	LanguageSpellingPatternDataRegistry,
} from "./registries/registries";
export {
	getWordAudioForms,
	getWordAudioPath,
	loadWordAudioManifest,
	type WordAudioRecording,
} from "./word-audio";
