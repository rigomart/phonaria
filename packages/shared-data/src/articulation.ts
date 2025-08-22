// Unified articulation registry for simplified lookups
export interface ArticulationEntry {
	key: string;
	label: string;
	short: string;
	airflow?: string;
	category: string;
	tooltipSide: "top" | "right" | "bottom" | "left";
}

// Consonant articulation registry (places and manners)
export const consonantArticulationRegistry: Record<string, ArticulationEntry> = {
	// Places
	bilabial: {
		key: "bilabial",
		label: "Bilabial",
		short: "Both lips come together to block then release or narrow airflow.",
		category: "Place",
		tooltipSide: "top",
	},
	labiodental: {
		key: "labiodental",
		label: "Labiodental",
		short: "Bottom lip lightly contacts upper front teeth allowing friction.",
		category: "Place",
		tooltipSide: "top",
	},
	dental: {
		key: "dental",
		label: "Dental",
		short: "Tongue tip lightly touches upper teeth (or protrudes slightly).",
		category: "Place",
		tooltipSide: "top",
	},
	alveolar: {
		key: "alveolar",
		label: "Alveolar",
		short: "Tongue tip/blade contacts or approaches ridge behind teeth.",
		category: "Place",
		tooltipSide: "top",
	},
	postalveolar: {
		key: "postalveolar",
		label: "Postalveolar",
		short: "Tongue blade just behind alveolar ridge; slightly retracted.",
		category: "Place",
		tooltipSide: "top",
	},
	palatal: {
		key: "palatal",
		label: "Palatal",
		short: "Tongue front approximates hard palate without full closure.",
		category: "Place",
		tooltipSide: "top",
	},
	velar: {
		key: "velar",
		label: "Velar",
		short: "Back of tongue contacts soft palate (velum).",
		category: "Place",
		tooltipSide: "top",
	},
	glottal: {
		key: "glottal",
		label: "Glottal",
		short: "Constriction at the vocal folds inside the larynx.",
		category: "Place",
		tooltipSide: "top",
	},

	// Manners
	stop: {
		key: "stop",
		label: "Stop (Plosive)",
		short: "Complete closure then release of airflow.",
		airflow: "Blocked then released explosively.",
		category: "Manner",
		tooltipSide: "right",
	},
	fricative: {
		key: "fricative",
		label: "Fricative",
		short: "Narrow passage creates continuous turbulent airflow.",
		airflow: "Continuous turbulent stream.",
		category: "Manner",
		tooltipSide: "right",
	},
	affricate: {
		key: "affricate",
		label: "Affricate",
		short: "Stop closure releasing directly into a fricative.",
		airflow: "Blocked then immediately turbulent.",
		category: "Manner",
		tooltipSide: "right",
	},
	nasal: {
		key: "nasal",
		label: "Nasal",
		short: "Air flows through nose while oral cavity is closed.",
		airflow: "Redirected through nasal cavity.",
		category: "Manner",
		tooltipSide: "right",
	},
	liquid: {
		key: "liquid",
		label: "Liquid (Approximant)",
		short: "Tongue shapes channel; minimal friction.",
		airflow: "Mostly unobstructed, smooth.",
		category: "Manner",
		tooltipSide: "right",
	},
	glide: {
		key: "glide",
		label: "Glide (Semivowel)",
		short: "Very open constriction transitions into a vowel.",
		airflow: "Open, vowel-like.",
		category: "Manner",
		tooltipSide: "right",
	},
};

// Vowel articulation registry (heights and frontnesses)
export const vowelArticulationRegistry: Record<string, ArticulationEntry> = {
	// Heights
	high: {
		key: "high",
		label: "High",
		short: "Tongue raised close to the roof; jaw nearly closed.",
		category: "Height",
		tooltipSide: "right",
	},
	"near-high": {
		key: "near-high",
		label: "Near high",
		short: "Slightly lower than high; still close to the roof.",
		category: "Height",
		tooltipSide: "right",
	},
	"high-mid": {
		key: "high-mid",
		label: "High‑mid",
		short: "Between high and mid tongue height.",
		category: "Height",
		tooltipSide: "right",
	},
	mid: {
		key: "mid",
		label: "Mid",
		short: "Tongue centrally between high and low positions.",
		category: "Height",
		tooltipSide: "right",
	},
	"low-mid": {
		key: "low-mid",
		label: "Low‑mid",
		short: "Between mid and low tongue height.",
		category: "Height",
		tooltipSide: "right",
	},
	"near-low": {
		key: "near-low",
		label: "Near low",
		short: "Slightly higher than fully low.",
		category: "Height",
		tooltipSide: "right",
	},
	low: {
		key: "low",
		label: "Low",
		short: "Tongue lowered; mouth more open.",
		category: "Height",
		tooltipSide: "right",
	},

	// Frontnesses
	front: {
		key: "front",
		label: "Front",
		short: "Tongue advanced toward the front of the mouth.",
		category: "Frontness",
		tooltipSide: "top",
	},
	"near-front": {
		key: "near-front",
		label: "Near front",
		short: "Slightly retracted from fully front.",
		category: "Frontness",
		tooltipSide: "top",
	},
	central: {
		key: "central",
		label: "Central",
		short: "Tongue positioned near the center of the mouth.",
		category: "Frontness",
		tooltipSide: "top",
	},
	"near-back": {
		key: "near-back",
		label: "Near back",
		short: "Slightly advanced from fully back.",
		category: "Frontness",
		tooltipSide: "top",
	},
	back: {
		key: "back",
		label: "Back",
		short: "Tongue retracted toward the velum (back).",
		category: "Frontness",
		tooltipSide: "top",
	},
};

// Unified registry for backward compatibility
export const articulationRegistry: Record<string, ArticulationEntry> = {
	...consonantArticulationRegistry,
	...vowelArticulationRegistry,
};
