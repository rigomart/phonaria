// Base types

export type PhonemeCategory =
	| "consonant"
	| "vowel/monophthong"
	| "vowel/diphthong"
	| "vowel/rhotic";

type PhonemeSymbolEntry<Ipa extends string = string, Arpa extends string = string> = {
	ipa: Ipa;
	arpa: Arpa;
	category: PhonemeCategory;
};

// Consonants

export type ConsonantArticulatoryFeatures = {
	voicing: "voiced" | "voiceless";
	place:
		| "bilabial"
		| "alveolar"
		| "velar"
		| "labial-velar"
		| "palatal"
		| "labiodental"
		| "glottal"
		| "postalveolar"
		| "dental"
		| "alveolar-lateral";
	manner: "plosive" | "fricative" | "affricate" | "nasal" | "approximant";
};

export type ConsonantPhonemeArticulatoryFeatureKey = keyof ConsonantArticulatoryFeatures;

type ConsonantPhonemeIdPattern =
	`${ConsonantArticulatoryFeatures["voicing"]}-${ConsonantArticulatoryFeatures["place"]}-${ConsonantArticulatoryFeatures["manner"]}`;

export const ConsonantSymbolRegistry = {
	"voiceless-bilabial-plosive": { ipa: "p", arpa: "P", category: "consonant" },
	"voiced-bilabial-plosive": { ipa: "b", arpa: "B", category: "consonant" },
	"voiceless-alveolar-plosive": { ipa: "t", arpa: "T", category: "consonant" },
	"voiced-alveolar-plosive": { ipa: "d", arpa: "D", category: "consonant" },
	"voiced-velar-plosive": { ipa: "ɡ", arpa: "G", category: "consonant" },
	"voiceless-velar-plosive": { ipa: "k", arpa: "K", category: "consonant" },
	"voiced-dental-fricative": { ipa: "ð", arpa: "DH", category: "consonant" },
	"voiceless-dental-fricative": { ipa: "θ", arpa: "TH", category: "consonant" },
	"voiceless-labiodental-fricative": { ipa: "f", arpa: "F", category: "consonant" },
	"voiced-labiodental-fricative": { ipa: "v", arpa: "V", category: "consonant" },
	"voiceless-glottal-fricative": { ipa: "h", arpa: "HH", category: "consonant" },
	"voiceless-alveolar-fricative": { ipa: "s", arpa: "S", category: "consonant" },
	"voiceless-postalveolar-fricative": {
		ipa: "ʃ",
		arpa: "SH",
		category: "consonant",
	},
	"voiced-alveolar-fricative": { ipa: "z", arpa: "Z", category: "consonant" },
	"voiced-postalveolar-fricative": { ipa: "ʒ", arpa: "ZH", category: "consonant" },
	"voiced-postalveolar-affricate": {
		ipa: "dʒ",
		arpa: "JH",
		category: "consonant",
	},
	"voiceless-postalveolar-affricate": {
		ipa: "tʃ",
		arpa: "CH",
		category: "consonant",
	},
	"voiced-bilabial-nasal": { ipa: "m", arpa: "M", category: "consonant" },
	"voiced-alveolar-nasal": { ipa: "n", arpa: "N", category: "consonant" },
	"voiced-velar-nasal": { ipa: "ŋ", arpa: "NG", category: "consonant" },
	"voiced-alveolar-lateral-approximant": {
		ipa: "l",
		arpa: "L",
		category: "consonant",
	},
	"voiced-postalveolar-approximant": { ipa: "ɹ", arpa: "R", category: "consonant" },
	"voiced-palatal-approximant": { ipa: "j", arpa: "Y", category: "consonant" },
	"voiced-labial-velar-approximant": { ipa: "w", arpa: "W", category: "consonant" },
} as const satisfies Partial<Record<ConsonantPhonemeIdPattern, PhonemeSymbolEntry>>;

export type ConsonantSymbolId = keyof typeof ConsonantSymbolRegistry;
export type ConsonantSymbol = (typeof ConsonantSymbolRegistry)[ConsonantSymbolId];
export type ConsonantSymbolIpa = ConsonantSymbol["ipa"];
export type ConsonantSymbolArpa = ConsonantSymbol["arpa"];

// Vowels

export type VowelArticulatoryFeatures = {
	height: "close" | "near-close" | "close-mid" | "mid" | "open-mid" | "near-open" | "open";
	backness: "front" | "near-front" | "central" | "near-back" | "back";
	roundness: "rounded" | "unrounded";
	tenseness: "tense" | "lax";
};

export type VowelPhonemeArticulatoryFeatureKey = keyof VowelArticulatoryFeatures;

// Vowels - Monophthongs

type MonophthongPhonemeIdPattern =
	`${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-${VowelArticulatoryFeatures["roundness"]}`;

export const MonophthongSymbolRegistry = {
	"close-front-unrounded": {
		ipa: "i",
		arpa: "IY",
		category: "vowel/monophthong",
	},
	"close-back-rounded": {
		ipa: "u",
		arpa: "UW",
		category: "vowel/monophthong",
	},
	"near-close-near-front-unrounded": {
		ipa: "ɪ",
		arpa: "IH",
		category: "vowel/monophthong",
	},
	"near-close-near-back-rounded": {
		ipa: "ʊ",
		arpa: "UH",
		category: "vowel/monophthong",
	},
	"mid-central-unrounded": {
		ipa: "ə",
		arpa: "AX",
		category: "vowel/monophthong",
	},
	"open-mid-front-unrounded": {
		ipa: "ɛ",
		arpa: "EH",
		category: "vowel/monophthong",
	},
	"open-mid-back-unrounded": {
		ipa: "ʌ",
		arpa: "AH",
		category: "vowel/monophthong",
	},
	"open-mid-back-rounded": {
		ipa: "ɔ",
		arpa: "AO",
		category: "vowel/monophthong",
	},
	"near-open-front-unrounded": {
		ipa: "æ",
		arpa: "AE",
		category: "vowel/monophthong",
	},
	"open-back-unrounded": {
		ipa: "ɑ",
		arpa: "AA",
		category: "vowel/monophthong",
	},
} as const satisfies Partial<Record<MonophthongPhonemeIdPattern, PhonemeSymbolEntry>>;

export type MonophthongSymbolId = keyof typeof MonophthongSymbolRegistry;
export type MonophthongSymbol = (typeof MonophthongSymbolRegistry)[MonophthongSymbolId];
export type MonophthongSymbolIpa = MonophthongSymbol["ipa"];
export type MonophthongSymbolArpa = MonophthongSymbol["arpa"];

// Vowels - Diphthongs

//? Keep an eye on the definition of these types. They can hold a disproportionate amount of combinations.
//? They are fine here for their purpose as guards, but don't try to export them as they are.
type DiphthongPhonemeIdPattern =
	`${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-${VowelArticulatoryFeatures["roundness"]}-to-${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-${VowelArticulatoryFeatures["roundness"]}`;

export const DiphthongSymbolRegistry = {
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		ipa: "eɪ",
		arpa: "EY",
		category: "vowel/diphthong",
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		ipa: "oʊ",
		arpa: "OW",
		category: "vowel/diphthong",
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		ipa: "aɪ",
		arpa: "AY",
		category: "vowel/diphthong",
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		ipa: "aʊ",
		arpa: "AW",
		category: "vowel/diphthong",
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		ipa: "ɔɪ",
		arpa: "OY",
		category: "vowel/diphthong",
	},
} as const satisfies Partial<Record<DiphthongPhonemeIdPattern, PhonemeSymbolEntry>>;

export type DiphthongSymbolId = keyof typeof DiphthongSymbolRegistry;
export type DiphthongSymbol = (typeof DiphthongSymbolRegistry)[DiphthongSymbolId];
export type DiphthongSymbolIpa = DiphthongSymbol["ipa"];
export type DiphthongSymbolArpa = DiphthongSymbol["arpa"];

// Vowels - Rhotic

type RhoticPhonemeIdPattern =
	`${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-rhotic-${VowelArticulatoryFeatures["tenseness"]}`;

export const RhoticSymbolRegistry = {
	"mid-central-rhotic-tense": {
		ipa: "ɝ",
		arpa: "ER",
		category: "vowel/rhotic",
	},
	"mid-central-rhotic-lax": { ipa: "ɚ", arpa: "ER", category: "vowel/rhotic" },
} as const satisfies Partial<Record<RhoticPhonemeIdPattern, PhonemeSymbolEntry>>;

export type RhoticSymbolId = keyof typeof RhoticSymbolRegistry;
export type RhoticSymbol = (typeof RhoticSymbolRegistry)[RhoticSymbolId];
export type RhoticSymbolIpa = RhoticSymbol["ipa"];
export type RhoticSymbolArpa = RhoticSymbol["arpa"];

// Vowels - All

type VowelPhonemeIdPattern =
	| MonophthongPhonemeIdPattern
	| DiphthongPhonemeIdPattern
	| RhoticPhonemeIdPattern;

export const VowelSymbolRegistry = {
	...MonophthongSymbolRegistry,
	...DiphthongSymbolRegistry,
	...RhoticSymbolRegistry,
} as const satisfies Partial<Record<VowelPhonemeIdPattern, PhonemeSymbolEntry>>;

export type VowelSymbolId = keyof typeof VowelSymbolRegistry;
export type VowelSymbol = (typeof VowelSymbolRegistry)[VowelSymbolId];
export type VowelSymbolIpa = VowelSymbol["ipa"];
export type VowelSymbolArpa = VowelSymbol["arpa"];

// All
export const PhonemeSymbolRegistry = {
	...ConsonantSymbolRegistry,
	...VowelSymbolRegistry,
} as const;

export type PhonemeArticulatoryFeatures = ConsonantArticulatoryFeatures & VowelArticulatoryFeatures;
export type PhonemeArticulatoryFeatureKey =
	| ConsonantPhonemeArticulatoryFeatureKey
	| VowelPhonemeArticulatoryFeatureKey;

export type PhonemeSymbolId = keyof typeof PhonemeSymbolRegistry;
export type PhonemeSymbol = (typeof PhonemeSymbolRegistry)[PhonemeSymbolId];
export type PhonemeSymbolIpa = PhonemeSymbol["ipa"];
export type PhonemeSymbolArpa = PhonemeSymbol["arpa"];
