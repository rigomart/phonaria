import type { IpaPhoneme } from "shared-data";

/**
 * Filter phonemes by category type
 */
export function filterPhonemesByCategory<T extends IpaPhoneme>(
	phonemes: T[],
	category: string,
): T[] {
	return phonemes.filter((phoneme) => phoneme.type === category);
}

/**
 * Sort phonemes by category order and then alphabetically by symbol
 */
export function sortPhonemesByCategory<T extends IpaPhoneme>(
	phonemes: T[],
	categoryOrder: Record<string, number> = {},
): T[] {
	return [...phonemes].sort((a, b) => {
		// First sort by category order
		const aOrder = categoryOrder[a.type] ?? 999;
		const bOrder = categoryOrder[b.type] ?? 999;

		if (aOrder !== bOrder) {
			return aOrder - bOrder;
		}

		// Then sort alphabetically by symbol
		return a.symbol.localeCompare(b.symbol);
	});
}

/**
 * Group phonemes by their type/category
 */
export function groupPhonemesByCategory<T extends IpaPhoneme>(phonemes: T[]): Record<string, T[]> {
	const grouped: Record<string, T[]> = {};

	for (const phoneme of phonemes) {
		if (!grouped[phoneme.type]) {
			grouped[phoneme.type] = [];
		}
		grouped[phoneme.type].push(phoneme);
	}

	return grouped;
}

/**
 * Get phoneme count by category
 */
export function getPhonemeCountByCategory<T extends IpaPhoneme>(
	phonemes: T[],
): Record<string, number> {
	const counts: Record<string, number> = {};

	for (const phoneme of phonemes) {
		counts[phoneme.type] = (counts[phoneme.type] ?? 0) + 1;
	}

	return counts;
}
