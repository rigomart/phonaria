"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { CategoryInfo, IpaPhoneme } from "shared-data";
import { cn } from "@/lib/utils";
import { PhonemeCard } from "./phoneme-card";

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
				className="group flex w-full items-center justify-between rounded-lg border bg-card/50 p-4 text-left hover:bg-card/80 transition-colors"
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
					<div className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-3 max-w-6xl">
						{phonemes.map((phoneme) => (
							<PhonemeCard key={phoneme.symbol} phoneme={phoneme} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * Compact variant for smaller spaces
 */
export function CategorySectionCompact<T extends IpaPhoneme>({
	category,
	phonemes,
}: CategorySectionProps<T>) {
	if (phonemes.length === 0) {
		return null;
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-3">
				<h4 className="text-base font-medium text-foreground">{category.label}</h4>
				<span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
					{phonemes.length}
				</span>
			</div>

			<div className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2 max-w-4xl">
				{phonemes.map((phoneme) => (
					<PhonemeCard
						key={phoneme.symbol}
						phoneme={phoneme}
						className="min-w-[3.5rem] min-h-[3.5rem] p-2"
					/>
				))}
			</div>
		</div>
	);
}
