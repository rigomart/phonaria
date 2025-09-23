import type { VowelPhoneme } from "./types";

export const vowels: VowelPhoneme[] = [
	// Monophthongs
	{
		symbol: "i",
		category: "vowel",
		type: "monophthong",
		articulation: {
			height: "high",
			frontness: "front",
			roundness: "unrounded",
			tenseness: "tense",
		},
		examples: [
			{ word: "need", phonemic: "nid" },
			{ word: "free", phonemic: "fri" },
		],
		description: "high front tense vowel",
		guide: "Tongue high and forward, lips spread.",
	},
	{
		symbol: "ɪ",
		category: "vowel",
		type: "monophthong",
		articulation: {
			height: "near-high",
			frontness: "near-front",
			roundness: "unrounded",
			tenseness: "lax",
		},
		examples: [
			{ word: "is", phonemic: "ɪz" },
			{ word: "this", phonemic: "ðɪs" },
		],
		description: "near-high near-front lax vowel",
		guide: "Tongue high and forward but relaxed, lips slightly spread.",
	},
	{
		symbol: "ɛ",
		category: "vowel",
		type: "monophthong",
		articulation: {
			height: "low-mid",
			frontness: "front",
			roundness: "unrounded",
			tenseness: "lax",
		},
		examples: [
			{ word: "get", phonemic: "ɡɛt" },
			{ word: "when", phonemic: "wɛn" },
		],
		description: "low-mid front lax vowel",
		guide: "Tongue mid-height and forward, lips slightly open.",
	},
	{
		symbol: "æ",
		category: "vowel",
		type: "monophthong",
		articulation: {
			height: "near-low",
			frontness: "front",
			roundness: "unrounded",
			tenseness: "lax",
		},
		examples: [
			{ word: "and", phonemic: "ænd" },
			{ word: "had", phonemic: "hæd" },
		],
		description: "near-low front vowel",
		guide: "Tongue low and forward, mouth open.",
	},
	{
		symbol: "ʌ",
		category: "vowel",
		type: "monophthong",
		articulation: {
			height: "low-mid",
			frontness: "central",
			roundness: "unrounded",
			tenseness: "lax",
		},
		examples: [
			{ word: "but", phonemic: "bʌt" },
			{ word: "up", phonemic: "ʌp" },
		],
		description: "low-mid central unrounded vowel",
		guide: "Tongue mid-height and central, relaxed mouth.",
	},
	{
		symbol: "ə",
		category: "vowel",
		type: "monophthong",
		articulation: {
			height: "mid",
			frontness: "central",
			roundness: "unrounded",
			tenseness: "lax",
		},
		examples: [
			{ word: "the", phonemic: "ðə" },
			{ word: "a", phonemic: "ə" },
		],
		description: "mid central schwa vowel",
		guide: "Tongue in neutral position, unstressed and relaxed.",
	},
	{
		symbol: "ɑ",
		category: "vowel",
		type: "monophthong",
		articulation: {
			height: "low",
			frontness: "back",
			roundness: "unrounded",
			tenseness: "lax",
		},
		examples: [
			{ word: "not", phonemic: "nɑt" },
			{ word: "stop", phonemic: "stɑp" },
		],
		description: "low back unrounded vowel",
		guide: "Tongue low and back, mouth open.",
	},
	{
		symbol: "ɔ",
		category: "vowel",
		type: "monophthong",
		articulation: {
			height: "low-mid",
			frontness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
		examples: [
			{ word: "all", phonemic: "ɔl" },
			{ word: "call", phonemic: "kɔl" },
		],
		description: "low-mid back rounded vowel",
		guide: "Tongue mid-height and back, lips rounded.",
	},
	{
		symbol: "ʊ",
		category: "vowel",
		type: "monophthong",
		articulation: {
			height: "near-high",
			frontness: "near-back",
			roundness: "rounded",
			tenseness: "lax",
		},
		examples: [
			{ word: "look", phonemic: "lʊk" },
			{ word: "could", phonemic: "kʊd" },
		],
		description: "near-high near-back lax rounded vowel",
		guide: "Tongue high and back, lips rounded but relaxed.",
	},
	{
		symbol: "u",
		category: "vowel",
		type: "monophthong",
		articulation: {
			height: "high",
			frontness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
		examples: [
			{ word: "do", phonemic: "du" },
			{ word: "too", phonemic: "tu" },
		],
		description: "high back tense rounded vowel",
		guide: "Tongue high and back, lips pursed.",
	},

	// R-colored vowels (Rhotic)
	{
		symbol: "ɝ",
		category: "vowel",
		type: "rhotic",
		articulation: {
			height: "mid",
			frontness: "central",
			roundness: "unrounded",
			tenseness: "tense",
			rhoticity: "rhotic",
		},
		examples: [
			{ word: "first", phonemic: "fɝst" },
			{ word: "work", phonemic: "wɝk" },
		],
		description: "mid central stressed r-colored vowel",
		guide:
			"Raise the tongue toward the mid-central space and curl slightly for the American r coloring.",
	},
	{
		symbol: "ɚ",
		category: "vowel",
		type: "rhotic",
		articulation: {
			height: "mid",
			frontness: "central",
			roundness: "unrounded",
			tenseness: "lax",
			rhoticity: "rhotic",
		},
		examples: [
			{ word: "better", phonemic: "bɛtɚ" },
			{ word: "after", phonemic: "æftɚ" },
		],
		description: "mid central unstressed r-colored vowel",
		guide:
			"Relax the tongue in mid-central position while adding a light r coloring for unstressed syllables.",
	},

	// Diphthongs
	{
		symbol: "eɪ",
		category: "vowel",
		type: "diphthong",
		articulation: {
			height: "high-mid", // Starting position
			frontness: "front",
			roundness: "unrounded",
			tenseness: "tense",
		},
		examples: [
			{ word: "say", phonemic: "seɪ" },
			{ word: "way", phonemic: "weɪ" },
		],
		description: "mid front to high front diphthong",
		guide: "Starts mid front, glides to high front.",
	},
	{
		symbol: "aɪ",
		category: "vowel",
		type: "diphthong",
		articulation: {
			height: "low", // Starting position
			frontness: "central",
			roundness: "unrounded",
			tenseness: "tense",
		},
		examples: [
			{ word: "I", phonemic: "aɪ" },
			{ word: "like", phonemic: "laɪk" },
		],
		description: "low central to high front diphthong",
		guide: "Starts low central, glides to high front.",
	},
	{
		symbol: "ɔɪ",
		category: "vowel",
		type: "diphthong",
		articulation: {
			height: "low-mid", // Starting position
			frontness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
		examples: [
			{ word: "enjoy", phonemic: "ɛnˈdʒɔɪ" },
			{ word: "voice", phonemic: "vɔɪs" },
		],
		description: "mid back rounded to high front diphthong",
		guide: "Starts mid back rounded, glides to high front.",
	},
	{
		symbol: "aʊ",
		category: "vowel",
		type: "diphthong",
		articulation: {
			height: "low", // Starting position
			frontness: "central",
			roundness: "unrounded",
			tenseness: "tense",
		},
		examples: [
			{ word: "how", phonemic: "haʊ" },
			{ word: "about", phonemic: "əˈbaʊt" },
		],
		description: "low central to high back rounded diphthong",
		guide: "Starts low central, glides to high back rounded.",
	},
	{
		symbol: "oʊ",
		category: "vowel",
		type: "diphthong",
		articulation: {
			height: "low-mid", // Starting position
			frontness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
		examples: [
			{ word: "go", phonemic: "ɡoʊ" },
			{ word: "know", phonemic: "noʊ" },
		],
		description: "mid back rounded to high back diphthong",
		guide: "Starts mid back rounded, glides to high back.",
	},
];
