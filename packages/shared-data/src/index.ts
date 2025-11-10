export {
	consonantArticulations,
	diphthongVowelArticulations,
	monophthongVowelArticulations,
	type PhonemeArticulation,
	phonemeArticulations,
	rhoticVowelArticulations,
} from "./phonetics/phoneme-articulations";
export { contrastsByPhonemeId, type PhonemeContrast } from "./phonetics/phoneme-contrasts";
export { phonemeSpellingPatterns } from "./phonetics/phoneme-patterns";
export type {
	ConsonantArticulatoryFeatures,
	PhonemeArticulatoryFeatures,
	PhonemeSymbolId,
	VowelArticulatoryFeatures,
} from "./phonetics/symbols-registry";
export {
	allPhonemeSymbols,
	consonantPhonemeSymbols,
	diphthongPhonemeSymbols,
	monophthongPhonemeSymbols,
	rhoticPhonemeSymbols,
	vowelPhonemeSymbols,
} from "./phonetics/symbols-registry";
