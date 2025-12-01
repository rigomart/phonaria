// Common spelling patterns for English phonemes
// Because English spelling is historically inconsistent, these represent general tendencies rather than fixed rules

import type { PhonemeSymbolId } from "./ipa-registry";

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
	"voiceless-bilabial-plosive": {
		patterns: ["p", "pp"],
		examples: [
			{ word: "pat", phonemic: "pæt" },
			{ word: "happy", phonemic: "ˈhæpi" },
		],
	},
	"voiced-bilabial-plosive": {
		patterns: ["b", "bb"],
		examples: [
			{ word: "bat", phonemic: "bæt" },
			{ word: "rabbit", phonemic: "ˈɹæbɪt" },
		],
	},
	"voiceless-alveolar-plosive": {
		patterns: ["t", "tt", "-ed"],
		examples: [
			{ word: "top", phonemic: "tɑp" },
			{ word: "letter", phonemic: "ˈlɛtɝ" },
			{ word: "jumped", phonemic: "dʒʌmpt" },
		],
	},
	"voiced-alveolar-plosive": {
		patterns: ["d", "dd", "-ed"],
		examples: [
			{ word: "day", phonemic: "deɪ" },
			{ word: "ladder", phonemic: "ˈlædɝ" },
			{ word: "rained", phonemic: "ɹeɪnd" },
		],
	},
	"voiceless-velar-plosive": {
		patterns: ["c", "k", "ck"],
		examples: [
			{ word: "cat", phonemic: "kæt" },
			{ word: "kid", phonemic: "kɪd" },
			{ word: "back", phonemic: "bæk" },
		],
	},
	"voiced-velar-plosive": {
		patterns: ["g", "gg"],
		examples: [
			{ word: "gum", phonemic: "ɡʌm" },
			{ word: "bigger", phonemic: "ˈbɪɡɝ" },
		],
	},

	// Nasals
	"voiced-bilabial-nasal": {
		patterns: ["m", "mm"],
		examples: [
			{ word: "ram", phonemic: "ræm" },
			{ word: "summer", phonemic: "ˈsʌmɝ" },
		],
	},
	"voiced-alveolar-nasal": {
		patterns: ["n", "nn", "kn-"],
		examples: [
			{ word: "sun", phonemic: "sʌn" },
			{ word: "dinner", phonemic: "ˈdɪnɝ" },
			{ word: "know", phonemic: "noʊ" },
		],
	},
	"voiced-velar-nasal": {
		patterns: ["-ng", "n"],
		examples: [
			{ word: "sing", phonemic: "sɪŋ" },
			{ word: "think", phonemic: "θɪŋk" },
		],
	},

	// Liquids & Approximants
	"voiced-alveolar-lateral-approximant": {
		patterns: ["l", "ll"],
		examples: [
			{ word: "let", phonemic: "lɛt" },
			{ word: "hello", phonemic: "hɛˈloʊ" },
		],
	},
	"voiced-postalveolar-approximant": {
		patterns: ["r", "rr", "wr-"],
		examples: [
			{ word: "red", phonemic: "ɹɛd" },
			{ word: "write", phonemic: "ɹaɪt" },
		],
	},
	"voiced-labial-velar-approximant": {
		patterns: ["w"],
		examples: [
			{ word: "west", phonemic: "wɛst" },
			{ word: "away", phonemic: "əˈweɪ" },
		],
	},
	"voiced-palatal-approximant": {
		patterns: ["y"],
		examples: [
			{ word: "yoke", phonemic: "joʊk" },
			{ word: "you", phonemic: "ju" },
		],
	},

	// Fricatives
	"voiceless-labiodental-fricative": {
		patterns: ["f", "ff", "ph"],
		examples: [
			{ word: "fan", phonemic: "fæn" },
			{ word: "coffee", phonemic: "ˈkɔfi" },
			{ word: "phone", phonemic: "foʊn" },
		],
	},
	"voiced-labiodental-fricative": {
		patterns: ["v"],
		examples: [
			{ word: "van", phonemic: "væn" },
			{ word: "save", phonemic: "seɪv" },
		],
	},
	"voiceless-dental-fricative": {
		patterns: ["th"],
		examples: [
			{ word: "thin", phonemic: "θɪn" },
			{ word: "think", phonemic: "θɪŋk" },
		],
	},
	"voiced-dental-fricative": {
		patterns: ["th"],
		examples: [
			{ word: "this", phonemic: "ðɪs" },
			{ word: "mother", phonemic: "ˈmʌðɝ" },
		],
	},
	"voiceless-alveolar-fricative": {
		patterns: ["s", "ss", "c"],
		examples: [
			{ word: "sun", phonemic: "sʌn" },
			{ word: "city", phonemic: "ˈsɪti" },
		],
	},
	"voiced-alveolar-fricative": {
		patterns: ["z", "-s", "zz"],
		examples: [
			{ word: "zoo", phonemic: "zu" },
			{ word: "dogs", phonemic: "dɔɡz" },
			{ word: "buzz", phonemic: "bʌz" },
		],
	},
	"voiceless-postalveolar-fricative": {
		patterns: ["sh", "-tion", "-sion"],
		examples: [
			{ word: "shop", phonemic: "ʃɑp" },
			{ word: "nation", phonemic: "ˈneɪʃən" },
		],
	},
	"voiced-postalveolar-fricative": {
		patterns: ["-sion", "-sure"],
		examples: [
			{ word: "vision", phonemic: "ˈvɪʒən" },
			{ word: "measure", phonemic: "ˈmɛʒɝ" },
		],
	},
	"voiceless-glottal-fricative": {
		patterns: ["h"],
		examples: [
			{ word: "house", phonemic: "haʊs" },
			{ word: "hello", phonemic: "hɛˈloʊ" },
		],
	},

	// Affricates
	"voiceless-postalveolar-affricate": {
		patterns: ["ch", "tch"],
		examples: [
			{ word: "cheap", phonemic: "tʃip" },
			{ word: "catch", phonemic: "kætʃ" },
		],
	},
	"voiced-postalveolar-affricate": {
		patterns: ["j", "-dge", "-ge"],
		examples: [
			{ word: "jeep", phonemic: "dʒip" },
			{ word: "bridge", phonemic: "bɹɪdʒ" },
			{ word: "page", phonemic: "peɪdʒ" },
		],
	},

	// Monophthongs - High Vowels
	"close-front-unrounded": {
		patterns: ["ee", "ea", "-y", "e"],
		examples: [
			{ word: "seed", phonemic: "sid" },
			{ word: "sea", phonemic: "si" },
			{ word: "happy", phonemic: "ˈhæpi" },
			{ word: "be", phonemic: "bi" },
		],
	},
	"near-close-near-front-unrounded": {
		patterns: ["i"],
		examples: [
			{ word: "sit", phonemic: "sɪt" },
			{ word: "big", phonemic: "bɪɡ" },
		],
	},
	"close-back-rounded": {
		patterns: ["oo", "u-e", "ew"],
		examples: [
			{ word: "food", phonemic: "fud" },
			{ word: "mood", phonemic: "mud" },
			{ word: "new", phonemic: "nu" },
		],
	},
	"near-close-near-back-rounded": {
		patterns: ["oo", "u"],
		examples: [
			{ word: "book", phonemic: "bʊk" },
			{ word: "put", phonemic: "pʊt" },
		],
	},

	// Monophthongs - Mid Vowels
	"open-mid-front-unrounded": {
		patterns: ["e", "ea"],
		examples: [
			{ word: "red", phonemic: "ɹɛd" },
			{ word: "bread", phonemic: "bɹɛd" },
		],
	},
	"mid-central-unrounded": {
		patterns: ["a", "e", "o"],
		examples: [
			{ word: "sofa", phonemic: "ˈsoʊfə" },
			{ word: "lemon", phonemic: "ˈlɛmən" },
		],
	},
	"open-mid-back-unrounded": {
		patterns: ["u", "o"],
		examples: [
			{ word: "cup", phonemic: "kʌp" },
			{ word: "love", phonemic: "lʌv" },
		],
	},
	"open-mid-back-rounded": {
		patterns: ["aw", "au", "al"],
		examples: [
			{ word: "saw", phonemic: "sɔ" },
			{ word: "cause", phonemic: "kɔz" },
			{ word: "talk", phonemic: "tɔk" },
		],
	},

	// Monophthongs - Low Vowels
	"near-open-front-unrounded": {
		patterns: ["a"],
		examples: [
			{ word: "cat", phonemic: "kæt" },
			{ word: "back", phonemic: "bæk" },
		],
	},
	"open-back-unrounded": {
		patterns: ["o", "a"],
		examples: [
			{ word: "hot", phonemic: "hɑt" },
			{ word: "father", phonemic: "ˈfɑðɝ" },
		],
	},

	// Diphthongs
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		patterns: ["a-e", "ai", "-ay"],
		examples: [
			{ word: "make", phonemic: "meɪk" },
			{ word: "rain", phonemic: "ɹeɪn" },
			{ word: "day", phonemic: "deɪ" },
		],
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		patterns: ["i-e", "igh", "-y"],
		examples: [
			{ word: "time", phonemic: "taɪm" },
			{ word: "night", phonemic: "naɪt" },
			{ word: "my", phonemic: "maɪ" },
		],
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		patterns: ["oi", "-oy"],
		examples: [
			{ word: "coin", phonemic: "kɔɪn" },
			{ word: "boy", phonemic: "bɔɪ" },
		],
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		patterns: ["o", "oa", "o-e"],
		examples: [
			{ word: "code", phonemic: "koʊd" },
			{ word: "boat", phonemic: "boʊt" },
			{ word: "home", phonemic: "hoʊm" },
		],
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		patterns: ["ou", "ow"],
		examples: [
			{ word: "out", phonemic: "aʊt" },
			{ word: "now", phonemic: "naʊ" },
		],
	},

	// R-colored vowels
	"r-colored-open-mid-central": {
		patterns: ["er", "ir", "ur", "or"],
		examples: [
			{ word: "her", phonemic: "hɝ" },
			{ word: "bird", phonemic: "bɝd" },
			{ word: "turn", phonemic: "tɝn" },
			{ word: "work", phonemic: "wɝk" },
		],
	},
};
