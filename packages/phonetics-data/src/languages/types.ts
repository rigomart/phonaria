import type { TargetAccent } from "../core/types";
import type { LanguagePhonemeId } from "./inventories";

// Allophone types

export type AllophoneExample = {
	readonly word: string;
	readonly phonemic: string;
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
	readonly ipaVariant: string;
	readonly contextKey: PhonemeAllophoneContextKey;
	readonly examples: ReadonlyArray<AllophoneExample>;
};

export type LanguagePhonemeAllophoneRegistry<TLanguage extends TargetAccent = TargetAccent> =
	Readonly<Partial<Record<LanguagePhonemeId<TLanguage>, ReadonlyArray<PhonemeAllophone>>>>;

// Contrast types

export type MinimalPair = { readonly words: readonly [string, string] };

export type PhonemeContrast<TLanguage extends TargetAccent = TargetAccent> = {
	/** Lowercased phoneme IDs joined by "-", e.g. "i-ix". Unique; a future route slug. */
	readonly id: string;
	readonly phonemeIds: readonly [LanguagePhonemeId<TLanguage>, LanguagePhonemeId<TLanguage>];
	/** words[0] contains phonemeIds[0]; words[1] contains phonemeIds[1] at the same position. */
	readonly minimalPairs: readonly MinimalPair[];
};

export type PhonemeContrastMatch<TLanguage extends TargetAccent = TargetAccent> = {
	readonly contrastId: string;
	readonly partnerId: LanguagePhonemeId<TLanguage>;
	/** Oriented to the looked-up phoneme: words[0] contains the phoneme this entry is indexed under. */
	readonly minimalPairs: readonly MinimalPair[];
};

export type LanguagePhonemeContrastRegistry<TLanguage extends TargetAccent = TargetAccent> =
	Readonly<
		Partial<Record<LanguagePhonemeId<TLanguage>, readonly PhonemeContrastMatch<TLanguage>[]>>
	>;

// Spelling pattern types

export type SpellingPattern = {
	readonly patterns: ReadonlyArray<string>;
	readonly examples: ReadonlyArray<{
		readonly word: string;
		readonly phonemic: string;
		/** The word with the letters that spell the sound in brackets, e.g. "ha[pp]y" or "m[a]k[e]". */
		readonly spelled: string;
	}>;
};

export type LanguageSpellingPatternRegistry<TLanguage extends TargetAccent = TargetAccent> =
	Readonly<Partial<Record<LanguagePhonemeId<TLanguage>, SpellingPattern>>>;

// Phoneme frequency types

/** How common a sound is in everyday speech. */
export type PhonemeFrequency = {
	/** The sound's share of all sounds spoken, weighting each word by how often it is used. */
	readonly percentage: number;
	/** 1 is the most common sound. */
	readonly rank: number;
};

export type LanguagePhonemeFrequencyRegistry<TLanguage extends TargetAccent = TargetAccent> =
	Readonly<Record<LanguagePhonemeId<TLanguage>, PhonemeFrequency>>;

// Word audio types

/** The single-word recordings uploaded for one accent: one voice, one file per word. */
export type WordAudioManifest = {
	/** Folder name of the voice set, e.g. "jenny". */
	readonly voice: string;
	/** Lowercase words that have a recording, sorted. */
	readonly words: readonly string[];
};
