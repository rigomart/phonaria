// Base types

export type PhonemeCategory =
	| "consonant"
	| "vowel/monophthong"
	| "vowel/diphthong"
	| "vowel/rhotic";

type PhonemeSymbolEntry<
	Ipa extends string = string,
	Arpa extends string = string,
	CmuArpa extends readonly string[] = readonly string[],
> = {
	ipa: Ipa;
	arpa: Arpa;
	cmuArpa: CmuArpa;
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
	manner: "stop" | "fricative" | "affricate" | "nasal" | "approximant";
};

export type ConsonantPhonemeArticulatoryFeatureKey = keyof ConsonantArticulatoryFeatures;

type ConsonantPhonemeIdPattern =
	`${ConsonantArticulatoryFeatures["voicing"]}-${ConsonantArticulatoryFeatures["place"]}-${ConsonantArticulatoryFeatures["manner"]}`;

export const consonantPhonemeSymbols = {
	"voiceless-bilabial-stop": { ipa: "p", arpa: "P", cmuArpa: ["P"], category: "consonant" },
	"voiced-bilabial-stop": { ipa: "b", arpa: "B", cmuArpa: ["B"], category: "consonant" },
	"voiceless-alveolar-stop": { ipa: "t", arpa: "T", cmuArpa: ["T"], category: "consonant" },
	"voiced-alveolar-stop": { ipa: "d", arpa: "D", cmuArpa: ["D"], category: "consonant" },
	"voiced-velar-stop": { ipa: "ɡ", arpa: "G", cmuArpa: ["G"], category: "consonant" },
	"voiceless-velar-stop": { ipa: "k", arpa: "K", cmuArpa: ["K"], category: "consonant" },
	"voiced-dental-fricative": { ipa: "ð", arpa: "DH", cmuArpa: ["DH"], category: "consonant" },
	"voiceless-dental-fricative": { ipa: "θ", arpa: "TH", cmuArpa: ["TH"], category: "consonant" },
	"voiceless-labiodental-fricative": { ipa: "f", arpa: "F", cmuArpa: ["F"], category: "consonant" },
	"voiced-labiodental-fricative": { ipa: "v", arpa: "V", cmuArpa: ["V"], category: "consonant" },
	"voiceless-glottal-fricative": { ipa: "h", arpa: "HH", cmuArpa: ["HH"], category: "consonant" },
	"voiceless-alveolar-fricative": { ipa: "s", arpa: "S", cmuArpa: ["S"], category: "consonant" },
	"voiceless-postalveolar-fricative": {
		ipa: "ʃ",
		arpa: "SH",
		cmuArpa: ["SH"],
		category: "consonant",
	},
	"voiced-alveolar-fricative": { ipa: "z", arpa: "Z", cmuArpa: ["Z"], category: "consonant" },
	"voiced-postalveolar-fricative": { ipa: "ʒ", arpa: "ZH", cmuArpa: ["ZH"], category: "consonant" },
	"voiced-postalveolar-affricate": {
		ipa: "dʒ",
		arpa: "JH",
		cmuArpa: ["JH"],
		category: "consonant",
	},
	"voiceless-postalveolar-affricate": {
		ipa: "tʃ",
		arpa: "CH",
		cmuArpa: ["CH"],
		category: "consonant",
	},
	"voiced-bilabial-nasal": { ipa: "m", arpa: "M", cmuArpa: ["M"], category: "consonant" },
	"voiced-alveolar-nasal": { ipa: "n", arpa: "N", cmuArpa: ["N"], category: "consonant" },
	"voiced-velar-nasal": { ipa: "ŋ", arpa: "NG", cmuArpa: ["NG"], category: "consonant" },
	"voiced-alveolar-lateral-approximant": {
		ipa: "l",
		arpa: "L",
		cmuArpa: ["L"],
		category: "consonant",
	},
	"voiced-postalveolar-approximant": { ipa: "ɹ", arpa: "R", cmuArpa: ["R"], category: "consonant" },
	"voiced-palatal-approximant": { ipa: "j", arpa: "Y", cmuArpa: ["Y"], category: "consonant" },
	"voiced-labial-velar-approximant": { ipa: "w", arpa: "W", cmuArpa: ["W"], category: "consonant" },
} as const satisfies Partial<Record<ConsonantPhonemeIdPattern, PhonemeSymbolEntry>>;

export type ConsonantSymbolId = keyof typeof consonantPhonemeSymbols;
export type ConsonantSymbol = (typeof consonantPhonemeSymbols)[ConsonantSymbolId];
export type ConsonantSymbolIpa = ConsonantSymbol["ipa"];
export type ConsonantSymbolArpa = ConsonantSymbol["arpa"];
export type ConsonantSymbolCmuArpa = ConsonantSymbol["cmuArpa"][number];

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

export const monophthongPhonemeSymbols = {
	"close-front-unrounded": {
		ipa: "i",
		arpa: "IY",
		cmuArpa: ["IY0", "IY1", "IY2"],
		category: "vowel/monophthong",
	},
	"close-back-rounded": {
		ipa: "u",
		arpa: "UW",
		cmuArpa: ["UW0", "UW1", "UW2"],
		category: "vowel/monophthong",
	},
	"near-close-near-front-unrounded": {
		ipa: "ɪ",
		arpa: "IH",
		cmuArpa: ["IH0", "IH1", "IH2"],
		category: "vowel/monophthong",
	},
	"near-close-near-back-rounded": {
		ipa: "ʊ",
		arpa: "UH",
		cmuArpa: ["UH0", "UH1", "UH2"],
		category: "vowel/monophthong",
	},
	"mid-central-unrounded": {
		ipa: "ə",
		arpa: "AX",
		cmuArpa: ["AH0"],
		category: "vowel/monophthong",
	},
	"open-mid-front-unrounded": {
		ipa: "ɛ",
		arpa: "EH",
		cmuArpa: ["EH0", "EH1", "EH2"],
		category: "vowel/monophthong",
	},
	"open-mid-back-unrounded": {
		ipa: "ʌ",
		arpa: "AH",
		cmuArpa: ["AH1", "AH2"],
		category: "vowel/monophthong",
	},
	"open-mid-back-rounded": {
		ipa: "ɔ",
		arpa: "AO",
		cmuArpa: ["AO0", "AO1", "AO2"],
		category: "vowel/monophthong",
	},
	"near-open-front-unrounded": {
		ipa: "æ",
		arpa: "AE",
		cmuArpa: ["AE0", "AE1", "AE2"],
		category: "vowel/monophthong",
	},
	"open-back-unrounded": {
		ipa: "ɑ",
		arpa: "AA",
		cmuArpa: ["AA0", "AA1", "AA2"],
		category: "vowel/monophthong",
	},
} as const satisfies Partial<Record<MonophthongPhonemeIdPattern, PhonemeSymbolEntry>>;

export type MonophthongSymbolId = keyof typeof monophthongPhonemeSymbols;
export type MonophthongSymbol = (typeof monophthongPhonemeSymbols)[MonophthongSymbolId];
export type MonophthongSymbolIpa = MonophthongSymbol["ipa"];
export type MonophthongSymbolArpa = MonophthongSymbol["arpa"];
export type MonophthongSymbolCmuArpa = MonophthongSymbol["cmuArpa"][number];

// Vowels - Diphthongs

//? Keep an eye on the definition of these types. They can hold a disproportionate amount of combinations.
//? They are fine here for their purpose as guards, but don't try to export them as they are.
type DiphthongPhonemeIdPattern =
	`${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-${VowelArticulatoryFeatures["roundness"]}-to-${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-${VowelArticulatoryFeatures["roundness"]}`;

export const diphthongPhonemeSymbols = {
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		ipa: "eɪ",
		arpa: "EY",
		cmuArpa: ["EY0", "EY1", "EY2"],
		category: "vowel/diphthong",
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		ipa: "oʊ",
		arpa: "OW",
		cmuArpa: ["OW0", "OW1", "OW2"],
		category: "vowel/diphthong",
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		ipa: "aɪ",
		arpa: "AY",
		cmuArpa: ["AY0", "AY1", "AY2"],
		category: "vowel/diphthong",
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		ipa: "aʊ",
		arpa: "AW",
		cmuArpa: ["AW0", "AW1", "AW2"],
		category: "vowel/diphthong",
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		ipa: "ɔɪ",
		arpa: "OY",
		cmuArpa: ["OY0", "OY1", "OY2"],
		category: "vowel/diphthong",
	},
} as const satisfies Partial<Record<DiphthongPhonemeIdPattern, PhonemeSymbolEntry>>;

export type DiphthongSymbolId = keyof typeof diphthongPhonemeSymbols;
export type DiphthongSymbol = (typeof diphthongPhonemeSymbols)[DiphthongSymbolId];
export type DiphthongSymbolIpa = DiphthongSymbol["ipa"];
export type DiphthongSymbolArpa = DiphthongSymbol["arpa"];
export type DiphthongSymbolCmuArpa = DiphthongSymbol["cmuArpa"][number];

// Vowels - Rhotic

type RhoticPhonemeIdPattern =
	`${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-rhotic-${VowelArticulatoryFeatures["tenseness"]}`;

export const rhoticPhonemeSymbols = {
	"mid-central-rhotic-tense": {
		ipa: "ɝ",
		arpa: "ER",
		cmuArpa: ["ER1", "ER2"],
		category: "vowel/rhotic",
	},
	"mid-central-rhotic-lax": { ipa: "ɚ", arpa: "ER", cmuArpa: ["ER0"], category: "vowel/rhotic" },
} as const satisfies Partial<Record<RhoticPhonemeIdPattern, PhonemeSymbolEntry>>;

export type RhoticSymbolId = keyof typeof rhoticPhonemeSymbols;
export type RhoticSymbol = (typeof rhoticPhonemeSymbols)[RhoticSymbolId];
export type RhoticSymbolIpa = RhoticSymbol["ipa"];
export type RhoticSymbolArpa = RhoticSymbol["arpa"];
export type RhoticSymbolCmuArpa = RhoticSymbol["cmuArpa"][number];

// Vowels - All

type VowelPhonemeIdPattern =
	| MonophthongPhonemeIdPattern
	| DiphthongPhonemeIdPattern
	| RhoticPhonemeIdPattern;

export const vowelPhonemeSymbols = {
	...monophthongPhonemeSymbols,
	...diphthongPhonemeSymbols,
	...rhoticPhonemeSymbols,
} as const satisfies Partial<Record<VowelPhonemeIdPattern, PhonemeSymbolEntry>>;

export type VowelSymbolId = keyof typeof vowelPhonemeSymbols;
export type VowelSymbol = (typeof vowelPhonemeSymbols)[VowelSymbolId];
export type VowelSymbolIpa = VowelSymbol["ipa"];
export type VowelSymbolArpa = VowelSymbol["arpa"];
export type VowelSymbolCmuArpa = VowelSymbol["cmuArpa"][number];

// All
export const allPhonemeSymbols = {
	...consonantPhonemeSymbols,
	...vowelPhonemeSymbols,
} as const;

export type PhonemeArticulatoryFeatures = ConsonantArticulatoryFeatures & VowelArticulatoryFeatures;
export type PhonemeArticulatoryFeatureKey =
	| ConsonantPhonemeArticulatoryFeatureKey
	| VowelPhonemeArticulatoryFeatureKey;

export type PhonemeSymbolId = keyof typeof allPhonemeSymbols;
export type PhonemeSymbol = (typeof allPhonemeSymbols)[PhonemeSymbolId];
export type PhonemeSymbolIpa = PhonemeSymbol["ipa"];
export type PhonemeSymbolArpa = PhonemeSymbol["arpa"];
export type PhonemeSymbolCmuArpa = PhonemeSymbol["cmuArpa"][number];
