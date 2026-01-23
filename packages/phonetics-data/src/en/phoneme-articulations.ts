import type {
	ConsonantArticulatoryFeatures,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
	VowelArticulatoryFeatures,
} from "../core/articulatory-features";
import type {
	ConsonantSymbolId,
	DiphthongSymbolId,
	MonophthongSymbolId,
	PhonemeSymbolId,
} from "../core/ipa-registry";
import type { PhonemeCategory } from "../core/types";

export type VowelType = "monophthong" | "diphthong";

type PhonemeArticulationBase<
	Category extends PhonemeCategory,
	Features extends Record<string, string>,
	VowelTypeArg extends VowelType | undefined = undefined,
> = Category extends "vowel"
	? {
			category: Category;
			vowelType: VowelTypeArg extends VowelType ? VowelTypeArg : never;
			features: Features;
		}
	: {
			category: Category;
			features: Features;
		};

// Consonant articulations
type ConsonantArticulation = PhonemeArticulationBase<"consonant", ConsonantArticulatoryFeatures>;

export const ConsonantArticulationRegistry: Record<ConsonantSymbolId, ConsonantArticulation> = {
	P: {
		category: "consonant",
		features: { manner: "plosive", place: "bilabial", voicing: "voiceless" },
	},
	B: {
		category: "consonant",
		features: { manner: "plosive", place: "bilabial", voicing: "voiced" },
	},
	T: {
		category: "consonant",
		features: { manner: "plosive", place: "alveolar", voicing: "voiceless" },
	},
	D: {
		category: "consonant",
		features: { manner: "plosive", place: "alveolar", voicing: "voiced" },
	},
	G: {
		category: "consonant",
		features: { manner: "plosive", place: "velar", voicing: "voiced" },
	},
	K: {
		category: "consonant",
		features: { manner: "plosive", place: "velar", voicing: "voiceless" },
	},
	DH: {
		category: "consonant",
		features: { manner: "fricative", place: "dental", voicing: "voiced" },
	},
	TH: {
		category: "consonant",
		features: { manner: "fricative", place: "dental", voicing: "voiceless" },
	},
	F: {
		category: "consonant",
		features: { manner: "fricative", place: "labiodental", voicing: "voiceless" },
	},
	V: {
		category: "consonant",
		features: { manner: "fricative", place: "labiodental", voicing: "voiced" },
	},
	H: {
		category: "consonant",
		features: { manner: "fricative", place: "glottal", voicing: "voiceless" },
	},
	S: {
		category: "consonant",
		features: { manner: "fricative", place: "alveolar", voicing: "voiceless" },
	},
	SH: {
		category: "consonant",
		features: { manner: "fricative", place: "postalveolar", voicing: "voiceless" },
	},
	Z: {
		category: "consonant",
		features: { manner: "fricative", place: "alveolar", voicing: "voiced" },
	},
	ZH: {
		category: "consonant",
		features: { manner: "fricative", place: "postalveolar", voicing: "voiced" },
	},
	J: {
		category: "consonant",
		features: { manner: "affricate", place: "postalveolar", voicing: "voiced" },
	},
	CH: {
		category: "consonant",
		features: { manner: "affricate", place: "postalveolar", voicing: "voiceless" },
	},
	M: {
		category: "consonant",
		features: { manner: "nasal", place: "bilabial", voicing: "voiced" },
	},
	N: {
		category: "consonant",
		features: { manner: "nasal", place: "alveolar", voicing: "voiced" },
	},
	NG: {
		category: "consonant",
		features: { manner: "nasal", place: "velar", voicing: "voiced" },
	},
	L: {
		category: "consonant",
		features: { manner: "lateral-approximant", place: "alveolar", voicing: "voiced" },
	},
	R: {
		category: "consonant",
		features: { manner: "approximant", place: "postalveolar", voicing: "voiced" },
	},
	Y: {
		category: "consonant",
		features: { manner: "approximant", place: "palatal", voicing: "voiced" },
	},
	W: {
		category: "consonant",
		features: { manner: "approximant", place: "labial-velar", voicing: "voiced" },
	},
};

// Monophthong vowel articulations

type MonophthongVowelArticulation = PhonemeArticulationBase<
	"vowel",
	VowelArticulatoryFeatures,
	"monophthong"
>;

export const MonophthongVowelArticulationRegistry: Record<
	MonophthongSymbolId,
	MonophthongVowelArticulation
> = {
	I: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "close",
			backness: "front",
			roundness: "unrounded",
			tenseness: "tense",
		},
	},
	U: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "close",
			backness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
	},
	IX: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "near-close",
			backness: "near-front",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	UX: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "near-close",
			backness: "near-back",
			roundness: "rounded",
			tenseness: "lax",
		},
	},
	AX: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "mid",
			backness: "central",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	E: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open-mid",
			backness: "front",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	AH: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open-mid",
			backness: "back",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	O: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open-mid",
			backness: "back",
			roundness: "rounded",
			tenseness: "tense",
		},
	},
	AE: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "near-open",
			backness: "front",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	A: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open",
			backness: "back",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	ER: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open-mid",
			backness: "central",
			roundness: "unrounded",
			tenseness: "tense",
			rhoticity: "r-colored",
		},
	},
};

// Diphthong vowel articulations

type DiphthongVowelArticulation = PhonemeArticulationBase<
	"vowel",
	{
		height: VowelArticulatoryFeatures["height"];
		backness: VowelArticulatoryFeatures["backness"];
		roundness: VowelArticulatoryFeatures["roundness"];
		targetHeight: VowelArticulatoryFeatures["height"];
		targetBackness: VowelArticulatoryFeatures["backness"];
		targetRoundness: VowelArticulatoryFeatures["roundness"];
	},
	"diphthong"
>;

export const DiphthongVowelArticulationRegistry: Record<
	DiphthongSymbolId,
	DiphthongVowelArticulation
> = {
	EI: {
		category: "vowel",
		vowelType: "diphthong",
		features: {
			height: "close-mid",
			backness: "front",
			roundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
	OU: {
		category: "vowel",
		vowelType: "diphthong",
		features: {
			height: "close-mid",
			backness: "back",
			roundness: "rounded",
			targetHeight: "near-close",
			targetBackness: "near-back",
			targetRoundness: "rounded",
		},
	},
	AI: {
		category: "vowel",
		vowelType: "diphthong",
		features: {
			height: "open",
			backness: "front",
			roundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
	AU: {
		category: "vowel",
		vowelType: "diphthong",
		features: {
			height: "open",
			backness: "front",
			roundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-back",
			targetRoundness: "rounded",
		},
	},
	OI: {
		category: "vowel",
		vowelType: "diphthong",
		features: {
			height: "open-mid",
			backness: "back",
			roundness: "rounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
};

export const PhonemeArticulationRegistry = {
	...ConsonantArticulationRegistry,
	...MonophthongVowelArticulationRegistry,
	...DiphthongVowelArticulationRegistry,
} as const satisfies Record<PhonemeSymbolId, PhonemeArticulation>;

export type PhonemeArticulation =
	| ConsonantArticulation
	| MonophthongVowelArticulation
	| DiphthongVowelArticulation;

type FeatureValueLookup = {
	[K in PhonemeArticulatoryFeatureKey]: Partial<
		Record<PhonemeSymbolId, PhonemeArticulatoryFeatures[K]>
	>;
};

const buildFeatureValueByPhoneme = (): FeatureValueLookup => {
	const lookup: FeatureValueLookup = {
		voicing: {},
		place: {},
		manner: {},
		height: {},
		backness: {},
		roundness: {},
		tenseness: {},
		rhoticity: {},
	};

	const assignFeatureValue = <K extends PhonemeArticulatoryFeatureKey>(
		key: K,
		phonemeId: PhonemeSymbolId,
		value: PhonemeArticulatoryFeatures[K] | undefined,
	) => {
		if (!value) return;
		lookup[key][phonemeId] = value;
	};

	for (const [phonemeId, articulation] of Object.entries(PhonemeArticulationRegistry) as [
		PhonemeSymbolId,
		PhonemeArticulation,
	][]) {
		const features = articulation.features as Partial<PhonemeArticulatoryFeatures>;

		assignFeatureValue("voicing", phonemeId, features.voicing);
		assignFeatureValue("place", phonemeId, features.place);
		assignFeatureValue("manner", phonemeId, features.manner);
		assignFeatureValue("height", phonemeId, features.height);
		assignFeatureValue("backness", phonemeId, features.backness);
		assignFeatureValue("roundness", phonemeId, features.roundness);
		assignFeatureValue("tenseness", phonemeId, features.tenseness);
		assignFeatureValue("rhoticity", phonemeId, features.rhoticity);
	}

	return lookup;
};

export const FeatureValueByPhonemeRegistry = buildFeatureValueByPhoneme();
