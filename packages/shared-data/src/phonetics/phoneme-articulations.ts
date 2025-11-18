import type {
	ConsonantArticulatoryFeatures,
	ConsonantSymbolId,
	DiphthongSymbolId,
	MonophthongSymbolId,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
	PhonemeCategory,
	PhonemeSymbolId,
	RhoticSymbolId,
	VowelArticulatoryFeatures,
} from "./symbols-registry";

type PhonemeArticulationBase<
	Category extends PhonemeCategory,
	Features extends Record<string, string>,
> = {
	category: Category;
	features: Features;
};

// Consonant articulations
type ConsonantArticulation = PhonemeArticulationBase<"consonant", ConsonantArticulatoryFeatures>;

export const ConsonantArticulationRegistry: Record<ConsonantSymbolId, ConsonantArticulation> = {
	"voiceless-bilabial-plosive": {
		category: "consonant",
		features: { manner: "plosive", place: "bilabial", voicing: "voiceless" },
	},
	"voiced-bilabial-plosive": {
		category: "consonant",
		features: { manner: "plosive", place: "bilabial", voicing: "voiced" },
	},
	"voiceless-alveolar-plosive": {
		category: "consonant",
		features: { manner: "plosive", place: "alveolar", voicing: "voiceless" },
	},
	"voiced-alveolar-plosive": {
		category: "consonant",
		features: { manner: "plosive", place: "alveolar", voicing: "voiced" },
	},
	"voiced-velar-plosive": {
		category: "consonant",
		features: { manner: "plosive", place: "velar", voicing: "voiced" },
	},
	"voiceless-velar-plosive": {
		category: "consonant",
		features: { manner: "plosive", place: "velar", voicing: "voiceless" },
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

export const MonophthongVowelArticulationRegistry: Record<
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
		height: VowelArticulatoryFeatures["height"];
		backness: VowelArticulatoryFeatures["backness"];
		roundness: VowelArticulatoryFeatures["roundness"];
		targetHeight: VowelArticulatoryFeatures["height"];
		targetBackness: VowelArticulatoryFeatures["backness"];
		targetRoundness: VowelArticulatoryFeatures["roundness"];
	}
>;

export const DiphthongVowelArticulationRegistry: Record<
	DiphthongSymbolId,
	DiphthongVowelArticulation
> = {
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		category: "vowel/diphthong",
		features: {
			height: "close-mid",
			backness: "front",
			roundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		category: "vowel/diphthong",
		features: {
			height: "close-mid",
			backness: "back",
			roundness: "rounded",
			targetHeight: "near-close",
			targetBackness: "near-back",
			targetRoundness: "rounded",
		},
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		category: "vowel/diphthong",
		features: {
			height: "open",
			backness: "front",
			roundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		category: "vowel/diphthong",
		features: {
			height: "open",
			backness: "front",
			roundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-back",
			targetRoundness: "rounded",
		},
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		category: "vowel/diphthong",
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

// Rhotic vowel articulations

type RhoticVowelArticulation = PhonemeArticulationBase<"vowel/rhotic", VowelArticulatoryFeatures>;

export const RhoticVowelArticulationRegistry: Record<RhoticSymbolId, RhoticVowelArticulation> = {
	"open-mid-central-rhotic": {
		category: "vowel/rhotic",
		features: {
			height: "open-mid",
			backness: "central",
			roundness: "unrounded",
			tenseness: "tense",
		},
	},
};

export const PhonemeArticulationRegistry = {
	...ConsonantArticulationRegistry,
	...MonophthongVowelArticulationRegistry,
	...DiphthongVowelArticulationRegistry,
	...RhoticVowelArticulationRegistry,
} as const satisfies Record<PhonemeSymbolId, PhonemeArticulation>;

export type PhonemeArticulation =
	| ConsonantArticulation
	| MonophthongVowelArticulation
	| DiphthongVowelArticulation
	| RhoticVowelArticulation;

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
	}

	return lookup;
};

export const FeatureValueByPhonemeRegistry = buildFeatureValueByPhoneme();
