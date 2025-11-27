// Base types

export type PhonemeCategory = "consonant" | "vowel";

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

export const ConsonantIpaRegistry = {
	"voiceless-bilabial-plosive": "p",
	"voiced-bilabial-plosive": "b",
	"voiceless-alveolar-plosive": "t",
	"voiced-alveolar-plosive": "d",
	"voiced-velar-plosive": "ɡ",
	"voiceless-velar-plosive": "k",
	"voiced-dental-fricative": "ð",
	"voiceless-dental-fricative": "θ",
	"voiceless-labiodental-fricative": "f",
	"voiced-labiodental-fricative": "v",
	"voiceless-glottal-fricative": "h",
	"voiceless-alveolar-fricative": "s",
	"voiceless-postalveolar-fricative": "ʃ",
	"voiced-alveolar-fricative": "z",
	"voiced-postalveolar-fricative": "ʒ",
	"voiced-postalveolar-affricate": "dʒ",
	"voiceless-postalveolar-affricate": "tʃ",
	"voiced-bilabial-nasal": "m",
	"voiced-alveolar-nasal": "n",
	"voiced-velar-nasal": "ŋ",
	"voiced-alveolar-lateral-approximant": "l",
	"voiced-postalveolar-approximant": "ɹ",
	"voiced-palatal-approximant": "j",
	"voiced-labial-velar-approximant": "w",
} as const satisfies Partial<Record<ConsonantPhonemeIdPattern, string>>;

export type ConsonantSymbolId = keyof typeof ConsonantIpaRegistry;
export type ConsonantSymbolIpa = (typeof ConsonantIpaRegistry)[ConsonantSymbolId];

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

export const MonophthongIpaRegistry = {
	"close-front-unrounded": "i",
	"close-back-rounded": "u",
	"near-close-near-front-unrounded": "ɪ",
	"near-close-near-back-rounded": "ʊ",
	"mid-central-unrounded": "ə",
	"open-mid-front-unrounded": "ɛ",
	"open-mid-back-unrounded": "ʌ",
	"open-mid-back-rounded": "ɔ",
	"near-open-front-unrounded": "æ",
	"open-back-unrounded": "ɑ",
} as const satisfies Partial<Record<MonophthongPhonemeIdPattern, string>>;

export type MonophthongSymbolId = keyof typeof MonophthongIpaRegistry;
export type MonophthongSymbolIpa = (typeof MonophthongIpaRegistry)[MonophthongSymbolId];

// Vowels - Diphthongs

//? Keep an eye on the definition of these types. They can hold a disproportionate amount of combinations.
//? They are fine here for their purpose as guards, but don't try to export them as they are.
type DiphthongPhonemeIdPattern =
	`${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-${VowelArticulatoryFeatures["roundness"]}-to-${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-${VowelArticulatoryFeatures["roundness"]}`;

export const DiphthongIpaRegistry = {
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": "eɪ",
	"close-mid-back-rounded-to-near-close-near-back-rounded": "oʊ",
	"open-front-unrounded-to-near-close-near-front-unrounded": "aɪ",
	"open-front-unrounded-to-near-close-near-back-rounded": "aʊ",
	"open-mid-back-rounded-to-near-close-near-front-unrounded": "ɔɪ",
} as const satisfies Partial<Record<DiphthongPhonemeIdPattern, string>>;

export type DiphthongSymbolId = keyof typeof DiphthongIpaRegistry;
export type DiphthongSymbolIpa = (typeof DiphthongIpaRegistry)[DiphthongSymbolId];

// Vowels - Rhotic

type RhoticPhonemeIdPattern =
	`${VowelArticulatoryFeatures["height"]}-${VowelArticulatoryFeatures["backness"]}-rhotic`;

export const RhoticIpaRegistry = {
	"open-mid-central-rhotic": "ɝ",
} as const satisfies Partial<Record<RhoticPhonemeIdPattern, string>>;

export type RhoticSymbolId = keyof typeof RhoticIpaRegistry;
export type RhoticSymbolIpa = (typeof RhoticIpaRegistry)[RhoticSymbolId];

// Vowels - All

type VowelPhonemeIdPattern =
	| MonophthongPhonemeIdPattern
	| DiphthongPhonemeIdPattern
	| RhoticPhonemeIdPattern;

export const VowelIpaRegistry = {
	...MonophthongIpaRegistry,
	...DiphthongIpaRegistry,
	...RhoticIpaRegistry,
} as const satisfies Partial<Record<VowelPhonemeIdPattern, string>>;

export type VowelSymbolId = keyof typeof VowelIpaRegistry;
export type VowelSymbolIpa = (typeof VowelIpaRegistry)[VowelSymbolId];

// All
export const PhonemeIpaRegistry = {
	...ConsonantIpaRegistry,
	...VowelIpaRegistry,
} as const;

export type PhonemeArticulatoryFeatures = ConsonantArticulatoryFeatures & VowelArticulatoryFeatures;
export type PhonemeArticulatoryFeatureKey =
	| ConsonantPhonemeArticulatoryFeatureKey
	| VowelPhonemeArticulatoryFeatureKey;

export type PhonemeSymbolId = keyof typeof PhonemeIpaRegistry;
export type PhonemeSymbolIpa = (typeof PhonemeIpaRegistry)[PhonemeSymbolId];

// Helper functions to derive phoneme category from registry structure
export function isVowelPhoneme(phonemeId: PhonemeSymbolId): boolean {
	return phonemeId in VowelIpaRegistry;
}

export function isConsonantPhoneme(phonemeId: PhonemeSymbolId): boolean {
	return phonemeId in ConsonantIpaRegistry;
}

export function getPhonemeCategory(phonemeId: PhonemeSymbolId): PhonemeCategory {
	return isVowelPhoneme(phonemeId) ? "vowel" : "consonant";
}

/**
 * Gets the IPA symbol for a phoneme ID.
 * Type-safe: only accepts valid phoneme IDs.
 * @param phonemeId - The phoneme symbol ID.
 * @returns The IPA symbol.
 * @example
 * getIpaForPhonemeId("voiceless-bilabial-plosive") // "p"
 * getIpaForPhonemeId("close-front-unrounded") // "i"
 */
export function getIpaForPhonemeId(phonemeId: PhonemeSymbolId): string {
	return PhonemeIpaRegistry[phonemeId];
}

// Phoneme counts
export const PhonemeCount = {
	consonants: Object.keys(ConsonantIpaRegistry).length,
	monophthongs: Object.keys(MonophthongIpaRegistry).length,
	diphthongs: Object.keys(DiphthongIpaRegistry).length,
	rhotics: Object.keys(RhoticIpaRegistry).length,
	get vowels() {
		return this.monophthongs + this.diphthongs + this.rhotics;
	},
	get total() {
		return this.consonants + this.vowels;
	},
} as const;
