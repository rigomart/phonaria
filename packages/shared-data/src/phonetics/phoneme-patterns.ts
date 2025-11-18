// Common spelling patterns for English phonemes
// Because English spelling is historically inconsistent, these represent general tendencies rather than fixed rules

import type { PhonemeSymbolId } from "./symbols-registry";

//? Future:examples should be per pattern, also add fields for position (coda, onset, etc.)
type SpellingPattern = {
	patterns: string[];
	examples: {
		word: string;
		phonemic: string;
	}[];
};

export const PhonemeSpellingPatternRegistry: Partial<Record<PhonemeSymbolId, SpellingPattern>> = {
	// Consonants
	"voiceless-velar-plosive": {
		patterns: ["ck", "ke", "ki", "ky", "ca", "co", "cu"],
		examples: [
			{ word: "back", phonemic: "bæk" },
			{ word: "kite", phonemic: "kaɪt" },
			{ word: "cat", phonemic: "kæt" },
		],
	},
	"voiced-velar-plosive": {
		patterns: ["gue", "gui", "gg"],
		examples: [
			{ word: "guest", phonemic: "ɡɛst" },
			{ word: "guide", phonemic: "ɡaɪd" },
			{ word: "bigger", phonemic: "ˈbɪɡɚ" },
		],
	},
	"voiceless-postalveolar-affricate": {
		patterns: ["tch", "ch"],
		examples: [
			{ word: "catch", phonemic: "kætʃ" },
			{ word: "chair", phonemic: "tʃɛɹ" },
		],
	},
	"voiced-postalveolar-affricate": {
		patterns: ["dge", "j-", "-ge"],
		examples: [
			{ word: "edge", phonemic: "ɛdʒ" },
			{ word: "jam", phonemic: "dʒæm" },
			{ word: "page", phonemic: "peɪdʒ" },
		],
	},
	"voiceless-postalveolar-fricative": {
		patterns: ["sh", "tion", "cial", "cient", "ssion"],
		examples: [
			{ word: "ship", phonemic: "ʃɪp" },
			{ word: "nation", phonemic: "ˈneɪʃən" },
			{ word: "special", phonemic: "ˈspɛʃəl" },
		],
	},
	"voiceless-alveolar-fricative": {
		patterns: ["ss", "ce", "ci", "cy"],
		examples: [
			{ word: "pass", phonemic: "pæs" },
			{ word: "city", phonemic: "ˈsɪti" },
			{ word: "cycle", phonemic: "ˈsaɪkəl" },
		],
	},
	"voiced-alveolar-fricative": {
		patterns: ["zz"],
		examples: [
			{ word: "buzz", phonemic: "bʌz" },
			{ word: "fuzzy", phonemic: "ˈfʌzi" },
		],
	},
	"voiceless-dental-fricative": {
		patterns: ["th-"],
		examples: [
			{ word: "think", phonemic: "θɪŋk" },
			{ word: "thin", phonemic: "θɪn" },
		],
	},
	"voiced-velar-nasal": {
		patterns: ["-ng"],
		examples: [
			{ word: "sing", phonemic: "sɪŋ" },
			{ word: "long", phonemic: "lɔŋ" },
		],
	},
	"voiced-alveolar-nasal": {
		patterns: ["kn-", "gn-"],
		examples: [
			{ word: "know", phonemic: "noʊ" },
			{ word: "gnome", phonemic: "noʊm" },
		],
	},
	"voiced-postalveolar-approximant": {
		patterns: ["wr-"],
		examples: [
			{ word: "write", phonemic: "ɹaɪt" },
			{ word: "wrist", phonemic: "ɹɪst" },
		],
	},
	"voiceless-labiodental-fricative": {
		patterns: ["ph"],
		examples: [
			{ word: "phone", phonemic: "foʊn" },
			{ word: "elephant", phonemic: "ˈɛləfənt" },
		],
	},
	"voiced-labiodental-fricative": {
		patterns: ["-ve"],
		examples: [
			{ word: "have", phonemic: "hæv" },
			{ word: "give", phonemic: "ɡɪv" },
		],
	},
	"voiced-labial-velar-approximant": {
		patterns: ["wh-"],
		examples: [
			{ word: "what", phonemic: "wʌt" },
			{ word: "white", phonemic: "waɪt" },
		],
	},
	"voiced-palatal-approximant": {
		patterns: ["y-"],
		examples: [
			{ word: "yes", phonemic: "jɛs" },
			{ word: "yoga", phonemic: "ˈjoʊɡə" },
		],
	},

	// Monophthongs
	"close-front-unrounded": {
		patterns: ["ee", "e-e", "-y"],
		examples: [
			{ word: "see", phonemic: "si" },
			{ word: "these", phonemic: "ðiz" },
			{ word: "happy", phonemic: "ˈhæpi" },
		],
	},
	"close-back-rounded": {
		patterns: ["-ue", "ui"],
		examples: [
			{ word: "blue", phonemic: "blu" },
			{ word: "fruit", phonemic: "fɹut" },
		],
	},
	"open-mid-back-rounded": {
		patterns: ["aw", "au"],
		examples: [
			{ word: "saw", phonemic: "sɔ" },
			{ word: "author", phonemic: "ˈɔθɚ" },
		],
	},
	"mid-central-unrounded": {
		patterns: ["-a"],
		examples: [
			{ word: "sofa", phonemic: "ˈsoʊfə" },
			{ word: "panda", phonemic: "ˈpændə" },
		],
	},

	// Diphthongs
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		patterns: ["ai", "-ay", "a-e", "eigh"],
		examples: [
			{ word: "rain", phonemic: "ɹeɪn" },
			{ word: "day", phonemic: "deɪ" },
			{ word: "name", phonemic: "neɪm" },
			{ word: "eight", phonemic: "eɪt" },
		],
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		patterns: ["oa", "o-e", "-ow"],
		examples: [
			{ word: "boat", phonemic: "boʊt" },
			{ word: "home", phonemic: "hoʊm" },
			{ word: "snow", phonemic: "snoʊ" },
		],
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		patterns: ["i-e", "igh"],
		examples: [
			{ word: "time", phonemic: "taɪm" },
			{ word: "night", phonemic: "naɪt" },
		],
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		patterns: ["ou"],
		examples: [
			{ word: "out", phonemic: "aʊt" },
			{ word: "cloud", phonemic: "klaʊd" },
		],
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		patterns: ["oi", "-oy"],
		examples: [
			{ word: "coin", phonemic: "kɔɪn" },
			{ word: "boy", phonemic: "bɔɪ" },
		],
	},

	// Rhotics
	"mid-central-rhotic-tense": {
		patterns: ["er", "ir", "ur"],
		examples: [
			{ word: "her", phonemic: "hɝ" },
			{ word: "bird", phonemic: "bɝd" },
			{ word: "turn", phonemic: "tɝn" },
		],
	},
	"mid-central-rhotic-lax": {
		patterns: ["-er"],
		examples: [
			{ word: "teacher", phonemic: "ˈtitʃɚ" },
			{ word: "water", phonemic: "ˈwɔtɚ" },
		],
	},
};
