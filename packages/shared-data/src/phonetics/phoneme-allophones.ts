import exampleWordsData from "../../data/example-words.json";
import type { PhonemeSymbolId } from "./symbols-registry";

type AllophoneExample = {
	word: string;
	phonemic: string;
};

type BasePhonemeAllophone<ContextKey extends string = string> = {
	ipaVariant: string; // e.g., ɾ, ʔ, tʰ, ɫ, etc.
	contextKey: ContextKey; // e.g., "stressed-syllable-onset", "after-s-in-onset"
	examples: ReadonlyArray<AllophoneExample>;
};

// Context keys for allophones - derived from the JSON data structure
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

export type PhonemeAllophone = BasePhonemeAllophone<PhonemeAllophoneContextKey>;

// Import allophone data from shared JSON, cast to proper types
export const PhonemeAllophoneRegistry: Partial<
	Record<PhonemeSymbolId, ReadonlyArray<PhonemeAllophone>>
> = exampleWordsData.allophones as Partial<
	Record<PhonemeSymbolId, ReadonlyArray<PhonemeAllophone>>
>;
