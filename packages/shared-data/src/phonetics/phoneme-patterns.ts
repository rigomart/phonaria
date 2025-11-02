// Common spelling patterns for English phonemes
// Because English spelling is historically inconsistent, these represent general tendencies rather than fixed rules

import type { PhonemeSymbolId, PhonemeSymbolIpa } from "./symbols/registry";

// TODO: Future:examples should be per pattern, also add fields for position (coda, onset, etc.)
type SpellingPattern = {
	patterns: string[];
	examples: {
		word: {
			characters: string[];
			highlight: number[];
		};
		phonemic: {
			phones: PhonemeSymbolIpa[];
			highlight: number[];
		};
		audioUrl?: string;
	}[];
};

export const phonemeSpellingPatterns: Partial<Record<PhonemeSymbolId, SpellingPattern>> = {
	// Consonants
	"voiceless-velar-stop": {
		patterns: ["ck", "ke", "ki", "ky", "ca", "co", "cu"],
		examples: [
			{
				word: { characters: ["b", "a", "c", "k"], highlight: [2, 3] },
				phonemic: { phones: ["b", "æ", "k"], highlight: [2] },
			},
			{
				word: { characters: ["k", "i", "t", "e"], highlight: [0, 1] },
				phonemic: { phones: ["k", "aɪ", "t"], highlight: [0] },
			},
			{
				word: { characters: ["c", "a", "t"], highlight: [0, 1] },
				phonemic: { phones: ["k", "æ", "t"], highlight: [0] },
			},
		],
	},
	"voiced-velar-stop": {
		patterns: ["gue", "gui", "gg"],
		examples: [
			{
				word: { characters: ["g", "u", "e", "s", "t"], highlight: [0, 1, 2] },
				phonemic: { phones: ["ɡ", "ɛ", "s", "t"], highlight: [0] },
			},
			{
				word: { characters: ["g", "u", "i", "d", "e"], highlight: [0, 1, 2] },
				phonemic: { phones: ["ɡ", "aɪ", "d"], highlight: [0] },
			},
			{
				word: { characters: ["b", "i", "g", "g", "e", "r"], highlight: [2, 3] },
				phonemic: { phones: ["b", "ɪ", "ɡ", "ɚ"], highlight: [2] },
			},
		],
	},
	"voiceless-postalveolar-affricate": {
		patterns: ["tch", "ch"],
		examples: [
			{
				word: { characters: ["c", "a", "t", "c", "h"], highlight: [2, 3, 4] },
				phonemic: { phones: ["k", "æ", "tʃ"], highlight: [2] },
			},
			{
				word: { characters: ["c", "h", "a", "i", "r"], highlight: [0, 1] },
				phonemic: { phones: ["tʃ", "ɛ", "ɹ"], highlight: [0] },
			},
		],
	},
	"voiced-postalveolar-affricate": {
		patterns: ["dge", "j-", "-ge"],
		examples: [
			{
				word: { characters: ["e", "d", "g", "e"], highlight: [1, 2, 3] },
				phonemic: { phones: ["ɛ", "dʒ"], highlight: [1] },
			},
			{
				word: { characters: ["j", "a", "m"], highlight: [0] },
				phonemic: { phones: ["dʒ", "æ", "m"], highlight: [0] },
			},
			{
				word: { characters: ["p", "a", "g", "e"], highlight: [2, 3] },
				phonemic: { phones: ["p", "eɪ", "dʒ"], highlight: [2] },
			},
		],
	},
	"voiceless-postalveolar-fricative": {
		patterns: ["sh", "tion", "cial", "cient", "ssion"],
		examples: [
			{
				word: { characters: ["s", "h", "i", "p"], highlight: [0, 1] },
				phonemic: { phones: ["ʃ", "ɪ", "p"], highlight: [0] },
			},
			{
				word: { characters: ["n", "a", "t", "i", "o", "n"], highlight: [2, 3, 4, 5] },
				phonemic: { phones: ["n", "eɪ", "ʃ", "ə", "n"], highlight: [2] },
			},
			{
				word: { characters: ["s", "p", "e", "c", "i", "a", "l"], highlight: [3, 4, 5, 6] },
				phonemic: { phones: ["s", "p", "ɛ", "ʃ", "ə", "l"], highlight: [3] },
			},
		],
	},
	"voiceless-alveolar-fricative": {
		patterns: ["ss", "ce", "ci", "cy"],
		examples: [
			{
				word: { characters: ["p", "a", "s", "s"], highlight: [2, 3] },
				phonemic: { phones: ["p", "æ", "s"], highlight: [2] },
			},
			{
				word: { characters: ["c", "i", "t", "y"], highlight: [0, 1] },
				phonemic: { phones: ["s", "ɪ", "t", "i"], highlight: [0] },
			},
			{
				word: { characters: ["c", "y", "c", "l", "e"], highlight: [0, 1] },
				phonemic: { phones: ["s", "aɪ", "k", "ə", "l"], highlight: [0] },
			},
		],
	},
	"voiced-alveolar-fricative": {
		patterns: ["zz"],
		examples: [
			{
				word: { characters: ["b", "u", "z", "z"], highlight: [2, 3] },
				phonemic: { phones: ["b", "ʌ", "z"], highlight: [2] },
			},
			{
				word: { characters: ["f", "u", "z", "z", "y"], highlight: [2, 3] },
				phonemic: { phones: ["f", "ʌ", "z", "i"], highlight: [2] },
			},
		],
	},
	"voiceless-dental-fricative": {
		patterns: ["th-"],
		examples: [
			{
				word: { characters: ["t", "h", "i", "n", "k"], highlight: [0, 1] },
				phonemic: { phones: ["θ", "ɪ", "ŋ", "k"], highlight: [0] },
			},
			{
				word: { characters: ["t", "h", "i", "n"], highlight: [0, 1] },
				phonemic: { phones: ["θ", "ɪ", "n"], highlight: [0] },
			},
		],
	},
	"voiced-velar-nasal": {
		patterns: ["-ng"],
		examples: [
			{
				word: { characters: ["s", "i", "n", "g"], highlight: [2, 3] },
				phonemic: { phones: ["s", "ɪ", "ŋ"], highlight: [2] },
			},
			{
				word: { characters: ["l", "o", "n", "g"], highlight: [2, 3] },
				phonemic: { phones: ["l", "ɔ", "ŋ"], highlight: [2] },
			},
		],
	},
	"voiced-alveolar-nasal": {
		patterns: ["kn-", "gn-"],
		examples: [
			{
				word: { characters: ["k", "n", "o", "w"], highlight: [0, 1] },
				phonemic: { phones: ["n", "oʊ"], highlight: [0] },
			},
			{
				word: { characters: ["g", "n", "o", "m", "e"], highlight: [0, 1] },
				phonemic: { phones: ["n", "oʊ", "m"], highlight: [0] },
			},
		],
	},
	"voiced-postalveolar-approximant": {
		patterns: ["wr-"],
		examples: [
			{
				word: { characters: ["w", "r", "i", "t", "e"], highlight: [0, 1] },
				phonemic: { phones: ["ɹ", "aɪ", "t"], highlight: [0] },
			},
			{
				word: { characters: ["w", "r", "i", "s", "t"], highlight: [0, 1] },
				phonemic: { phones: ["ɹ", "ɪ", "s", "t"], highlight: [0] },
			},
		],
	},
	"voiceless-labiodental-fricative": {
		patterns: ["ph"],
		examples: [
			{
				word: { characters: ["p", "h", "o", "n", "e"], highlight: [0, 1] },
				phonemic: { phones: ["f", "oʊ", "n"], highlight: [0] },
			},
			{
				word: { characters: ["e", "l", "e", "p", "h", "a", "n", "t"], highlight: [3, 4] },
				phonemic: { phones: ["ɛ", "l", "ə", "f", "ə", "n", "t"], highlight: [3] },
			},
		],
	},
	"voiced-labiodental-fricative": {
		patterns: ["-ve"],
		examples: [
			{
				word: { characters: ["h", "a", "v", "e"], highlight: [2, 3] },
				phonemic: { phones: ["h", "æ", "v"], highlight: [2] },
			},
			{
				word: { characters: ["g", "i", "v", "e"], highlight: [2, 3] },
				phonemic: { phones: ["ɡ", "ɪ", "v"], highlight: [2] },
			},
		],
	},
	"voiced-labial-velar-approximant": {
		patterns: ["wh-"],
		examples: [
			{
				word: { characters: ["w", "h", "a", "t"], highlight: [0, 1] },
				phonemic: { phones: ["w", "ʌ", "t"], highlight: [0] },
			},
			{
				word: { characters: ["w", "h", "i", "t", "e"], highlight: [0, 1] },
				phonemic: { phones: ["w", "aɪ", "t"], highlight: [0] },
			},
		],
	},
	"voiced-palatal-approximant": {
		patterns: ["y-"],
		examples: [
			{
				word: { characters: ["y", "e", "s"], highlight: [0] },
				phonemic: { phones: ["j", "ɛ", "s"], highlight: [0] },
			},
			{
				word: { characters: ["y", "o", "g", "a"], highlight: [0] },
				phonemic: { phones: ["j", "oʊ", "ɡ", "ə"], highlight: [0] },
			},
		],
	},

	// Monophthongs
	"close-front-unrounded": {
		patterns: ["ee", "e-e", "-y"],
		examples: [
			{
				word: { characters: ["s", "e", "e"], highlight: [1, 2] },
				phonemic: { phones: ["s", "i"], highlight: [1] },
			},
			{
				word: { characters: ["t", "h", "e", "s", "e"], highlight: [2, 4] },
				phonemic: { phones: ["ð", "i", "z"], highlight: [1] },
			},
			{
				word: { characters: ["h", "a", "p", "p", "y"], highlight: [4] },
				phonemic: { phones: ["h", "æ", "p", "i"], highlight: [3] },
			},
		],
	},
	"close-back-rounded": {
		patterns: ["-ue", "ui"],
		examples: [
			{
				word: { characters: ["b", "l", "u", "e"], highlight: [2, 3] },
				phonemic: { phones: ["b", "l", "u"], highlight: [2] },
			},
			{
				word: { characters: ["f", "r", "u", "i", "t"], highlight: [2, 3] },
				phonemic: { phones: ["f", "ɹ", "u", "t"], highlight: [2] },
			},
		],
	},
	"open-mid-back-rounded": {
		patterns: ["aw", "au"],
		examples: [
			{
				word: { characters: ["s", "a", "w"], highlight: [1, 2] },
				phonemic: { phones: ["s", "ɔ"], highlight: [1] },
			},
			{
				word: { characters: ["a", "u", "t", "h", "o", "r"], highlight: [0, 1] },
				phonemic: { phones: ["ɔ", "θ", "ɚ"], highlight: [0] },
			},
		],
	},
	"mid-central-unrounded": {
		patterns: ["-a"],
		examples: [
			{
				word: { characters: ["s", "o", "f", "a"], highlight: [3] },
				phonemic: { phones: ["s", "oʊ", "f", "ə"], highlight: [3] },
			},
			{
				word: { characters: ["p", "a", "n", "d", "a"], highlight: [4] },
				phonemic: { phones: ["p", "æ", "n", "d", "ə"], highlight: [4] },
			},
		],
	},

	// Diphthongs
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		patterns: ["ai", "-ay", "a-e", "eigh"],
		examples: [
			{
				word: { characters: ["r", "a", "i", "n"], highlight: [1, 2] },
				phonemic: { phones: ["ɹ", "eɪ", "n"], highlight: [1] },
			},
			{
				word: { characters: ["d", "a", "y"], highlight: [1, 2] },
				phonemic: { phones: ["d", "eɪ"], highlight: [1] },
			},
			{
				word: { characters: ["n", "a", "m", "e"], highlight: [1, 3] },
				phonemic: { phones: ["n", "eɪ", "m"], highlight: [1] },
			},
			{
				word: { characters: ["e", "i", "g", "h", "t"], highlight: [0, 1, 2, 3] },
				phonemic: { phones: ["eɪ", "t"], highlight: [0] },
			},
		],
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		patterns: ["oa", "o-e", "-ow"],
		examples: [
			{
				word: { characters: ["b", "o", "a", "t"], highlight: [1, 2] },
				phonemic: { phones: ["b", "oʊ", "t"], highlight: [1] },
			},
			{
				word: { characters: ["h", "o", "m", "e"], highlight: [1, 3] },
				phonemic: { phones: ["h", "oʊ", "m"], highlight: [1] },
			},
			{
				word: { characters: ["s", "n", "o", "w"], highlight: [2, 3] },
				phonemic: { phones: ["s", "n", "oʊ"], highlight: [2] },
			},
		],
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		patterns: ["i-e", "igh"],
		examples: [
			{
				word: { characters: ["t", "i", "m", "e"], highlight: [1, 3] },
				phonemic: { phones: ["t", "aɪ", "m"], highlight: [1] },
			},
			{
				word: { characters: ["n", "i", "g", "h", "t"], highlight: [1, 2, 3] },
				phonemic: { phones: ["n", "aɪ", "t"], highlight: [1] },
			},
		],
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		patterns: ["ou"],
		examples: [
			{
				word: { characters: ["o", "u", "t"], highlight: [0, 1] },
				phonemic: { phones: ["aʊ", "t"], highlight: [0] },
			},
			{
				word: { characters: ["c", "l", "o", "u", "d"], highlight: [2, 3] },
				phonemic: { phones: ["k", "l", "aʊ", "d"], highlight: [2] },
			},
		],
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		patterns: ["oi", "-oy"],
		examples: [
			{
				word: { characters: ["c", "o", "i", "n"], highlight: [1, 2] },
				phonemic: { phones: ["k", "ɔɪ", "n"], highlight: [1] },
			},
			{
				word: { characters: ["b", "o", "y"], highlight: [1, 2] },
				phonemic: { phones: ["b", "ɔɪ"], highlight: [1] },
			},
		],
	},

	// Rhotics
	"mid-central-rhotic-tense": {
		patterns: ["er", "ir", "ur"],
		examples: [
			{
				word: { characters: ["h", "e", "r"], highlight: [1, 2] },
				phonemic: { phones: ["h", "ɝ"], highlight: [1] },
			},
			{
				word: { characters: ["b", "i", "r", "d"], highlight: [1, 2] },
				phonemic: { phones: ["b", "ɝ", "d"], highlight: [1] },
			},
			{
				word: { characters: ["t", "u", "r", "n"], highlight: [1, 2] },
				phonemic: { phones: ["t", "ɝ", "n"], highlight: [1] },
			},
		],
	},
	"mid-central-rhotic-lax": {
		patterns: ["-er"],
		examples: [
			{
				word: { characters: ["t", "e", "a", "c", "h", "e", "r"], highlight: [5, 6] },
				phonemic: { phones: ["t", "i", "tʃ", "ɚ"], highlight: [3] },
			},
			{
				word: { characters: ["w", "a", "t", "e", "r"], highlight: [3, 4] },
				phonemic: { phones: ["w", "ɔ", "t", "ɚ"], highlight: [3] },
			},
		],
	},
};
