"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { CategoryInfo, IpaPhoneme } from "shared-data";
import { cn } from "@/lib/utils";
import { getAvailableCategories, getCategoryOrderMap } from "../_lib/category-config";
import { filterPhonemesByCategory, sortPhonemesByCategory } from "../_lib/phoneme-filters";
import { PhonemeCard } from "./phoneme-card";

interface PhonemeCategoriesProps<T extends IpaPhoneme> {
	phonemes: T[];
	type: "consonant" | "vowel";
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
						defaultOpen={defaultOpenCategories}
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
	defaultOpen?: boolean;
	showCount?: boolean;
}

/**
 * Enhanced category section component that groups phonemes by type.
 * Features collapsible sections, phoneme counts, and responsive grid layout.
 */
export function CategorySection<T extends IpaPhoneme>({
	category,
	phonemes,
	defaultOpen = true,
	showCount = true,
}: CategorySectionProps<T>) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	if (phonemes.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="group w-full flex items-center justify-between rounded-lg border bg-card/50 p-4 text-left hover:bg-card/80 transition-colors"
			>
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						<h3 className="text-lg font-semibold text-foreground">{category.label}</h3>
						{showCount && (
							<span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
								{phonemes.length}
							</span>
						)}
					</div>
					<p className="text-sm text-muted-foreground max-w-2xl">{category.description}</p>
				</div>
				<ChevronDownIcon
					className={cn(
						"h-5 w-5 text-muted-foreground transition-transform duration-200",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			{isOpen && (
				<div className="space-y-0 animate-in slide-in-from-top-2 duration-200">
					<div className="flex flex-wrap gap-3 max-w-6xl">
						{phonemes.map((phoneme) => (
							<PhonemeCard key={phoneme.symbol} phoneme={phoneme} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
