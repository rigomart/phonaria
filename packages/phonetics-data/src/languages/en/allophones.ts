import { deepFreeze } from "../../shared/readonly";
import type { EnglishPhonemeSymbolId } from "../inventories";
import type { PhonemeAllophone, PhonemeAllophoneContextKey } from "../types";

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
} as const satisfies Partial<Record<EnglishPhonemeSymbolId, ReadonlyArray<PhonemeAllophone>>>;

export const EnglishPhonemeAllophones: Readonly<
	Partial<Record<EnglishPhonemeSymbolId, ReadonlyArray<PhonemeAllophone>>>
> = deepFreeze(phonemeAllophonesData);

/** Where each sound variant shows up, in plain words, as its label on a sound's page. */
export const EnglishAllophoneContextLabels = deepFreeze({
	"stressed-onset-aspirated": "With a puff of air, at the start of a stressed syllable",
	"after-s-onset-unaspirated": "Without the puff of air, after s",
	"vowel-to-vowel-flap": "A quick tap of the tongue, between vowels",
	"t-before-syllabic-n-glottal": "A catch in the throat, before an n sound",
	"coda-dark-l": "With the back of the tongue raised, at the end of a syllable",
	"pre-voiced-coda-lengthened": "Longer before a voiced sound like /d/",
	"pre-voiceless-coda-shorter": "Shorter before a voiceless sound like /t/",
	"stressed-r-colored": "In a stressed syllable",
	"unstressed-r-colored": "In an unstressed syllable",
} as const satisfies Record<PhonemeAllophoneContextKey, string>);
