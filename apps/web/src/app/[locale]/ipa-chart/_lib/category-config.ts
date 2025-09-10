import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { type CategoryInfo, getOrderedCategories } from "shared-data";

/**
 * Get category configuration for consonants
 */
export function getConsonantCategories(): CategoryInfo[] {
	return getOrderedCategories("consonant");
}

/**
 * Get category configuration for vowels
 */
export function getVowelCategories(): CategoryInfo[] {
	return getOrderedCategories("vowel");
}

/**
 * Get category order mapping for sorting
 */
export function getCategoryOrderMap(type: "consonant" | "vowel"): Record<string, number> {
	const categories = getOrderedCategories(type);
	const orderMap: Record<string, number> = {};

	for (const category of categories) {
		orderMap[category.key] = category.order;
	}

	return orderMap;
}

/**
 * Check if a category has phonemes
 */
export function categoryHasPhonemes<T extends ConsonantPhoneme | VowelPhoneme>(
	phonemes: T[],
	categoryKey: string,
): boolean {
	return phonemes.some((phoneme) => phoneme.type === categoryKey);
}

/**
 * Get all available categories from a phoneme array
 */
export function getAvailableCategories<T extends ConsonantPhoneme | VowelPhoneme>(
	phonemes: T[],
	type: "consonant" | "vowel",
): CategoryInfo[] {
	const allCategories = getOrderedCategories(type);
	return allCategories.filter((category) => categoryHasPhonemes(phonemes, category.key));
}
