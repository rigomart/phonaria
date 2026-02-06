"use client";

import { EnglishCmudictStatsData } from "@phonaria/phonetics-data/data/en/cmudict-stats";
import { BookOpen, Layers, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";

const CARD_CONFIG = [
	{
		key: "words",
		translationKey: "words",
		icon: BookOpen,
		value: (stats: typeof EnglishCmudictStatsData) => stats.overview.words,
	},
	{
		key: "variants",
		translationKey: "variants",
		icon: Volume2,
		value: (stats: typeof EnglishCmudictStatsData) => stats.overview.variants,
	},
	{
		key: "multiPron",
		translationKey: "multiple-pronunciations",
		icon: Layers,
		value: (stats: typeof EnglishCmudictStatsData) => stats.meta.multiplePronunciationCount,
	},
] as const;

export function OverviewCards() {
	const stats = EnglishCmudictStatsData;
	const t = useTranslations("stats-page.sections.overview.cards");

	return (
		<div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-1">
			{CARD_CONFIG.map((card) => {
				const Icon = card.icon;
				const title = t(`${card.translationKey}.title`);
				const description = t(`${card.translationKey}.description`);
				const value = card.value(stats).toLocaleString();

				return (
					<div
						key={card.key}
						className="flex items-center gap-3 p-3 rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10"
					>
						<div className="p-2.5 rounded-lg border bg-background-strong text-foreground">
							<Icon className="size-4" aria-hidden="true" />
						</div>
						<div className="flex flex-col min-w-0">
							<span className="text-sm font-medium truncate">{title}</span>
							<div className="flex items-baseline gap-2">
								<span className="text-lg font-bold leading-tight tabular-nums">{value}</span>
							</div>
							<span className="text-xs text-muted-foreground leading-snug">{description}</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
