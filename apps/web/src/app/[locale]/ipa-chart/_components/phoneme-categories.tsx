"use client";

import type { CategoryInfo, IpaPhoneme } from "shared-data";
import { getAvailableCategories, getCategoryOrderMap } from "../_lib/category-config";
import { filterPhonemesByCategory, sortPhonemesByCategory } from "../_lib/phoneme-filters";
import { PhonemeCard } from "./phoneme-card";

interface PhonemeCategoriesProps<T extends IpaPhoneme> {
	phonemes: T[];
	type: "consonant" | "vowel";
	showCategoryCounts?: boolean;
}

/**
 * Main container component that organizes phonemes by categories.
 */
export function PhonemeCategories<T extends IpaPhoneme>({
	phonemes,
	type,
	showCategoryCounts = true,
}: PhonemeCategoriesProps<T>) {
	// Get available categories
	const availableCategories = getAvailableCategories(phonemes, type);

	// Get category order for sorting
	const categoryOrder = getCategoryOrderMap(type);

	return (
		<div className="space-y-5">
			{availableCategories.map((category) => {
				const categoryPhonemes = filterPhonemesByCategory(phonemes, category.key);
				const sortedPhonemes = sortPhonemesByCategory(categoryPhonemes, categoryOrder);

				return (
					<CategorySection
						key={category.key}
						category={category}
						phonemes={sortedPhonemes}
						showCount={showCategoryCounts}
					/>
				);
			})}
		</div>
	);
}

interface CategorySectionProps<T extends IpaPhoneme> {
	category: CategoryInfo;
	phonemes: T[];
	showCount?: boolean;
}

/**
 * Category section component that groups phonemes by type using a compact layout.
 */
export function CategorySection<T extends IpaPhoneme>({
	category,
	phonemes,
	showCount = true,
}: CategorySectionProps<T>) {
	if (phonemes.length === 0) {
		return null;
	}

	return (
		<section className="space-y-3">
			<header className="flex items-start justify-between border-b border-border/60 pb-2">
				<div className="space-y-1">
					<h3 className="text-sm font-semibold text-foreground tracking-tight">{category.label}</h3>
					<p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
						{category.description}
					</p>
				</div>
				{showCount && (
					<span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-[3px] text-[10px] font-semibold uppercase tracking-wide text-primary">
						{phonemes.length}
					</span>
				)}
			</header>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,max-content))] justify-start gap-2 sm:gap-2.5">
				{phonemes.map((phoneme) => (
					<PhonemeCard key={phoneme.symbol} phoneme={phoneme} />
				))}
			</div>
		</section>
	);
}
