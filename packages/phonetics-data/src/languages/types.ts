import type { TargetAccent } from "../core/types";
import type { LanguagePhonemeId } from "./inventories";

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

export type LanguagePhonemeAllophoneRegistry<TLanguage extends TargetAccent = TargetAccent> =
	Partial<Record<LanguagePhonemeId<TLanguage>, ReadonlyArray<PhonemeAllophone>>>;

// Contrast types

export type MinimalPair = { readonly words: readonly [string, string] };

export type PhonemeContrast<TLanguage extends TargetAccent = TargetAccent> = {
	/** Lowercased phoneme IDs joined by "-", e.g. "i-ix". Unique; a future route slug. */
	id: string;
	phonemeIds: readonly [LanguagePhonemeId<TLanguage>, LanguagePhonemeId<TLanguage>];
	/** One plain-language sentence on hearing or making the difference. */
	tip: string;
	/** words[0] contains phonemeIds[0]; words[1] contains phonemeIds[1] at the same position. */
	minimalPairs: readonly MinimalPair[];
};

export type PhonemeContrastMatch<TLanguage extends TargetAccent = TargetAccent> = {
	contrastId: string;
	partnerId: LanguagePhonemeId<TLanguage>;
	tip: string;
	/** Oriented to the looked-up phoneme: words[0] contains the phoneme this entry is indexed under. */
	minimalPairs: readonly MinimalPair[];
};

export type LanguagePhonemeContrastRegistry<TLanguage extends TargetAccent = TargetAccent> =
	Partial<Record<LanguagePhonemeId<TLanguage>, PhonemeContrastMatch<TLanguage>[]>>;

// Spelling pattern types

export type SpellingPattern = {
	patterns: ReadonlyArray<string>;
	examples: ReadonlyArray<{
		word: string;
		phonemic: string;
	}>;
};

export type LanguageSpellingPatternRegistry<TLanguage extends TargetAccent = TargetAccent> =
	Partial<Record<LanguagePhonemeId<TLanguage>, SpellingPattern>>;
