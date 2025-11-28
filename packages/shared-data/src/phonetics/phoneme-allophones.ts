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
	"voiceless-bilabial-plosive": [
		{
			ipaVariant: "pʰ",
			contextKey: "stressed-onset-aspirated",
			examples: [
				{ word: "pin", phonemic: "pɪn" },
				{ word: "paper", phonemic: "ˈpeɪpɝ" },
			],
		},
		{
			ipaVariant: "p",
			contextKey: "after-s-onset-unaspirated",
			examples: [
				{ word: "spin", phonemic: "spɪn" },
				{ word: "space", phonemic: "speɪs" },
			],
		},
	],
	"voiceless-alveolar-plosive": [
		{
			ipaVariant: "tʰ",
			contextKey: "stressed-onset-aspirated",
			examples: [
				{ word: "top", phonemic: "tɑp" },
				{ word: "attack", phonemic: "əˈtæk" },
			],
		},
		{
			ipaVariant: "ɾ",
			contextKey: "vowel-to-vowel-flap",
			examples: [
				{ word: "water", phonemic: "ˈwɔtɝ" },
				{ word: "city", phonemic: "ˈsɪti" },
			],
		},
		{
			ipaVariant: "ʔ",
			contextKey: "t-before-syllabic-n-glottal",
			examples: [
				{ word: "button", phonemic: "ˈbʌtən" },
				{ word: "kitten", phonemic: "ˈkɪtən" },
			],
		},
	],
	"voiceless-velar-plosive": [
		{
			ipaVariant: "kʰ",
			contextKey: "stressed-onset-aspirated",
			examples: [
				{ word: "cat", phonemic: "kæt" },
				{ word: "account", phonemic: "əˈkaʊnt" },
			],
		},
		{
			ipaVariant: "k",
			contextKey: "after-s-onset-unaspirated",
			examples: [
				{ word: "skate", phonemic: "skeɪt" },
				{ word: "school", phonemic: "skul" },
			],
		},
	],

	// Common assimilations & syllabic consonants
	"voiced-alveolar-lateral-approximant": [
		{
			ipaVariant: "ɫ",
			contextKey: "coda-dark-l",
			examples: [
				{ word: "ball", phonemic: "bɔl" },
				{ word: "milk", phonemic: "mɪlk" },
			],
		},
	],

	// Vowel length cue before voiced vs voiceless codas
	"close-front-unrounded": [
		{
			ipaVariant: "iː",
			contextKey: "pre-voiced-coda-lengthened",
			examples: [
				{ word: "seed", phonemic: "sid" },
				{ word: "leave", phonemic: "liv" },
			],
		},
		{
			ipaVariant: "i",
			contextKey: "pre-voiceless-coda-shorter",
			examples: [
				{ word: "seat", phonemic: "sit" },
				{ word: "leaf", phonemic: "lif" },
			],
		},
	],
	"near-open-front-unrounded": [
		{
			ipaVariant: "æː",
			contextKey: "pre-voiced-coda-lengthened",
			examples: [
				{ word: "bad", phonemic: "bæd" },
				{ word: "cab", phonemic: "kæb" },
			],
		},
		{
			ipaVariant: "æ",
			contextKey: "pre-voiceless-coda-shorter",
			examples: [
				{ word: "bat", phonemic: "bæt" },
				{ word: "cap", phonemic: "kæp" },
			],
		},
	],

	// Rhotic vowel stress variants
	"open-mid-central-rhotic": [
		{
			ipaVariant: "ɝ",
			contextKey: "stressed-r-colored",
			examples: [
				{ word: "bird", phonemic: "bɝd" },
				{ word: "first", phonemic: "fɝst" },
			],
		},
		{
			ipaVariant: "ɚ",
			contextKey: "unstressed-r-colored",
			examples: [
				{ word: "teacher", phonemic: "ˈtitʃɝ" },
				{ word: "water", phonemic: "ˈwɔtɝ" },
			],
		},
	],
} as const;

type AllophoneCollections = (typeof phonemeAllophonesData)[keyof typeof phonemeAllophonesData];

export type PhonemeAllophoneContextKey = AllophoneCollections[number]["contextKey"];

export type PhonemeAllophone = BasePhonemeAllophone<PhonemeAllophoneContextKey>;

export const PhonemeAllophoneRegistry: Partial<
	Record<PhonemeSymbolId, ReadonlyArray<PhonemeAllophone>>
> = phonemeAllophonesData;
