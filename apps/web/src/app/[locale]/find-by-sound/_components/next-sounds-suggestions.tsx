"use client";

import { Button } from "@phonaria/ui/components/button";
import { useTranslations } from "next-intl";

interface NextSoundsSuggestionsProps {
	suggestions: Array<{ arpabet: string; ipa: string; count: number }>;
	onSelect: (arpabet: string) => void;
	disabled?: boolean;
}

export function NextSoundsSuggestions({
	suggestions,
	onSelect,
	disabled,
}: NextSoundsSuggestionsProps) {
	const t = useTranslations("find-by-sound-page.suggestions");

	// Show top suggestions, sorted by count (already sorted from API)
	const topSuggestions = suggestions.slice(0, 12);

	return (
		<div className="rounded-lg border bg-background-soft p-3">
			<div className="text-xs font-medium text-muted-foreground mb-2">{t("title")}</div>
			<div className="flex flex-wrap gap-1.5">
				{topSuggestions.map((suggestion) => (
					<Button
						key={suggestion.arpabet}
						variant="outline"
						size="xs"
						className="gap-2 bg-background"
						onClick={() => onSelect(suggestion.arpabet)}
						disabled={disabled}
					>
						<span className="font-medium">{suggestion.ipa}</span>
						<span className="text-muted-foreground text-xs tabular-nums">{suggestion.count}</span>
					</Button>
				))}
			</div>
		</div>
	);
}
