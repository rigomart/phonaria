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
} from "./en/cmu-arpa";
export { EnglishContrastsByPhonemeId, EnglishPhonemeContrasts } from "./en/contrasts";
export {
	findSubstitution,
	getSinglePronunciation,
	type PhonemeSubstitution,
	toBasePhonemeIds,
} from "./en/minimal-pairs";
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
	MinimalPair,
	PhonemeAllophone,
	PhonemeAllophoneContextKey,
	PhonemeContrast,
	PhonemeContrastMatch,
	SpellingPattern,
} from "./types";
