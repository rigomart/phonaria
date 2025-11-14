export {
	type PhonemeAllophone,
	type PhonemeAllophoneContextKey,
	phonemeAllophones,
} from "./phonetics/phoneme-allophones";
export {
	consonantArticulations,
	diphthongVowelArticulations,
	featureValueByPhoneme,
	monophthongVowelArticulations,
	type PhonemeArticulation,
	phonemeArticulations,
	rhoticVowelArticulations,
} from "./phonetics/phoneme-articulations";
export { contrastsByPhonemeId, type PhonemeContrast } from "./phonetics/phoneme-contrasts";
export { phonemeSpellingPatterns } from "./phonetics/phoneme-patterns";
export type {
	ConsonantArticulatoryFeatures,
	ConsonantPhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
	PhonemeCategory,
	PhonemeSymbolId,
	VowelArticulatoryFeatures,
	VowelPhonemeArticulatoryFeatureKey,
} from "./phonetics/symbols-registry";
export {
	allPhonemeSymbols,
	consonantPhonemeSymbols,
	diphthongPhonemeSymbols,
	monophthongPhonemeSymbols,
	rhoticPhonemeSymbols,
	vowelPhonemeSymbols,
} from "./phonetics/symbols-registry";
export {
	type CmuPhonemeMapping,
	type CmuTokenMappingResult,
	getAllCmuTokenMappings,
	getPhonemeForCmuToken,
	mapCmuSequenceToPhonemes,
	normalizeCmuToken,
} from "./phonetics/cmu-lookup";
