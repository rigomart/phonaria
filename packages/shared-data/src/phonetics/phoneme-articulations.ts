import type {
	ConsonantArticulatoryFeatures,
	ConsonantSymbolId,
	DiphthongSymbolId,
	MonophthongSymbolId,
	RhoticSymbolId,
	VowelArticulatoryFeatures,
} from "./symbols-registry";

type PhonemeArticulationCategory =
	| "consonant"
	| "vowel/monophthong"
	| "vowel/diphthong"
	| "vowel/rhotic";

type PhonemeArticulationBase<
	Category extends PhonemeArticulationCategory,
	Features extends Record<string, string>,
> = {
	category: Category;
	features: Features;
	pitfalls?: string[]; // ["tongue-too-far-back", "lips-vs-teeth"]
};

// Consonant articulations
type ConsonantArticulation = PhonemeArticulationBase<"consonant", ConsonantArticulatoryFeatures>;

export const consonantArticulations: Record<ConsonantSymbolId, ConsonantArticulation> = {
	"voiceless-bilabial-stop": {
		category: "consonant",
		features: { manner: "stop", place: "bilabial", voicing: "voiceless" },
	},
	"voiced-bilabial-stop": {
		category: "consonant",
		features: { manner: "stop", place: "bilabial", voicing: "voiced" },
	},
	"voiceless-alveolar-stop": {
		category: "consonant",
		features: { manner: "stop", place: "alveolar", voicing: "voiceless" },
	},
	"voiced-alveolar-stop": {
		category: "consonant",
		features: { manner: "stop", place: "alveolar", voicing: "voiced" },
	},
	"voiced-velar-stop": {
		category: "consonant",
		features: { manner: "stop", place: "velar", voicing: "voiced" },
	},
	"voiceless-velar-stop": {
		category: "consonant",
		features: { manner: "stop", place: "velar", voicing: "voiceless" },
	},
	"voiced-dental-fricative": {
		category: "consonant",
		features: { manner: "fricative", place: "dental", voicing: "voiced" },
	},
	"voiceless-dental-fricative": {
		category: "consonant",
		features: { manner: "fricative", place: "dental", voicing: "voiceless" },
	},
	"voiceless-labiodental-fricative": {
		category: "consonant",
		features: { manner: "fricative", place: "labiodental", voicing: "voiceless" },
	},
	"voiced-labiodental-fricative": {
		category: "consonant",
		features: { manner: "fricative", place: "labiodental", voicing: "voiced" },
	},
	"voiceless-glottal-fricative": {
		category: "consonant",
		features: { manner: "fricative", place: "glottal", voicing: "voiceless" },
	},
	"voiceless-alveolar-fricative": {
		category: "consonant",
		features: { manner: "fricative", place: "alveolar", voicing: "voiceless" },
	},
	"voiceless-postalveolar-fricative": {
		category: "consonant",
		features: { manner: "fricative", place: "postalveolar", voicing: "voiceless" },
	},
	"voiced-alveolar-fricative": {
		category: "consonant",
		features: { manner: "fricative", place: "alveolar", voicing: "voiced" },
	},
	"voiced-postalveolar-fricative": {
		category: "consonant",
		features: { manner: "fricative", place: "postalveolar", voicing: "voiced" },
	},
	"voiced-postalveolar-affricate": {
		category: "consonant",
		features: { manner: "affricate", place: "postalveolar", voicing: "voiced" },
	},
	"voiceless-postalveolar-affricate": {
		category: "consonant",
		features: { manner: "affricate", place: "postalveolar", voicing: "voiceless" },
	},
	"voiced-bilabial-nasal": {
		category: "consonant",
		features: { manner: "nasal", place: "bilabial", voicing: "voiced" },
	},
	"voiced-alveolar-nasal": {
		category: "consonant",
		features: { manner: "nasal", place: "alveolar", voicing: "voiced" },
	},
	"voiced-velar-nasal": {
		category: "consonant",
		features: { manner: "nasal", place: "velar", voicing: "voiced" },
	},
	"voiced-alveolar-lateral-approximant": {
		category: "consonant",
		features: { manner: "approximant", place: "alveolar-lateral", voicing: "voiced" },
	},
	"voiced-postalveolar-approximant": {
		category: "consonant",
		features: { manner: "approximant", place: "postalveolar", voicing: "voiced" },
	},
	"voiced-palatal-approximant": {
		category: "consonant",
		features: { manner: "approximant", place: "palatal", voicing: "voiced" },
	},
	"voiced-labial-velar-approximant": {
		category: "consonant",
		features: { manner: "approximant", place: "labial-velar", voicing: "voiced" },
	},
};

// Monophthong vowel articulations

type MonophthongVowelArticulation = PhonemeArticulationBase<
	"vowel/monophthong",
	VowelArticulatoryFeatures
>;

export const monophthongVowelArticulations: Record<
	MonophthongSymbolId,
	MonophthongVowelArticulation
> = {
	"close-front-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "close",
			backness: "front",
			roundness: "unrounded",
			tenseness: "tense",
		},
	},
	"close-back-rounded": {
		category: "vowel/monophthong",
		features: {
			height: "close",
			backness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
	},
	"near-close-near-front-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "near-close",
			backness: "near-front",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	"near-close-near-back-rounded": {
		category: "vowel/monophthong",
		features: {
			height: "near-close",
			backness: "near-back",
			roundness: "rounded",
			tenseness: "lax",
		},
	},
	"mid-central-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "mid",
			backness: "central",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	"open-mid-front-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "open-mid",
			backness: "front",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	"open-mid-back-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "open-mid",
			backness: "back",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	"open-mid-back-rounded": {
		category: "vowel/monophthong",
		features: {
			height: "open-mid",
			backness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
	},
	"near-open-front-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "near-open",
			backness: "front",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	"open-back-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "open",
			backness: "back",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
};

// Diphthong vowel articulations

type DiphthongVowelArticulation = PhonemeArticulationBase<
	"vowel/diphthong",
	{
		startHeight: VowelArticulatoryFeatures["height"];
		startBackness: VowelArticulatoryFeatures["backness"];
		startRoundness: VowelArticulatoryFeatures["roundness"];
		targetHeight: VowelArticulatoryFeatures["height"];
		targetBackness: VowelArticulatoryFeatures["backness"];
		targetRoundness: VowelArticulatoryFeatures["roundness"];
	}
>;

export const diphthongVowelArticulations: Record<DiphthongSymbolId, DiphthongVowelArticulation> = {
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		category: "vowel/diphthong",
		features: {
			startHeight: "close-mid",
			startBackness: "front",
			startRoundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		category: "vowel/diphthong",
		features: {
			startHeight: "close-mid",
			startBackness: "back",
			startRoundness: "rounded",
			targetHeight: "near-close",
			targetBackness: "near-back",
			targetRoundness: "rounded",
		},
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		category: "vowel/diphthong",
		features: {
			startHeight: "open",
			startBackness: "front",
			startRoundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		category: "vowel/diphthong",
		features: {
			startHeight: "open",
			startBackness: "front",
			startRoundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-back",
			targetRoundness: "rounded",
		},
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		category: "vowel/diphthong",
		features: {
			startHeight: "open-mid",
			startBackness: "back",
			startRoundness: "rounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
};

// Rhotic vowel articulations

type RhoticVowelArticulation = PhonemeArticulationBase<"vowel/rhotic", VowelArticulatoryFeatures>;

export const rhoticVowelArticulations: Record<RhoticSymbolId, RhoticVowelArticulation> = {
	"mid-central-rhotic-tense": {
		category: "vowel/rhotic",
		features: {
			height: "mid",
			backness: "central",
			roundness: "unrounded",
			tenseness: "tense",
		},
	},
	"mid-central-rhotic-lax": {
		category: "vowel/rhotic",
		features: {
			height: "mid",
			backness: "central",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
};

export const phonemeArticulations = {
	...consonantArticulations,
	...monophthongVowelArticulations,
	...diphthongVowelArticulations,
	...rhoticVowelArticulations,
};

export type PhonemeArticulation =
	| ConsonantArticulation
	| MonophthongVowelArticulation
	| DiphthongVowelArticulation
	| RhoticVowelArticulation;
