export type MannerOfArticulation =
	| "plosive"
	| "fricative"
	| "affricate"
	| "nasal"
	| "approximant"
	| "lateral-approximant"
	| "tap"
	| "trill";

export type PlaceOfArticulation =
	| "bilabial"
	| "labiodental"
	| "dental"
	| "alveolar"
	| "postalveolar"
	| "palatal"
	| "velar"
	| "labial-velar"
	| "glottal";

export type Voicing = "voiced" | "voiceless";

export type VowelHeight =
	| "close"
	| "near-close"
	| "close-mid"
	| "mid"
	| "open-mid"
	| "near-open"
	| "open";

export type VowelBackness = "front" | "near-front" | "central" | "near-back" | "back";
export type VowelRoundness = "rounded" | "unrounded";
export type VowelTenseness = "tense" | "lax";
export type Rhoticity = "r-colored";

// Composite feature types

export type ConsonantArticulatoryFeatures = {
	readonly voicing: Voicing;
	readonly place: PlaceOfArticulation;
	readonly manner: MannerOfArticulation;
};

export type VowelArticulatoryFeatures = {
	readonly height: VowelHeight;
	readonly backness: VowelBackness;
	readonly roundness: VowelRoundness;
	readonly tenseness: VowelTenseness;
	readonly rhoticity?: Rhoticity;
};

export type PhonemeArticulatoryFeatureValueMap = {
	readonly voicing: Voicing;
	readonly place: PlaceOfArticulation;
	readonly manner: MannerOfArticulation;
	readonly height: VowelHeight;
	readonly backness: VowelBackness;
	readonly roundness: VowelRoundness;
	readonly tenseness: VowelTenseness;
	readonly rhoticity?: Rhoticity;
};

export type ConsonantPhonemeArticulatoryFeatureKey = keyof ConsonantArticulatoryFeatures;
export type VowelPhonemeArticulatoryFeatureKey = keyof VowelArticulatoryFeatures;
export type PhonemeArticulatoryFeatureKey = keyof PhonemeArticulatoryFeatureValueMap;

// Backwards-compatible alias used throughout app data and tests.
export type PhonemeArticulatoryFeatures = PhonemeArticulatoryFeatureValueMap;

export const PHONEME_ARTICULATORY_FEATURE_KEYS = [
	"voicing",
	"place",
	"manner",
	"height",
	"backness",
	"roundness",
	"tenseness",
	"rhoticity",
] as const satisfies readonly PhonemeArticulatoryFeatureKey[];
