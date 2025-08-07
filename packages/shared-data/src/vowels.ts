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
			{ word: "need", audioUrl: "/need.mp3", phonemic: "/nid/" },
			{ word: "free", audioUrl: "/free.mp3", phonemic: "/fri/" },
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
			{ word: "is", audioUrl: "/is.mp3", phonemic: "/ɪz/" },
			{ word: "this", audioUrl: "/this.mp3", phonemic: "/ðɪs/" },
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
			{ word: "get", audioUrl: "/get.mp3", phonemic: "/ɡɛt/" },
			{ word: "when", audioUrl: "/when.mp3", phonemic: "/wɛn/" },
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
			{ word: "and", audioUrl: "/and.mp3", phonemic: "/ænd/" },
			{ word: "had", audioUrl: "/had.mp3", phonemic: "/hæd/" },
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
			frontness: "back",
			roundness: "unrounded",
			tenseness: "lax",
		},
		examples: [
			{ word: "but", audioUrl: "/but.mp3", phonemic: "/bʌt/" },
			{ word: "up", audioUrl: "/up.mp3", phonemic: "/ʌp/" },
		],
		description: "low-mid back unrounded vowel",
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
			{ word: "the", audioUrl: "/the.mp3", phonemic: "/ðə/" },
			{ word: "a", audioUrl: "/a.mp3", phonemic: "/ə/" },
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
			{ word: "not", audioUrl: "/not.mp3", phonemic: "/nɑt/" },
			{ word: "stop", audioUrl: "/stop.mp3", phonemic: "/stɑp/" },
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
			{ word: "all", audioUrl: "/all.mp3", phonemic: "/ɔl/" },
			{ word: "call", audioUrl: "/call.mp3", phonemic: "/kɔl/" },
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
			{ word: "look", audioUrl: "/look.mp3", phonemic: "/lʊk/" },
			{ word: "could", audioUrl: "/could.mp3", phonemic: "/kʊd/" },
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
			{ word: "do", audioUrl: "/do.mp3", phonemic: "/du/" },
			{ word: "too", audioUrl: "/too.mp3", phonemic: "/tu/" },
		],
		description: "high back tense rounded vowel",
		guide: "Tongue high and back, lips pursed.",
	},

	// R-colored vowel (Rhotic)
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
			{ word: "first", audioUrl: "/first.mp3", phonemic: "/fɝst/" },
			{ word: "work", audioUrl: "/work.mp3", phonemic: "/wɝk/" },
		],
		description: "mid central r-colored vowel",
		guide: "Tongue mid and central with r-like coloring.",
		allophones: [
			{
				variant: "ɚ",
				description: "Unstressed version in syllables.",
				examples: [
					{ word: "better", audioUrl: "/better.mp3", phonemic: "/bɛtɚ/" },
					{ word: "after", audioUrl: "/after.mp3", phonemic: "/æftɚ/" },
				],
				context: "Unstressed syllables",
			},
		],
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
			{ word: "say", audioUrl: "/say.mp3", phonemic: "/seɪ/" },
			{ word: "way", audioUrl: "/way.mp3", phonemic: "/weɪ/" },
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
			{ word: "I", audioUrl: "/I.mp3", phonemic: "/aɪ/" },
			{ word: "like", audioUrl: "/like.mp3", phonemic: "/laɪk/" },
		],
		description: "low central to high front diphthong",
		guide: "Starts low central, glides to high front.",
	},
	{
		symbol: "oɪ",
		category: "vowel",
		type: "diphthong",
		articulation: {
			height: "low-mid", // Starting position
			frontness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
		examples: [
			{ word: "enjoy", audioUrl: "/enjoy.mp3", phonemic: "/ɪnˈdʒoɪ/" },
			{ word: "voice", audioUrl: "/voice.mp3", phonemic: "/voɪs/" },
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
			{ word: "how", audioUrl: "/how.mp3", phonemic: "/haʊ/" },
			{ word: "about", audioUrl: "/about.mp3", phonemic: "/əˈbaʊt/" },
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
			{ word: "go", audioUrl: "/go.mp3", phonemic: "/ɡoʊ/" },
			{ word: "know", audioUrl: "/know.mp3", phonemic: "/noʊ/" },
		],
		description: "mid back rounded to high back diphthong",
		guide: "Starts mid back rounded, glides to high back.",
	},
];
