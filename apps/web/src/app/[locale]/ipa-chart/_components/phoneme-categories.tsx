"use client";

import type { IpaPhoneme } from "shared-data";
import { getAvailableCategories, getCategoryOrderMap } from "../_lib/category-config";
import { filterPhonemesByCategory, sortPhonemesByCategory } from "../_lib/phoneme-filters";
import { CategorySection } from "./category-section";

interface PhonemeCategoriesProps<T extends IpaPhoneme> {
	phonemes: T[];
	type: "consonant" | "vowel";
	onPhonemeClick: (phoneme: T) => void;
	defaultOpenCategories?: boolean;
	showCategoryCounts?: boolean;
}

/**
 * Enhanced main container component that organizes phonemes by categories.
 * Provides collapsible categories, search filtering, and responsive layout.
 */
export function PhonemeCategories<T extends IpaPhoneme>({
	phonemes,
	type,
	onPhonemeClick,
	defaultOpenCategories = true,
	showCategoryCounts = true,
}: PhonemeCategoriesProps<T>) {
	// Get available categories
	const availableCategories = getAvailableCategories(phonemes, type);

	// Get category order for sorting
	const categoryOrder = getCategoryOrderMap(type);

	return (
		<div className="space-y-6">
			{availableCategories.map((category) => {
				const categoryPhonemes = filterPhonemesByCategory(phonemes, category.key);
				const sortedPhonemes = sortPhonemesByCategory(categoryPhonemes, categoryOrder);

				return (
					<CategorySection
						key={category.key}
						category={category}
						phonemes={sortedPhonemes}
						onPhonemeClick={onPhonemeClick}
						defaultOpen={defaultOpenCategories}
						showCount={showCategoryCounts}
					/>
				);
			})}
		</div>
	);
}

/**
 * Compact variant for smaller spaces or embedded contexts
 */
export function PhonemeCategoriesCompact<T extends IpaPhoneme>({
	phonemes,
	type,
	onPhonemeClick,
}: Omit<PhonemeCategoriesProps<T>, "defaultOpenCategories" | "showCategoryCounts">) {
	const availableCategories = getAvailableCategories(phonemes, type);
	const categoryOrder = getCategoryOrderMap(type);

	return (
		<div className="space-y-4">
			{availableCategories.map((category) => {
				const categoryPhonemes = filterPhonemesByCategory(phonemes, category.key);
				const sortedPhonemes = sortPhonemesByCategory(categoryPhonemes, categoryOrder);

				return (
					<div key={category.key} className="space-y-2">
						<div className="flex items-center gap-2">
							<h4 className="text-sm font-medium">{category.label}</h4>
							<span className="text-xs text-muted-foreground">({sortedPhonemes.length})</span>
						</div>
						<div className="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-2">
							{sortedPhonemes.map((phoneme) => (
								<button
									key={phoneme.symbol}
									type="button"
									onClick={() => onPhonemeClick(phoneme)}
									className="aspect-square flex items-center justify-center rounded border hover:border-primary transition-colors text-sm font-semibold"
								>
									{phoneme.symbol}
								</button>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
