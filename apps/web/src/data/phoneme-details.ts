import type {
	ConsonantArticulatoryFeatures,
	PhonemeSymbolId,
	VowelArticulatoryFeatures,
} from "shared-data";

export type FeatureValueDefinition = {
	label: string;
	description: string;
};

export type ArticulatoryFeature<ValueKey extends string> = {
	label: string;
	description: string;
	values: Record<ValueKey, FeatureValueDefinition>;
};

type ConsonantFeatureDefinitions = {
	[K in keyof ConsonantArticulatoryFeatures]: ArticulatoryFeature<ConsonantArticulatoryFeatures[K]>;
};

type VowelFeatureDefinitions = {
	[K in keyof VowelArticulatoryFeatures]: ArticulatoryFeature<VowelArticulatoryFeatures[K]>;
};

export type PhonemeDetailsEntry = {
	label: string;
	steps?: string[];
	pitfalls?: { summary: string; tip: string }[];
};

export const phonemeDetailsById: Record<PhonemeSymbolId, PhonemeDetailsEntry> = {
	"voiceless-bilabial-stop": {
		label: "Voiceless bilabial stop",
	},
	"voiced-bilabial-stop": {
		label: "Voiced bilabial stop",
	},
	"voiceless-alveolar-stop": {
		label: "Voiceless alveolar stop",
	},
	"voiced-alveolar-stop": {
		label: "Voiced alveolar stop",
	},
	"voiced-velar-stop": {
		label: "Voiced velar stop",
	},
	"voiceless-velar-stop": {
		label: "Voiceless velar stop",
	},
	"voiced-dental-fricative": {
		label: "Voiced dental fricative",
	},
	"voiceless-dental-fricative": {
		label: "Voiceless dental fricative",
	},
	"voiceless-labiodental-fricative": {
		label: "Voiceless labiodental fricative",
	},
	"voiced-labiodental-fricative": {
		label: "Voiced labiodental fricative",
	},
	"voiceless-glottal-fricative": {
		label: "Voiceless glottal fricative",
	},
	"voiceless-alveolar-fricative": {
		label: "Voiceless alveolar fricative",
	},
	"voiceless-postalveolar-fricative": {
		label: "Voiceless postalveolar fricative",
	},
	"voiced-alveolar-fricative": {
		label: "Voiced alveolar fricative",
	},
	"voiced-postalveolar-fricative": {
		label: "Voiced postalveolar fricative",
	},
	"voiced-postalveolar-affricate": {
		label: "Voiced postalveolar affricate",
	},
	"voiceless-postalveolar-affricate": {
		label: "Voiceless postalveolar affricate",
	},
	"voiced-bilabial-nasal": {
		label: "Voiced bilabial nasal",
	},
	"voiced-alveolar-nasal": {
		label: "Voiced alveolar nasal",
	},
	"voiced-velar-nasal": {
		label: "Voiced velar nasal",
	},
	"voiced-alveolar-lateral-approximant": {
		label: "Voiced alveolar lateral approximant",
	},
	"voiced-postalveolar-approximant": {
		label: "Voiced postalveolar approximant",
	},
	"voiced-palatal-approximant": {
		label: "Voiced palatal approximant",
	},
	"voiced-labial-velar-approximant": {
		label: "Voiced labial-velar approximant",
	},
	"close-front-unrounded": {
		label: "Close front unrounded vowel",
	},
	"close-back-rounded": {
		label: "Close back rounded vowel",
	},
	"near-close-near-front-unrounded": {
		label: "Near-close near-front unrounded vowel",
	},
	"near-close-near-back-rounded": {
		label: "Near-close near-back rounded vowel",
	},
	"mid-central-unrounded": {
		label: "Mid central unrounded vowel",
	},
	"open-mid-front-unrounded": {
		label: "Open-mid front unrounded vowel",
	},
	"open-mid-back-unrounded": {
		label: "Open-mid back unrounded vowel",
	},
	"open-mid-back-rounded": {
		label: "Open-mid back rounded vowel",
	},
	"near-open-front-unrounded": {
		label: "Near-open front unrounded vowel",
	},
	"open-back-unrounded": {
		label: "Open back unrounded vowel",
	},
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		label: "Close-mid front unrounded to near-close near-front unrounded diphthong",
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		label: "Close-mid back rounded to near-close near-back rounded diphthong",
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		label: "Open front unrounded to near-close near-front unrounded diphthong",
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		label: "Open front unrounded to near-close near-back rounded diphthong",
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		label: "Open-mid back rounded to near-close near-front unrounded diphthong",
	},
	"mid-central-rhotic-tense": {
		label: "Mid central rhotic tense vowel",
	},
	"mid-central-rhotic-lax": {
		label: "Mid central rhotic lax vowel",
	},
};

export const consonantFeatureDefinitions: ConsonantFeatureDefinitions = {
	manner: {
		label: "Manner",
		description: "How airflow is modified to produce the sound",
		values: {
			stop: {
				label: "Stop",
				description: "Airflow fully stops then releases in a burst.",
			},
			fricative: {
				label: "Fricative",
				description: "Air flows through a tight gap creating turbulence.",
			},
			affricate: {
				label: "Affricate",
				description: "Stop closure releases straight into a fricative.",
			},
			nasal: {
				label: "Nasal",
				description: "Air is redirected through the nose while the mouth closes.",
			},
			approximant: {
				label: "Approximant",
				description: "Articulators approach without creating turbulence.",
			},
		},
	},
	place: {
		label: "Place",
		description: "Where in the mouth the sound is produced",
		values: {
			bilabial: {
				label: "Bilabial",
				description: "Both lips come together to shape the sound.",
			},
			labiodental: {
				label: "Labiodental",
				description: "Bottom lip makes gentle contact with upper teeth.",
			},
			dental: {
				label: "Dental",
				description: "Tongue touches or rests between the front teeth.",
			},
			alveolar: {
				label: "Alveolar",
				description: "Tongue contacts the ridge just behind the teeth.",
			},
			postalveolar: {
				label: "Postalveolar",
				description: "Tongue moves slightly behind the alveolar ridge.",
			},
			palatal: {
				label: "Palatal",
				description: "Tongue front raises toward the hard palate.",
			},
			velar: {
				label: "Velar",
				description: "Tongue back meets the soft palate (velum).",
			},
			glottal: {
				label: "Glottal",
				description: "Constriction forms at the vocal folds inside the larynx.",
			},
			"alveolar-lateral": {
				label: "Alveolar lateral",
				description: "Tongue tip stays at the alveolar ridge while air escapes round the sides.",
			},
			"labial-velar": {
				label: "Labial-velar",
				description: "Lips round while the tongue back approaches the velum.",
			},
		},
	},
	voicing: {
		label: "Voicing",
		description: "Whether the vocal folds vibrate during production",
		values: {
			voiceless: {
				label: "Voiceless",
				description: "Vocal folds stay open, so there is no vibration.",
			},
			voiced: {
				label: "Voiced",
				description: "Vocal folds vibrate, touch your throat to feel it.",
			},
		},
	},
};

export const vowelFeatureDefinitions: VowelFeatureDefinitions = {
	height: {
		label: "Height",
		description: "Vertical position of the tongue in the mouth",
		values: {
			close: {
				label: "Close",
				description: "Tongue is high in the mouth, jaw nearly closed.",
			},
			"near-close": {
				label: "Near-close",
				description: "Tongue sits just below the close position.",
			},
			"close-mid": {
				label: "Close-mid",
				description: "Tongue height between close and mid.",
			},
			mid: {
				label: "Mid",
				description: "Tongue rests halfway between high and low positions.",
			},
			"open-mid": {
				label: "Open-mid",
				description: "Tongue is lower than mid but not fully open.",
			},
			"near-open": {
				label: "Near-open",
				description: "Tongue approaches the fully open position.",
			},
			open: {
				label: "Open",
				description: "Tongue sits low, mouth is open wide.",
			},
		},
	},
	backness: {
		label: "Backness",
		description: "Horizontal position of the tongue in the mouth",
		values: {
			front: {
				label: "Front",
				description: "Tongue body shifts toward the front of the mouth.",
			},
			"near-front": {
				label: "Near-front",
				description: "Tongue is slightly retracted from the front position.",
			},
			central: {
				label: "Central",
				description: "Tongue body stays near the middle of the mouth.",
			},
			"near-back": {
				label: "Near-back",
				description: "Tongue advances slightly from a back position.",
			},
			back: {
				label: "Back",
				description: "Tongue body retracts toward the back of the mouth.",
			},
		},
	},
	roundness: {
		label: "Roundness",
		description: "Whether the lips are rounded during production",
		values: {
			rounded: {
				label: "Rounded",
				description: "Lips purse forward creating a rounded opening.",
			},
			unrounded: {
				label: "Unrounded",
				description: "Lips stay relaxed or spread without rounding.",
			},
		},
	},
	tenseness: {
		label: "Tenseness",
		description: "Muscle tension and duration of the vowel",
		values: {
			tense: {
				label: "Tense",
				description: "Tongue and lips hold a firmer, longer posture.",
			},
			lax: {
				label: "Lax",
				description: "Articulators stay looser with a shorter duration.",
			},
		},
	},
};
