export {
	CmuArpaRegistry,
	type CmuArpaToken,
	getCmuArpaForPhonemeId,
	getPhonemeIdForCmuArpa,
} from "./phonetics/cmu-arpa-registry";
export type {
	ConsonantArticulatoryFeatures,
	ConsonantPhonemeArticulatoryFeatureKey,
	ConsonantSymbolId,
	ConsonantSymbolIpa,
	DiphthongSymbolIpa,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
	PhonemeCategory,
	PhonemeSymbolId,
	PhonemeSymbolIpa,
	RhoticSymbolIpa,
	VowelArticulatoryFeatures,
	VowelPhonemeArticulatoryFeatureKey,
	VowelSymbolIpa,
} from "./phonetics/ipa-registry";
export {
	ConsonantIpaRegistry,
	DiphthongIpaRegistry,
	getIpaForPhonemeId,
	getPhonemeCategory,
	isConsonantPhoneme,
	isVowelPhoneme,
	MonophthongIpaRegistry,
	PhonemeCount,
	PhonemeIpaRegistry,
	RhoticIpaRegistry,
	VowelIpaRegistry,
} from "./phonetics/ipa-registry";
export {
	type PhonemeAllophone,
	type PhonemeAllophoneContextKey,
	PhonemeAllophoneRegistry,
} from "./phonetics/phoneme-allophones";
export {
	ConsonantArticulationRegistry,
	DiphthongVowelArticulationRegistry,
	FeatureValueByPhonemeRegistry,
	MonophthongVowelArticulationRegistry,
	type PhonemeArticulation,
	PhonemeArticulationRegistry,
	RhoticVowelArticulationRegistry,
	type VowelType,
} from "./phonetics/phoneme-articulations";
export { ContrastsByPhonemeIdRegistry, type PhonemeContrast } from "./phonetics/phoneme-contrasts";
export { PhonemeSpellingPatternRegistry } from "./phonetics/phoneme-patterns";
