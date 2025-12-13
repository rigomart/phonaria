import type {
	PhonemeAllophoneContextKey,
	PhonemeArticulatoryFeatures,
	PhonemeSymbolId,
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

type BaseFeatureDefinitions = {
	[K in keyof Required<PhonemeArticulatoryFeatures>]: ArticulatoryFeature<
		NonNullable<PhonemeArticulatoryFeatures[K]>
	>;
};

type DiphthongTargetFeatureDefinitions = {
	targetHeight: ArticulatoryFeature<PhonemeArticulatoryFeatures["height"]>;
	targetBackness: ArticulatoryFeature<PhonemeArticulatoryFeatures["backness"]>;
	targetRoundness: ArticulatoryFeature<PhonemeArticulatoryFeatures["roundness"]>;
};

export type PhonemeDetailsEntry = {
	label: string;
};

// TODO: Refine pitfalls and steps before wiring to the UI
export const phonemeDetailsById: Record<PhonemeSymbolId, PhonemeDetailsEntry> = {
	"voiceless-bilabial-plosive": {
		label: "Voiceless bilabial plosive",
	},
	"voiced-bilabial-plosive": {
		label: "Voiced bilabial plosive",
	},
	"voiceless-alveolar-plosive": {
		label: "Voiceless alveolar plosive",
	},
	"voiced-alveolar-plosive": {
		label: "Voiced alveolar plosive",
	},
	"voiced-velar-plosive": {
		label: "Voiced velar plosive",
	},
	"voiceless-velar-plosive": {
		label: "Voiceless velar plosive",
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
	"r-colored-open-mid-central": {
		label: "Open-mid central r-colored vowel",
	},
};

export const featureDefinitions: BaseFeatureDefinitions = {
	manner: {
		label: "Manner",
		description: "How airflow is shaped to make the sound",
		values: {
			plosive: {
				label: "Plosive",
				description: "Airflow stops completely, then bursts out.",
			},
			fricative: {
				label: "Fricative",
				description: "Air squeezes through a tight gap, making a hiss.",
			},
			affricate: {
				label: "Affricate",
				description: "Starts by completely blocking air, then releases into a tight squeeze.",
			},
			nasal: {
				label: "Nasal",
				description: "Air flows through the nose instead of the mouth.",
			},
			approximant: {
				label: "Approximant",
				description: "Air flows smoothly without friction, like a vowel.",
			},
			"lateral-approximant": {
				label: "Lateral approximant",
				description:
					"Tongue blocks the center at the ridge while air flows along the sides of the tongue.",
			},
		},
	},
	place: {
		label: "Place",
		description: "Where in the mouth the sound is made",
		values: {
			bilabial: {
				label: "Bilabial",
				description: "Both lips come together to shape the sound.",
			},
			labiodental: {
				label: "Labiodental",
				description: "Top teeth meet the bottom lip.",
			},
			dental: {
				label: "Dental",
				description: "Tongue tip moves to the edge of the upper teeth.",
			},
			alveolar: {
				label: "Alveolar",
				description: "Tongue moves to the bumpy ridge behind the upper teeth.",
			},
			postalveolar: {
				label: "Postalveolar",
				description: "Tongue lifts to the area just behind the tooth ridge.",
			},
			palatal: {
				label: "Palatal",
				description: "Body of the tongue lifts to the hard roof of the mouth.",
			},
			velar: {
				label: "Velar",
				description: "Back of the tongue lifts to the soft part of the roof.",
			},
			glottal: {
				label: "Glottal",
				description: "Sound is made in the gap between the vocal cords.",
			},
			"labial-velar": {
				label: "Labial-velar",
				description: "Lips round while the back of the tongue lifts.",
			},
		},
	},
	voicing: {
		label: "Voicing",
		description: "Whether the vocal cords vibrate",
		values: {
			voiceless: {
				label: "Voiceless",
				description: "Vocal cords are silent; only air passes through.",
			},
			voiced: {
				label: "Voiced",
				description: "Vocal cords vibrate; you can feel a buzz.",
			},
		},
	},
	height: {
		label: "Height",
		description: "How high the tongue sits in the mouth",
		values: {
			close: {
				label: "Close",
				description: "Tongue is high; jaw is nearly closed.",
			},
			"near-close": {
				label: "Near-close",
				description: "Jaw relaxes slightly from the closed position.",
			},
			"close-mid": {
				label: "Close-mid",
				description: "Jaw opens a little more than closed.",
			},
			mid: {
				label: "Mid",
				description: "Jaw is in a neutral, resting position.",
			},
			"open-mid": {
				label: "Open-mid",
				description: "Jaw drops to a medium-low position.",
			},
			"near-open": {
				label: "Near-open",
				description: "Jaw is almost fully open.",
			},
			open: {
				label: "Open",
				description: "Jaw drops low; mouth is wide open.",
			},
		},
	},
	backness: {
		label: "Backness",
		description: "How far back the tongue is",
		values: {
			front: {
				label: "Front",
				description: "Tongue pushes forward in the mouth.",
			},
			"near-front": {
				label: "Near-front",
				description: "Tongue is slightly back from the front.",
			},
			central: {
				label: "Central",
				description: "Tongue rests in the middle of the mouth.",
			},
			"near-back": {
				label: "Near-back",
				description: "Tongue pulls slightly back.",
			},
			back: {
				label: "Back",
				description: "Tongue pulls far back into the throat.",
			},
		},
	},
	roundness: {
		label: "Roundness",
		description: "Whether the lips are rounded",
		values: {
			rounded: {
				label: "Rounded",
				description: "Lips form a circle.",
			},
			unrounded: {
				label: "Unrounded",
				description: "Lips are relaxed or smiling.",
			},
		},
	},
	tenseness: {
		label: "Tenseness",
		description: "How tight the muscles are",
		values: {
			tense: {
				label: "Tense",
				description: "Muscles are tight; sound is longer.",
			},
			lax: {
				label: "Lax",
				description: "Muscles are relaxed; sound is shorter.",
			},
		},
	},
	rhoticity: {
		label: "R-coloring",
		description: "Whether the vowel carries r-like coloring",
		values: {
			"r-colored": {
				label: "R-colored",
				description: "Tongue adds subtle /r/ quality; resonance stays central.",
			},
		},
	},
};

export const diphthongTargetDefinitions: DiphthongTargetFeatureDefinitions = {
	targetHeight: {
		label: "Height",
		description: "Vertical position of the tongue at the end of the diphthong",
		values: {
			close: {
				label: "Close",
				description: "Tongue is high near the roof; jaw is nearly closed.",
			},
			"near-close": {
				label: "Near-close",
				description: "Tongue is high but relaxed; jaw is slightly open.",
			},
			"close-mid": {
				label: "Close-mid",
				description: "Tongue sits in the upper middle part of the mouth.",
			},
			mid: {
				label: "Mid",
				description: "Jaw is in a neutral, resting position.",
			},
			"open-mid": {
				label: "Open-mid",
				description: "Jaw drops to a medium-low position.",
			},
			"near-open": {
				label: "Near-open",
				description: "Jaw is almost fully open.",
			},
			open: {
				label: "Open",
				description: "Tongue lies low; jaw drops wide open.",
			},
		},
	},
	targetBackness: {
		label: "Backness",
		description: "Horizontal position of the tongue at the end of the diphthong",
		values: {
			front: {
				label: "Front",
				description: "Tongue pushes forward in the mouth.",
			},
			"near-front": {
				label: "Near-front",
				description: "Tongue is forward, but slightly retracted.",
			},
			central: {
				label: "Central",
				description: "Tongue rests in the middle of the mouth.",
			},
			"near-back": {
				label: "Near-back",
				description: "Tongue is back, but not fully retracted.",
			},
			back: {
				label: "Back",
				description: "Tongue pulls back toward the soft palate.",
			},
		},
	},
	targetRoundness: {
		label: "Roundness",
		description: "Lip rounding at the end of the diphthong",
		values: {
			rounded: {
				label: "Rounded",
				description: "Lips form a circle.",
			},
			unrounded: {
				label: "Unrounded",
				description: "Lips are relaxed or smiling.",
			},
		},
	},
};

export type AllophoneContextDefinition = {
	name: string;
	description: string;
	when: string;
};

export const allophoneContextDefinitions: Record<
	PhonemeAllophoneContextKey,
	AllophoneContextDefinition
> = {
	"stressed-onset-aspirated": {
		name: "Aspirated",
		description: "Released with a puff of air",
		when: "At the start of stressed syllables",
	},
	"after-s-onset-unaspirated": {
		name: "Unaspirated",
		description: "Released without the puff of air",
		when: "After /s/ at the start of syllables",
	},
	"vowel-to-vowel-flap": {
		name: "Flap",
		description: "Quick tap of the tongue",
		when: "Between vowels in casual speech",
	},
	"t-before-syllabic-n-glottal": {
		name: "Glottal stop",
		description: "Brief closure in the throat",
		when: "Before syllabic /n/ (as in 'button')",
	},
	"coda-dark-l": {
		name: "Dark L",
		description: "Produced with back of tongue raised",
		when: "At the end of syllables or before consonants",
	},
	"pre-voiced-coda-lengthened": {
		name: "Lengthened",
		description: "Held slightly longer",
		when: "Before voiced consonants like /d/, /b/, /v/",
	},
	"pre-voiceless-coda-shorter": {
		name: "Shortened",
		description: "Held slightly shorter",
		when: "Before voiceless consonants like /t/, /p/, /f/",
	},
	"stressed-r-colored": {
		name: "Stressed R-colored",
		description: "Stressed r-colored vowel with full R-coloring",
		when: "In stressed syllables",
	},
	"unstressed-r-colored": {
		name: "Unstressed R-colored",
		description: "Reduced r-colored vowel with lighter R-coloring",
		when: "In unstressed syllables (particularly word-final -er)",
	},
};
