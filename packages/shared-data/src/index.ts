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
	MonophthongIpaRegistry,
	PhonemeCount,
	PhonemeIpaRegistry,
	RhoticIpaRegistry,
	VowelIpaRegistry,
} from "./phonetics/ipa-registry";
export {
	type AllophoneExample,
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
export {
	ContrastsByPhonemeIdRegistry,
	type PhonemeContrast,
	type PhonemeContrastPair,
} from "./phonetics/phoneme-contrasts";
export {
	PhonemeSpellingPatternRegistry,
	type SpellingPattern,
} from "./phonetics/phoneme-patterns";
