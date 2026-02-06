import type { PhonemeArticulatoryFeatureKey } from "../core/articulatory-features";
import type { TargetLanguage } from "../core/types";
import type { EnglishPhonemeSymbolId, LanguagePhonemeId } from "./inventories";

// Allophone types

export type AllophoneExample = {
	word: string;
	phonemic: string;
};

export type PhonemeAllophoneContextKey =
	| "stressed-onset-aspirated"
	| "after-s-onset-unaspirated"
	| "vowel-to-vowel-flap"
	| "t-before-syllabic-n-glottal"
	| "coda-dark-l"
	| "pre-voiced-coda-lengthened"
	| "pre-voiceless-coda-shorter"
	| "stressed-r-colored"
	| "unstressed-r-colored";

export type PhonemeAllophone = {
	ipaVariant: string;
	contextKey: PhonemeAllophoneContextKey;
	examples: ReadonlyArray<AllophoneExample>;
};

export type LanguagePhonemeAllophoneRegistry<TLanguage extends TargetLanguage = TargetLanguage> =
	Partial<Record<LanguagePhonemeId<TLanguage>, ReadonlyArray<PhonemeAllophone>>>;

// Contrast types

export type PhonemeContrastPair = {
	word: string;
	phonemic: string;
};

export type PhonemeContrast = {
	phonemeIds: [EnglishPhonemeSymbolId, EnglishPhonemeSymbolId];
	contrastType: PhonemeArticulatoryFeatureKey[];
	minimalPairs: [PhonemeContrastPair, PhonemeContrastPair][];
};

export type PhonemeContrastMatch = {
	partnerId: EnglishPhonemeSymbolId;
	contrastType: PhonemeArticulatoryFeatureKey[];
	minimalPairs: [PhonemeContrastPair, PhonemeContrastPair][];
};

export type LanguagePhonemeContrastRegistry<TLanguage extends TargetLanguage = TargetLanguage> =
	Partial<Record<LanguagePhonemeId<TLanguage>, PhonemeContrastMatch[]>>;

// Spelling pattern types

export type SpellingPattern = {
	patterns: ReadonlyArray<string>;
	examples: ReadonlyArray<{
		word: string;
		phonemic: string;
	}>;
};

export type LanguageSpellingPatternRegistry<TLanguage extends TargetLanguage = TargetLanguage> =
	Partial<Record<LanguagePhonemeId<TLanguage>, SpellingPattern>>;
