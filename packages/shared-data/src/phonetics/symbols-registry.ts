// Base types

export type PhonemeCategory =
	| "consonant"
	| "vowel/monophthong"
	| "vowel/diphthong"
	| "vowel/rhotic";

type PhonemeSymbolEntry<Ipa extends string = string> = {
	ipa: Ipa;
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
	"voiceless-bilabial-plosive": { ipa: "p", category: "consonant" },
	"voiced-bilabial-plosive": { ipa: "b", category: "consonant" },
	"voiceless-alveolar-plosive": { ipa: "t", category: "consonant" },
	"voiced-alveolar-plosive": { ipa: "d", category: "consonant" },
	"voiced-velar-plosive": { ipa: "ɡ", category: "consonant" },
	"voiceless-velar-plosive": { ipa: "k", category: "consonant" },
	"voiced-dental-fricative": { ipa: "ð", category: "consonant" },
	"voiceless-dental-fricative": { ipa: "θ", category: "consonant" },
	"voiceless-labiodental-fricative": { ipa: "f", category: "consonant" },
	"voiced-labiodental-fricative": { ipa: "v", category: "consonant" },
	"voiceless-glottal-fricative": { ipa: "h", category: "consonant" },
	"voiceless-alveolar-fricative": { ipa: "s", category: "consonant" },
	"voiceless-postalveolar-fricative": { ipa: "ʃ", category: "consonant" },
	"voiced-alveolar-fricative": { ipa: "z", category: "consonant" },
	"voiced-postalveolar-fricative": { ipa: "ʒ", category: "consonant" },
	"voiced-postalveolar-affricate": { ipa: "dʒ", category: "consonant" },
	"voiceless-postalveolar-affricate": { ipa: "tʃ", category: "consonant" },
	"voiced-bilabial-nasal": { ipa: "m", category: "consonant" },
	"voiced-alveolar-nasal": { ipa: "n", category: "consonant" },
	"voiced-velar-nasal": { ipa: "ŋ", category: "consonant" },
	"voiced-alveolar-lateral-approximant": { ipa: "l", category: "consonant" },
	"voiced-postalveolar-approximant": { ipa: "ɹ", category: "consonant" },
	"voiced-palatal-approximant": { ipa: "j", category: "consonant" },
	"voiced-labial-velar-approximant": { ipa: "w", category: "consonant" },
} as const satisfies Partial<Record<ConsonantPhonemeIdPattern, PhonemeSymbolEntry>>;

export type ConsonantSymbolId = keyof typeof ConsonantSymbolRegistry;
export type ConsonantSymbol = (typeof ConsonantSymbolRegistry)[ConsonantSymbolId];
export type ConsonantSymbolIpa = ConsonantSymbol["ipa"];

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
	"close-front-unrounded": { ipa: "i", category: "vowel/monophthong" },
	"close-back-rounded": { ipa: "u", category: "vowel/monophthong" },
	"near-close-near-front-unrounded": { ipa: "ɪ", category: "vowel/monophthong" },
	"near-close-near-back-rounded": { ipa: "ʊ", category: "vowel/monophthong" },
	"mid-central-unrounded": { ipa: "ə", category: "vowel/monophthong" },
	"open-mid-front-unrounded": { ipa: "ɛ", category: "vowel/monophthong" },
	"open-mid-back-unrounded": { ipa: "ʌ", category: "vowel/monophthong" },
	"open-mid-back-rounded": { ipa: "ɔ", category: "vowel/monophthong" },
	"near-open-front-unrounded": { ipa: "æ", category: "vowel/monophthong" },
	"open-back-unrounded": { ipa: "ɑ", category: "vowel/monophthong" },
} as const satisfies Partial<Record<MonophthongPhonemeIdPattern, PhonemeSymbolEntry>>;

export type MonophthongSymbolId = keyof typeof MonophthongSymbolRegistry;
export type MonophthongSymbol = (typeof MonophthongSymbolRegistry)[MonophthongSymbolId];
export type MonophthongSymbolIpa = MonophthongSymbol["ipa"];

// Vowels - Diphthongs

//? Keep an eye on the definition of these types. They can hold a disproportionate amount of combinations.
//? They are fine here for their purpose as guards, but don't try to export them as they are.
type DiphthongPhonemeIdPattern =
	`${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-${VowelArticulatoryFeatures["roundness"]}-to-${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-${VowelArticulatoryFeatures["roundness"]}`;

export const DiphthongSymbolRegistry = {
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		ipa: "eɪ",
		category: "vowel/diphthong",
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		ipa: "oʊ",
		category: "vowel/diphthong",
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		ipa: "aɪ",
		category: "vowel/diphthong",
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		ipa: "aʊ",
		category: "vowel/diphthong",
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		ipa: "ɔɪ",
		category: "vowel/diphthong",
	},
} as const satisfies Partial<Record<DiphthongPhonemeIdPattern, PhonemeSymbolEntry>>;

export type DiphthongSymbolId = keyof typeof DiphthongSymbolRegistry;
export type DiphthongSymbol = (typeof DiphthongSymbolRegistry)[DiphthongSymbolId];
export type DiphthongSymbolIpa = DiphthongSymbol["ipa"];

// Vowels - Rhotic

type RhoticPhonemeIdPattern =
	`${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-rhotic`;

export const RhoticSymbolRegistry = {
	"open-mid-central-rhotic": { ipa: "ɝ", category: "vowel/rhotic" },
} as const satisfies Partial<Record<RhoticPhonemeIdPattern, PhonemeSymbolEntry>>;

export type RhoticSymbolId = keyof typeof RhoticSymbolRegistry;
export type RhoticSymbol = (typeof RhoticSymbolRegistry)[RhoticSymbolId];
export type RhoticSymbolIpa = RhoticSymbol["ipa"];

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

// Phoneme counts
export const PhonemeCount = {
	consonants: Object.keys(ConsonantSymbolRegistry).length,
	monophthongs: Object.keys(MonophthongSymbolRegistry).length,
	diphthongs: Object.keys(DiphthongSymbolRegistry).length,
	rhotics: Object.keys(RhoticSymbolRegistry).length,
	get vowels() {
		return this.monophthongs + this.diphthongs + this.rhotics;
	},
	get total() {
		return this.consonants + this.vowels;
	},
} as const;
