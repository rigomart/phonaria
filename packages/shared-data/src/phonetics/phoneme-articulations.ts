import type {
	ConsonantManner,
	ConsonantPlace,
	ConsonantSymbolId,
	ConsonantVoicing,
	DiphthongSymbolId,
	MonophthongSymbolId,
	RhoticSymbolId,
	VowelBackness,
	VowelHeight,
	VowelRoundness,
	VowelTenseness,
} from "./symbols-registry";

type PhonemeArticulationBase = {
	category: "consonant" | "vowel/monophthong" | "vowel/diphthong" | "vowel/rhotic";
	features: Record<string, string>;
	pitfalls?: string[]; // ["tongue-too-far-back", "lips-vs-teeth"]
};

// Consonant articulations

export type ConsonantArticulation = PhonemeArticulationBase & {
	category: "consonant";
	features: {
		manner: ConsonantManner;
		place: ConsonantPlace;
		voicing: ConsonantVoicing;
	};
};

export const consonantArticulations: Record<ConsonantSymbolId, ConsonantArticulation> = {
	"voiceless-bilabial-stop": {
		category: "consonant",
		features: {
			manner: "stop",
			place: "bilabial",
			voicing: "voiceless",
		},
	},
	"voiced-bilabial-stop": {
		category: "consonant",
		features: {
			manner: "stop",
			place: "bilabial",
			voicing: "voiced",
		},
	},
	"voiceless-alveolar-stop": {
		category: "consonant",
		features: {
			manner: "stop",
			place: "alveolar",
			voicing: "voiceless",
		},
	},
	"voiced-alveolar-stop": {
		category: "consonant",
		features: {
			manner: "stop",
			place: "alveolar",
			voicing: "voiced",
		},
	},
	"voiced-velar-stop": {
		category: "consonant",
		features: {
			manner: "stop",
			place: "velar",
			voicing: "voiced",
		},
	},
	"voiceless-velar-stop": {
		category: "consonant",
		features: {
			manner: "stop",
			place: "velar",
			voicing: "voiceless",
		},
	},
	"voiced-dental-fricative": {
		category: "consonant",
		features: {
			manner: "fricative",
			place: "dental",
			voicing: "voiced",
		},
	},
	"voiceless-dental-fricative": {
		category: "consonant",
		features: {
			manner: "fricative",
			place: "dental",
			voicing: "voiceless",
		},
	},
	"voiceless-labiodental-fricative": {
		category: "consonant",
		features: {
			manner: "fricative",
			place: "labiodental",
			voicing: "voiceless",
		},
	},
	"voiced-labiodental-fricative": {
		category: "consonant",
		features: {
			manner: "fricative",
			place: "labiodental",
			voicing: "voiced",
		},
	},
	"voiceless-glottal-fricative": {
		category: "consonant",
		features: {
			manner: "fricative",
			place: "glottal",
			voicing: "voiceless",
		},
	},
	"voiceless-alveolar-fricative": {
		category: "consonant",
		features: {
			manner: "fricative",
			place: "alveolar",
			voicing: "voiceless",
		},
	},
	"voiceless-postalveolar-fricative": {
		category: "consonant",
		features: {
			manner: "fricative",
			place: "postalveolar",
			voicing: "voiceless",
		},
	},
	"voiced-alveolar-fricative": {
		category: "consonant",
		features: {
			manner: "fricative",
			place: "alveolar",
			voicing: "voiced",
		},
	},
	"voiced-postalveolar-fricative": {
		category: "consonant",
		features: {
			manner: "fricative",
			place: "postalveolar",
			voicing: "voiced",
		},
	},
	"voiced-postalveolar-affricate": {
		category: "consonant",
		features: {
			manner: "affricate",
			place: "postalveolar",
			voicing: "voiced",
		},
	},
	"voiceless-postalveolar-affricate": {
		category: "consonant",
		features: {
			manner: "affricate",
			place: "postalveolar",
			voicing: "voiceless",
		},
	},
	"voiced-bilabial-nasal": {
		category: "consonant",
		features: {
			manner: "nasal",
			place: "bilabial",
			voicing: "voiced",
		},
	},
	"voiced-alveolar-nasal": {
		category: "consonant",
		features: {
			manner: "nasal",
			place: "alveolar",
			voicing: "voiced",
		},
	},
	"voiced-velar-nasal": {
		category: "consonant",
		features: {
			manner: "nasal",
			place: "velar",
			voicing: "voiced",
		},
	},
	"voiced-alveolar-lateral-approximant": {
		category: "consonant",
		features: {
			manner: "approximant",
			place: "alveolar-lateral",
			voicing: "voiced",
		},
	},
	"voiced-postalveolar-approximant": {
		category: "consonant",
		features: {
			manner: "approximant",
			place: "postalveolar",
			voicing: "voiced",
		},
	},
	"voiced-palatal-approximant": {
		category: "consonant",
		features: {
			manner: "approximant",
			place: "palatal",
			voicing: "voiced",
		},
	},
	"voiced-labial-velar-approximant": {
		category: "consonant",
		features: {
			manner: "approximant",
			place: "labial-velar",
			voicing: "voiced",
		},
	},
};

// Monophthong vowel articulations

export type MonophthongVowelArticulation = PhonemeArticulationBase & {
	category: "vowel/monophthong";
	features: {
		height: VowelHeight;
		backness: VowelBackness;
		roundness: VowelRoundness;
		tenseness?: VowelTenseness; // Not all monophthongs have meaningful tenseness (no pairs like /i/ and /ɪ/)
	};
};

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
		},
	},
	"close-back-rounded": {
		category: "vowel/monophthong",
		features: {
			height: "close",
			backness: "back",
			roundness: "rounded",
		},
	},
	"near-close-near-front-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "near-close",
			backness: "near-front",
			roundness: "unrounded",
		},
	},
	"near-close-near-back-rounded": {
		category: "vowel/monophthong",
		features: {
			height: "near-close",
			backness: "near-back",
			roundness: "rounded",
		},
	},
	"mid-central-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "mid",
			backness: "central",
			roundness: "unrounded",
		},
	},
	"open-mid-front-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "open-mid",
			backness: "front",
			roundness: "unrounded",
		},
	},
	"open-mid-back-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "open-mid",
			backness: "back",
			roundness: "unrounded",
		},
	},
	"open-mid-back-rounded": {
		category: "vowel/monophthong",
		features: {
			height: "open-mid",
			backness: "back",
			roundness: "rounded",
		},
	},
	"near-open-front-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "near-open",
			backness: "front",
			roundness: "unrounded",
		},
	},
	"open-back-unrounded": {
		category: "vowel/monophthong",
		features: {
			height: "open",
			backness: "back",
			roundness: "unrounded",
		},
	},
};

// Diphthong vowel articulations

export type DiphthongVowelArticulation = PhonemeArticulationBase & {
	category: "vowel/diphthong";
	features: {
		startHeight: VowelHeight;
		startBackness: VowelBackness;
		startRoundness: VowelRoundness;
		targetHeight: VowelHeight;
		targetBackness: VowelBackness;
		targetRoundness: VowelRoundness;
	};
};

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

export type RhoticVowelArticulation = PhonemeArticulationBase & {
	category: "vowel/rhotic";
	features: {
		height: VowelHeight;
		backness: VowelBackness;
		roundness: VowelRoundness;
		tenseness: VowelTenseness;
	};
};

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
