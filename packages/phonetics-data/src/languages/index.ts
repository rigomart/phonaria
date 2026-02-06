export { EnglishPhonemeAllophones } from "./en/allophones";
export {
	EnglishConsonantArticulations,
	EnglishDiphthongArticulations,
	EnglishMonophthongArticulations,
	EnglishPhonemeArticulations,
	type PhonemeArticulation,
	type VowelType,
} from "./en/articulations";
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
} from "./en/cmu-arpa";
export { EnglishContrastsByPhonemeId } from "./en/contrasts";
export { EnglishPhonemeSpellingPatterns } from "./en/patterns";
export {
	SpanishConsonantArticulations,
	SpanishDiphthongArticulations,
	SpanishMonophthongArticulations,
	type SpanishPhonemeArticulation,
	SpanishPhonemeArticulations,
} from "./es/articulations";
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
} from "./inventories";
export {
	EnglishPhonemeInventory,
	getLanguagePhonemeCount,
	getLanguagePhonemeIds,
	getLanguagePhonemeInventory,
	isPhonemeInLanguage,
	LanguagePhonemeInventoryMap,
	SpanishPhonemeInventory,
} from "./inventories";
export type {
	AllophoneExample,
	LanguagePhonemeAllophoneRegistry,
	LanguagePhonemeContrastRegistry,
	LanguageSpellingPatternRegistry,
	PhonemeAllophone,
	PhonemeAllophoneContextKey,
	PhonemeContrast,
	PhonemeContrastMatch,
	PhonemeContrastPair,
	SpellingPattern,
} from "./types";
