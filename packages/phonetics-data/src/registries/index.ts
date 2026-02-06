export type {
	LanguageFeatureCapabilities,
	LanguageFeatureKey,
} from "./capabilities";
export {
	getLanguageFeatureCapabilities,
	hasLanguageFeature,
	LANGUAGE_FEATURE_KEYS,
	LanguageFeatureCapabilitiesRegistry,
} from "./capabilities";
export type {
	LanguageArticulationData,
	LanguageConsonantArticulationRegistry,
	LanguageDiphthongVowelArticulationRegistry,
	LanguageFeatureValueByPhonemeRegistry,
	LanguageMonophthongVowelArticulationRegistry,
	LanguagePhonemeArticulationRegistry,
} from "./registries";
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
} from "./registries";
