export interface CategoryInfo {
	key: string;
	label: string;
	description: string;
	order: number;
}

export interface CategoryConfig {
	consonant: Record<string, CategoryInfo>;
	vowel: Record<string, CategoryInfo>;
}

/**
 * Category metadata for organizing phonemes in a learning-friendly way.
 * This replaces complex grid transformations with simple category-based grouping.
 */
export const PHONEME_CATEGORIES: CategoryConfig = {
	consonant: {
		stop: {
			key: "stop",
			label: "Stops",
			description: "Complete blockage then release",
			order: 1,
		},
		fricative: {
			key: "fricative",
			label: "Fricatives",
			description: "Continuous airflow with friction",
			order: 2,
		},
		affricate: {
			key: "affricate",
			label: "Affricates",
			description: "Stop + fricative combination",
			order: 3,
		},
		nasal: {
			key: "nasal",
			label: "Nasals",
			description: "Air through nose",
			order: 4,
		},
		liquid: {
			key: "liquid",
			label: "Liquids",
			description: "L and R sounds",
			order: 5,
		},
		glide: {
			key: "glide",
			label: "Glides",
			description: "Vowel-like consonants",
			order: 6,
		},
	},
	vowel: {
		monophthong: {
			key: "monophthong",
			label: "Single Vowels",
			description: "Pure vowel sounds",
			order: 1,
		},
		diphthong: {
			key: "diphthong",
			label: "Diphthongs",
			description: "Two vowel sounds combined",
			order: 2,
		},
		rhotic: {
			key: "rhotic",
			label: "R-colored",
			description: "Vowels with R sound",
			order: 3,
		},
	},
} as const;

/**
 * Get ordered categories for a phoneme type
 */
export function getOrderedCategories(type: "consonant" | "vowel"): CategoryInfo[] {
	return Object.values(PHONEME_CATEGORIES[type]).sort((a, b) => a.order - b.order);
}

/**
 * Get category info by key
 */
export function getCategoryInfo(
	type: "consonant" | "vowel",
	key: string,
): CategoryInfo | undefined {
	return PHONEME_CATEGORIES[type][key];
}
