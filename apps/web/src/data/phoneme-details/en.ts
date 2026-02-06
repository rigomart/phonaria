import type { PhonemeDetailsCopy } from "./types";

const phonemeDetailsById: PhonemeDetailsCopy["phonemeDetailsById"] = {
	P: {
		label: "Voiceless bilabial plosive",
	},
	B: {
		label: "Voiced bilabial plosive",
	},
	T: {
		label: "Voiceless alveolar plosive",
	},
	D: {
		label: "Voiced alveolar plosive",
	},
	G: {
		label: "Voiced velar plosive",
	},
	K: {
		label: "Voiceless velar plosive",
	},
	DH: {
		label: "Voiced dental fricative",
	},
	TH: {
		label: "Voiceless dental fricative",
	},
	F: {
		label: "Voiceless labiodental fricative",
	},
	V: {
		label: "Voiced labiodental fricative",
	},
	H: {
		label: "Voiceless glottal fricative",
	},
	S: {
		label: "Voiceless alveolar fricative",
	},
	SH: {
		label: "Voiceless postalveolar fricative",
	},
	Z: {
		label: "Voiced alveolar fricative",
	},
	ZH: {
		label: "Voiced postalveolar fricative",
	},
	J: {
		label: "Voiced postalveolar affricate",
	},
	CH: {
		label: "Voiceless postalveolar affricate",
	},
	M: {
		label: "Voiced bilabial nasal",
	},
	N: {
		label: "Voiced alveolar nasal",
	},
	NG: {
		label: "Voiced velar nasal",
	},
	NY: {
		label: "Voiced palatal nasal",
	},
	L: {
		label: "Voiced alveolar lateral approximant",
	},
	R: {
		label: "Voiced postalveolar approximant",
	},
	RX: {
		label: "Voiced alveolar tap",
	},
	RR: {
		label: "Voiced alveolar trill",
	},
	Y: {
		label: "Voiced palatal approximant",
	},
	W: {
		label: "Voiced labial-velar approximant",
	},
	X: {
		label: "Voiceless velar fricative",
	},
	YH: {
		label: "Voiced palatal fricative",
	},
	I: {
		label: "Close front unrounded vowel",
	},
	U: {
		label: "Close back rounded vowel",
	},
	AA: {
		label: "Open central unrounded vowel",
	},
	IX: {
		label: "Near-close near-front unrounded vowel",
	},
	UX: {
		label: "Near-close near-back rounded vowel",
	},
	AX: {
		label: "Mid central unrounded vowel",
	},
	E: {
		label: "Open-mid front unrounded vowel",
	},
	EE: {
		label: "Close-mid front unrounded vowel",
	},
	AH: {
		label: "Open-mid back unrounded vowel",
	},
	O: {
		label: "Open-mid back rounded vowel",
	},
	OO: {
		label: "Close-mid back rounded vowel",
	},
	AE: {
		label: "Near-open front unrounded vowel",
	},
	A: {
		label: "Open back unrounded vowel",
	},
	EI: {
		label: "Close-mid front unrounded to near-close near-front unrounded diphthong",
	},
	OU: {
		label: "Close-mid back rounded to near-close near-back rounded diphthong",
	},
	AI: {
		label: "Open front unrounded to near-close near-front unrounded diphthong",
	},
	AU: {
		label: "Open front unrounded to near-close near-back rounded diphthong",
	},
	OI: {
		label: "Open-mid back rounded to near-close near-front unrounded diphthong",
	},
	ER: {
		label: "Open-mid central r-colored vowel",
	},
};

const featureDefinitions: PhonemeDetailsCopy["featureDefinitions"] = {
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
			tap: {
				label: "Tap",
				description: "Tongue makes one quick contact with the alveolar ridge.",
			},
			trill: {
				label: "Trill",
				description: "Tongue vibrates in repeated contacts with the alveolar ridge.",
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

const diphthongTargetDefinitions: PhonemeDetailsCopy["diphthongTargetDefinitions"] = {
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

const allophoneContextDefinitions: PhonemeDetailsCopy["allophoneContextDefinitions"] = {
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

export const phonemeDetailsCopyEn: PhonemeDetailsCopy = {
	phonemeDetailsById,
	featureDefinitions,
	diphthongTargetDefinitions,
	allophoneContextDefinitions,
};
