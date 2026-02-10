import type { PhonemeSymbolId } from "@phonaria/phonetics-data";

export const OUGH_PATTERN = "ough";

export type OughWord = {
	word: string;
	hint: string;
	audioPath: string;
	phonemes: {
		id: PhonemeSymbolId;
		isHighlighted: boolean;
	}[];
};

export const OUGH_WORDS: OughWord[] = [
	{
		word: "through",
		hint: "throo",
		audioPath: "/audio/through.mp3",
		phonemes: [
			{ id: "TH", isHighlighted: false },
			{ id: "R", isHighlighted: false },
			{ id: "U", isHighlighted: true },
		],
	},
	{
		word: "though",
		hint: "thoh",
		audioPath: "/audio/though.mp3",
		phonemes: [
			{ id: "DH", isHighlighted: false },
			{ id: "OU", isHighlighted: true },
		],
	},
	{
		word: "thought",
		hint: "thawt",
		audioPath: "/audio/thought.mp3",
		phonemes: [
			{ id: "TH", isHighlighted: false },
			{ id: "O", isHighlighted: true },
			{ id: "T", isHighlighted: false },
		],
	},
	{
		word: "tough",
		hint: "tuff",
		audioPath: "/audio/tough.mp3",
		phonemes: [
			{ id: "T", isHighlighted: false },
			{ id: "AH", isHighlighted: true },
			{ id: "F", isHighlighted: true },
		],
	},
	{
		word: "cough",
		hint: "koff",
		audioPath: "/audio/cough.mp3",
		phonemes: [
			{ id: "K", isHighlighted: false },
			{ id: "O", isHighlighted: true },
			{ id: "F", isHighlighted: true },
		],
	},
	{
		word: "bough",
		hint: "bow",
		audioPath: "/audio/bough.mp3",
		phonemes: [
			{ id: "B", isHighlighted: false },
			{ id: "AU", isHighlighted: true },
		],
	},
];

export type MinimalPairLabelKey = "vowel-length" | "vowel-height" | "consonant-place";

export type MinimalPair = {
	labelKey: MinimalPairLabelKey;
	wordA: string;
	ipaA: string;
	diffA: PhonemeSymbolId;
	wordB: string;
	ipaB: string;
	diffB: PhonemeSymbolId;
};

export const MINIMAL_PAIRS: MinimalPair[] = [
	{
		labelKey: "vowel-length",
		wordA: "ship",
		ipaA: "ʃɪp",
		diffA: "IX",
		wordB: "sheep",
		ipaB: "ʃiːp",
		diffB: "I",
	},
	{
		labelKey: "vowel-height",
		wordA: "bat",
		ipaA: "bæt",
		diffA: "AE",
		wordB: "bet",
		ipaB: "bɛt",
		diffB: "E",
	},
	{
		labelKey: "consonant-place",
		wordA: "thin",
		ipaA: "θɪn",
		diffA: "TH",
		wordB: "tin",
		ipaB: "tɪn",
		diffB: "T",
	},
];
