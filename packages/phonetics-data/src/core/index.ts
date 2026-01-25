export type {
	ConsonantArticulatoryFeatures,
	ConsonantPhonemeArticulatoryFeatureKey,
	MannerOfArticulation,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
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
export type {
	ConsonantSymbolId,
	ConsonantSymbolIpa,
	DiphthongSymbolIpa,
	PhonemeSymbolId,
	PhonemeSymbolIpa,
	VowelSymbolIpa,
} from "./ipa-registry";
export {
	ConsonantIpaRegistry,
	DiphthongIpaRegistry,
	getIpaForPhonemeId,
	getPhonemeCategory,
	getPhonemeType,
	MonophthongIpaRegistry,
	PhonemeCount,
	PhonemeIpaRegistry,
	VowelIpaRegistry,
} from "./ipa-registry";
export type { PhonemeCategory, TargetLanguage } from "./types";
