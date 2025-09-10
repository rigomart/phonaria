"use client";

import type { IpaPhoneme } from "shared-data";
import { getAvailableCategories, getCategoryOrderMap } from "../_lib/category-config";
import {
	filterPhonemesByCategory,
	searchPhonemes,
	sortPhonemesByCategory,
} from "../_lib/phoneme-filters";
import { CategorySection } from "./category-section";

interface PhonemeCategoriesProps<T extends IpaPhoneme> {
	phonemes: T[];
	type: "consonant" | "vowel";
	searchTerm: string;
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
	searchTerm,
	onPhonemeClick,
	defaultOpenCategories = true,
	showCategoryCounts = true,
}: PhonemeCategoriesProps<T>) {
	// Filter phonemes by search term
	const filteredPhonemes = searchPhonemes(phonemes, searchTerm);

	// Get available categories (only those with phonemes after filtering)
	const availableCategories = getAvailableCategories(filteredPhonemes, type);

	// Get category order for sorting
	const categoryOrder = getCategoryOrderMap(type);

	// If no categories available after search, show empty state
	if (availableCategories.length === 0 && searchTerm) {
		return (
			<div className="text-center py-12">
				<div className="text-muted-foreground">
					<div className="text-lg font-medium mb-2">No phonemes found</div>
					<div className="text-sm">
						No {type === "consonant" ? "consonant" : "vowel"} sounds match "{searchTerm}"
					</div>
					<div className="text-xs mt-2 text-muted-foreground/80">
						Try searching for a sound symbol, word, or description
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{availableCategories.map((category) => {
				const categoryPhonemes = filterPhonemesByCategory(filteredPhonemes, category.key);
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

			{/* Summary info when searching */}
			{searchTerm && availableCategories.length > 0 && (
				<div className="text-center text-sm text-muted-foreground pt-4 border-t">
					Found {filteredPhonemes.length} {type === "consonant" ? "consonant" : "vowel"}{" "}
					{filteredPhonemes.length === 1 ? "sound" : "sounds"} across {availableCategories.length}{" "}
					{availableCategories.length === 1 ? "category" : "categories"}
				</div>
			)}
		</div>
	);
}

/**
 * Compact variant for smaller spaces or embedded contexts
 */
export function PhonemeCategoriesCompact<T extends IpaPhoneme>({
	phonemes,
	type,
	searchTerm,
	onPhonemeClick,
}: Omit<PhonemeCategoriesProps<T>, "defaultOpenCategories" | "showCategoryCounts">) {
	const filteredPhonemes = searchPhonemes(phonemes, searchTerm);
	const availableCategories = getAvailableCategories(filteredPhonemes, type);
	const categoryOrder = getCategoryOrderMap(type);

	if (availableCategories.length === 0 && searchTerm) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<div className="text-sm">No results for "{searchTerm}"</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{availableCategories.map((category) => {
				const categoryPhonemes = filterPhonemesByCategory(filteredPhonemes, category.key);
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
