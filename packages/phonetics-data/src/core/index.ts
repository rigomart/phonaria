export type {
	ConsonantArticulatoryFeatures,
	ConsonantPhonemeArticulatoryFeatureKey,
	MannerOfArticulation,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
	PhonemeArticulatoryFeatureValueMap,
	PlaceOfArticulation,
	Rhoticity,
	Voicing,
	VowelArticulatoryFeatures,
	VowelBackness,
	VowelHeight,
	VowelPhonemeArticulatoryFeatureKey,
	VowelRoundness,
	VowelTenseness,
} from "./articulatory-features";
export { PHONEME_ARTICULATORY_FEATURE_KEYS } from "./articulatory-features";
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
} from "./ipa-map";
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
} from "./ipa-map";
export type {
	ConsonantArticulation,
	DiphthongVowelArticulation,
	DiphthongVowelArticulatoryFeatures,
	FeatureValueLookup,
	MonophthongVowelArticulation,
	PhonemeArticulation,
	VowelType,
} from "./phoneme-articulations";
export { buildFeatureValueByPhoneme } from "./phoneme-articulations";
export { type PhonemeCategory, TARGET_LANGUAGES, type TargetLanguage } from "./types";
