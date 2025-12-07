"use client";

import { BookOpen, Layers, Volume2 } from "lucide-react";
import { cmudictStatsData } from "shared-data";
import { useScopedI18n } from "@/locales/client";

const CARD_CONFIG = [
	{
		key: "words",
		translationKey: "words",
		icon: BookOpen,
		value: (stats: typeof cmudictStatsData) => stats.overview.words,
		color: "bg-blue-500/10 text-blue-600",
	},
	{
		key: "variants",
		translationKey: "variants",
		icon: Volume2,
		value: (stats: typeof cmudictStatsData) => stats.overview.variants,
		color: "bg-emerald-500/10 text-emerald-600",
	},
	{
		key: "multiPron",
		translationKey: "multiple-pronunciations",
		icon: Layers,
		value: (stats: typeof cmudictStatsData) => stats.meta.multiplePronunciationCount,
		color: "bg-amber-500/10 text-amber-600",
	},
] as const;

export function OverviewCards() {
	const stats = cmudictStatsData;
	const t = useScopedI18n("stats-page.sections.overview.cards");

	return (
		<div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-1">
			{CARD_CONFIG.map((card) => {
				const Icon = card.icon;
				const title = t(`${card.translationKey}.title`);
				const value = card.value(stats).toLocaleString();

				return (
					<div
						key={card.key}
						className="flex items-center gap-3 p-3 rounded-xl border bg-background-soft shadow-sm"
					>
						<div className={`p-2.5 rounded-lg ${card.color}`}>
							<Icon className="size-4" />
						</div>
						<div className="flex flex-col min-w-0">
							<span className="text-xs text-muted-foreground truncate">{title}</span>
							<span className="text-lg font-bold leading-tight">{value}</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
