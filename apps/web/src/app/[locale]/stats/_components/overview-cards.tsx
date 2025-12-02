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
	},
	{
		key: "variants",
		translationKey: "variants",
		icon: Volume2,
		value: (stats: typeof cmudictStatsData) => stats.overview.variants,
	},
	{
		key: "multiPron",
		translationKey: "multiple-pronunciations",
		icon: Layers,
		value: (stats: typeof cmudictStatsData) => stats.meta.multiplePronunciationCount,
	},
] as const;

export function OverviewCards() {
	const stats = cmudictStatsData;
	const t = useScopedI18n("stats-page.sections.overview.cards");

	return (
		<section className="w-full bg-background-soft rounded-xl shadow-sm divide-y">
			{CARD_CONFIG.map((card) => {
				const Icon = card.icon;
				const title = t(`${card.translationKey}.title`);
				const value = card.value(stats).toLocaleString();
				const description = t(`${card.translationKey}.description`);

				return (
					<div key={card.key} className="p-4 sm:p-6 flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-medium leading-none tracking-tight text-muted-foreground">
								{title}
							</h3>
							<Icon className="size-4 text-muted-foreground" />
						</div>
						<div className="flex flex-col gap-1">
							<div className="text-2xl font-bold">{value}</div>
							<p className="text-xs text-muted-foreground">{description}</p>
						</div>
					</div>
				);
			})}
		</section>
	);
}
