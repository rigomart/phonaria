import type { PhonemeSymbolId } from "./ipa-registry";

export type AllophoneExample = {
	word: string;
	phonemic: string;
};

type BasePhonemeAllophone<ContextKey extends string = string> = {
	ipaVariant: string; // e.g., ɾ, ʔ, tʰ, ɫ, etc.
	contextKey: ContextKey; // e.g., "stressed-syllable-onset", "after-s-in-onset"
	examples: ReadonlyArray<AllophoneExample>;
};

const phonemeAllophonesData = {
	// Voiceless plosives: aspiration vs s-clusters; plus key /t/ variants
	P: [
		{
			ipaVariant: "pʰ",
			contextKey: "stressed-onset-aspirated",
			examples: [{ word: "pin", phonemic: "pɪn" }],
		},
		{
			ipaVariant: "p",
			contextKey: "after-s-onset-unaspirated",
			examples: [{ word: "spin", phonemic: "spɪn" }],
		},
	],
	T: [
		{
			ipaVariant: "tʰ",
			contextKey: "stressed-onset-aspirated",
			examples: [
				{ word: "top", phonemic: "tɑp" },
				{ word: "time", phonemic: "taɪm" },
			],
		},
		{
			ipaVariant: "ɾ",
			contextKey: "vowel-to-vowel-flap",
			examples: [{ word: "water", phonemic: "ˈwɔtɝ" }],
		},
		{
			ipaVariant: "ʔ",
			contextKey: "t-before-syllabic-n-glottal",
			examples: [{ word: "button", phonemic: "ˈbʌtən" }],
		},
	],
	K: [
		{
			ipaVariant: "kʰ",
			contextKey: "stressed-onset-aspirated",
			examples: [{ word: "cat", phonemic: "kæt" }],
		},
		{
			ipaVariant: "k",
			contextKey: "after-s-onset-unaspirated",
			examples: [{ word: "skate", phonemic: "skeɪt" }],
		},
	],
	D: [
		{
			ipaVariant: "ɾ",
			contextKey: "vowel-to-vowel-flap",
			examples: [{ word: "ladder", phonemic: "ˈlædɝ" }],
		},
	],

	// Common assimilations & syllabic consonants
	L: [
		{
			ipaVariant: "ɫ",
			contextKey: "coda-dark-l",
			examples: [{ word: "ball", phonemic: "bɔl" }],
		},
	],

	// Vowel length cue before voiced vs voiceless codas
	I: [
		{
			ipaVariant: "iː",
			contextKey: "pre-voiced-coda-lengthened",
			examples: [{ word: "seed", phonemic: "sid" }],
		},
		{
			ipaVariant: "i",
			contextKey: "pre-voiceless-coda-shorter",
			examples: [{ word: "seat", phonemic: "sit" }],
		},
	],
	AE: [
		{
			ipaVariant: "æː",
			contextKey: "pre-voiced-coda-lengthened",
			examples: [{ word: "bad", phonemic: "bæd" }],
		},
		{
			ipaVariant: "æ",
			contextKey: "pre-voiceless-coda-shorter",
			examples: [{ word: "bat", phonemic: "bæt" }],
		},
	],

	// R-colored vowel stress variants
	ER: [
		{
			ipaVariant: "ɝ",
			contextKey: "stressed-r-colored",
			examples: [{ word: "bird", phonemic: "bɝd" }],
		},
		{
			ipaVariant: "ɚ",
			contextKey: "unstressed-r-colored",
			examples: [{ word: "water", phonemic: "ˈwɔtɚ" }],
		},
	],
} as const;

type AllophoneCollections = (typeof phonemeAllophonesData)[keyof typeof phonemeAllophonesData];

export type PhonemeAllophoneContextKey = AllophoneCollections[number]["contextKey"];

export type PhonemeAllophone = BasePhonemeAllophone<PhonemeAllophoneContextKey>;

export const PhonemeAllophoneRegistry: Partial<
	Record<PhonemeSymbolId, ReadonlyArray<PhonemeAllophone>>
> = phonemeAllophonesData;
