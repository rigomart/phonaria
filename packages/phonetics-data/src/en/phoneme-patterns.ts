// Common spelling patterns for English phonemes
// Because English spelling is historically inconsistent, these represent general tendencies rather than fixed rules

import type { PhonemeSymbolId } from "../core/ipa-registry";

//? Future:examples should be per pattern, also add fields for position (coda, onset, etc.)
export type SpellingPattern = {
	patterns: string[];
	examples: {
		word: string;
		phonemic: string;
	}[];
};

export const PhonemeSpellingPatternRegistry: Partial<Record<PhonemeSymbolId, SpellingPattern>> = {
	// Plosives
	P: {
		patterns: ["p", "pp"],
		examples: [
			{ word: "pat", phonemic: "pæt" },
			{ word: "happy", phonemic: "ˈhæpi" },
		],
	},
	B: {
		patterns: ["b", "bb"],
		examples: [
			{ word: "bat", phonemic: "bæt" },
			{ word: "rabbit", phonemic: "ˈɹæbɪt" },
		],
	},
	T: {
		patterns: ["t", "tt", "-ed"],
		examples: [
			{ word: "top", phonemic: "tɑp" },
			{ word: "letter", phonemic: "ˈlɛtɝ" },
			{ word: "jumped", phonemic: "dʒʌmpt" },
		],
	},
	D: {
		patterns: ["d", "dd", "-ed"],
		examples: [
			{ word: "day", phonemic: "deɪ" },
			{ word: "ladder", phonemic: "ˈlædɝ" },
			{ word: "rained", phonemic: "ɹeɪnd" },
		],
	},
	K: {
		patterns: ["c", "k", "ck"],
		examples: [
			{ word: "cat", phonemic: "kæt" },
			{ word: "kid", phonemic: "kɪd" },
			{ word: "back", phonemic: "bæk" },
		],
	},
	G: {
		patterns: ["g", "gg"],
		examples: [
			{ word: "gum", phonemic: "ɡʌm" },
			{ word: "bigger", phonemic: "ˈbɪɡɝ" },
		],
	},

	// Nasals
	M: {
		patterns: ["m", "mm"],
		examples: [
			{ word: "ram", phonemic: "ræm" },
			{ word: "summer", phonemic: "ˈsʌmɝ" },
		],
	},
	N: {
		patterns: ["n", "nn", "kn-"],
		examples: [
			{ word: "sun", phonemic: "sʌn" },
			{ word: "dinner", phonemic: "ˈdɪnɝ" },
			{ word: "know", phonemic: "noʊ" },
		],
	},
	NG: {
		patterns: ["-ng", "n"],
		examples: [
			{ word: "sing", phonemic: "sɪŋ" },
			{ word: "think", phonemic: "θɪŋk" },
		],
	},

	// Liquids & Approximants
	L: {
		patterns: ["l", "ll"],
		examples: [
			{ word: "let", phonemic: "lɛt" },
			{ word: "hello", phonemic: "hɛˈloʊ" },
		],
	},
	R: {
		patterns: ["r", "rr", "wr-"],
		examples: [
			{ word: "red", phonemic: "ɹɛd" },
			{ word: "write", phonemic: "ɹaɪt" },
		],
	},
	W: {
		patterns: ["w"],
		examples: [
			{ word: "west", phonemic: "wɛst" },
			{ word: "away", phonemic: "əˈweɪ" },
		],
	},
	Y: {
		patterns: ["y"],
		examples: [
			{ word: "yoke", phonemic: "joʊk" },
			{ word: "you", phonemic: "ju" },
		],
	},

	// Fricatives
	F: {
		patterns: ["f", "ff", "ph"],
		examples: [
			{ word: "fan", phonemic: "fæn" },
			{ word: "coffee", phonemic: "ˈkɔfi" },
			{ word: "phone", phonemic: "foʊn" },
		],
	},
	V: {
		patterns: ["v"],
		examples: [
			{ word: "van", phonemic: "væn" },
			{ word: "save", phonemic: "seɪv" },
		],
	},
	TH: {
		patterns: ["th"],
		examples: [
			{ word: "thin", phonemic: "θɪn" },
			{ word: "think", phonemic: "θɪŋk" },
		],
	},
	DH: {
		patterns: ["th"],
		examples: [
			{ word: "this", phonemic: "ðɪs" },
			{ word: "mother", phonemic: "ˈmʌðɝ" },
		],
	},
	S: {
		patterns: ["s", "ss", "c"],
		examples: [
			{ word: "sun", phonemic: "sʌn" },
			{ word: "city", phonemic: "ˈsɪti" },
		],
	},
	Z: {
		patterns: ["z", "-s", "zz"],
		examples: [
			{ word: "zoo", phonemic: "zu" },
			{ word: "dogs", phonemic: "dɔɡz" },
			{ word: "buzz", phonemic: "bʌz" },
		],
	},
	SH: {
		patterns: ["sh", "-tion", "-sion"],
		examples: [
			{ word: "shop", phonemic: "ʃɑp" },
			{ word: "nation", phonemic: "ˈneɪʃən" },
		],
	},
	ZH: {
		patterns: ["-sion", "-sure"],
		examples: [
			{ word: "vision", phonemic: "ˈvɪʒən" },
			{ word: "measure", phonemic: "ˈmɛʒɝ" },
		],
	},
	H: {
		patterns: ["h"],
		examples: [
			{ word: "house", phonemic: "haʊs" },
			{ word: "hello", phonemic: "hɛˈloʊ" },
		],
	},

	// Affricates
	CH: {
		patterns: ["ch", "tch"],
		examples: [
			{ word: "cheap", phonemic: "tʃip" },
			{ word: "catch", phonemic: "kætʃ" },
		],
	},
	J: {
		patterns: ["j", "-dge", "-ge"],
		examples: [
			{ word: "jeep", phonemic: "dʒip" },
			{ word: "bridge", phonemic: "bɹɪdʒ" },
			{ word: "page", phonemic: "peɪdʒ" },
		],
	},

	// Monophthongs - High Vowels
	I: {
		patterns: ["ee", "ea", "-y", "e"],
		examples: [
			{ word: "seed", phonemic: "sid" },
			{ word: "sea", phonemic: "si" },
			{ word: "happy", phonemic: "ˈhæpi" },
			{ word: "be", phonemic: "bi" },
		],
	},
	IX: {
		patterns: ["i"],
		examples: [
			{ word: "sit", phonemic: "sɪt" },
			{ word: "big", phonemic: "bɪɡ" },
		],
	},
	U: {
		patterns: ["oo", "u-e", "ew"],
		examples: [
			{ word: "food", phonemic: "fud" },
			{ word: "mood", phonemic: "mud" },
			{ word: "new", phonemic: "nu" },
		],
	},
	UX: {
		patterns: ["oo", "u"],
		examples: [
			{ word: "book", phonemic: "bʊk" },
			{ word: "put", phonemic: "pʊt" },
		],
	},

	// Monophthongs - Mid Vowels
	E: {
		patterns: ["e", "ea"],
		examples: [
			{ word: "red", phonemic: "ɹɛd" },
			{ word: "bread", phonemic: "bɹɛd" },
		],
	},
	AX: {
		patterns: ["a", "e", "o"],
		examples: [
			{ word: "sofa", phonemic: "ˈsoʊfə" },
			{ word: "lemon", phonemic: "ˈlɛmən" },
		],
	},
	AH: {
		patterns: ["u", "o"],
		examples: [
			{ word: "cup", phonemic: "kʌp" },
			{ word: "love", phonemic: "lʌv" },
		],
	},
	O: {
		patterns: ["aw", "au", "al"],
		examples: [
			{ word: "saw", phonemic: "sɔ" },
			{ word: "cause", phonemic: "kɔz" },
			{ word: "talk", phonemic: "tɔk" },
		],
	},

	// Monophthongs - Low Vowels
	AE: {
		patterns: ["a"],
		examples: [
			{ word: "cat", phonemic: "kæt" },
			{ word: "back", phonemic: "bæk" },
		],
	},
	A: {
		patterns: ["o", "a"],
		examples: [
			{ word: "hot", phonemic: "hɑt" },
			{ word: "father", phonemic: "ˈfɑðɝ" },
		],
	},

	// Diphthongs
	EI: {
		patterns: ["a-e", "ai", "-ay"],
		examples: [
			{ word: "make", phonemic: "meɪk" },
			{ word: "rain", phonemic: "ɹeɪn" },
			{ word: "day", phonemic: "deɪ" },
		],
	},
	AI: {
		patterns: ["i-e", "igh", "-y"],
		examples: [
			{ word: "time", phonemic: "taɪm" },
			{ word: "night", phonemic: "naɪt" },
			{ word: "my", phonemic: "maɪ" },
		],
	},
	OI: {
		patterns: ["oi", "-oy"],
		examples: [
			{ word: "coin", phonemic: "kɔɪn" },
			{ word: "boy", phonemic: "bɔɪ" },
		],
	},
	OU: {
		patterns: ["o", "oa", "o-e"],
		examples: [
			{ word: "code", phonemic: "koʊd" },
			{ word: "boat", phonemic: "boʊt" },
			{ word: "home", phonemic: "hoʊm" },
		],
	},
	AU: {
		patterns: ["ou", "ow"],
		examples: [
			{ word: "out", phonemic: "aʊt" },
			{ word: "now", phonemic: "naʊ" },
		],
	},

	// R-colored vowels
	ER: {
		patterns: ["er", "ir", "ur", "or"],
		examples: [
			{ word: "her", phonemic: "hɝ" },
			{ word: "bird", phonemic: "bɝd" },
			{ word: "turn", phonemic: "tɝn" },
			{ word: "work", phonemic: "wɝk" },
		],
	},
};
