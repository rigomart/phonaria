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
	voicing: Voicing;
	place: PlaceOfArticulation;
	manner: MannerOfArticulation;
};

export type ConsonantPhonemeArticulatoryFeatureKey = keyof ConsonantArticulatoryFeatures;

export type VowelArticulatoryFeatures = {
	height: VowelHeight;
	backness: VowelBackness;
	roundness: VowelRoundness;
	tenseness: VowelTenseness;
	rhoticity?: Rhoticity;
};

export type VowelPhonemeArticulatoryFeatureKey = keyof VowelArticulatoryFeatures;

export type PhonemeArticulatoryFeatures = ConsonantArticulatoryFeatures & VowelArticulatoryFeatures;
export type PhonemeArticulatoryFeatureKey =
	| ConsonantPhonemeArticulatoryFeatureKey
	| VowelPhonemeArticulatoryFeatureKey;
