export {
	type CmuArpaToken,
	CmuSymbolRegistry,
	getSymbolIdForCmuToken,
} from "./phonetics/cmu-lookup";
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
} from "./phonetics/phoneme-articulations";
export { ContrastsByPhonemeIdRegistry, type PhonemeContrast } from "./phonetics/phoneme-contrasts";
export { PhonemeSpellingPatternRegistry } from "./phonetics/phoneme-patterns";
export type {
	ConsonantArticulatoryFeatures,
	ConsonantPhonemeArticulatoryFeatureKey,
	ConsonantSymbolId,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
	PhonemeCategory,
	PhonemeSymbolId,
	VowelArticulatoryFeatures,
	VowelPhonemeArticulatoryFeatureKey,
} from "./phonetics/symbols-registry";
export {
	ConsonantSymbolRegistry,
	DiphthongSymbolRegistry,
	MonophthongSymbolRegistry,
	PhonemeSymbolRegistry,
	RhoticSymbolRegistry,
	VowelSymbolRegistry,
} from "./phonetics/symbols-registry";
