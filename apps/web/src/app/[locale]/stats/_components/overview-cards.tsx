"use client";

import { BookOpen, Layers, Volume2 } from "lucide-react";
import { cmudictStatsData } from "shared-data";

const CARD_CONFIG = [
	{
		key: "words",
		icon: BookOpen,
		title: "Total Words",
		value: (stats: typeof cmudictStatsData) => stats.overview.words,
		description: "Entries in the dictionary",
	},
	{
		key: "variants",
		icon: Volume2,
		title: "Total Pronunciations",
		value: (stats: typeof cmudictStatsData) => stats.overview.variants,
		description: "Phonetic transcriptions",
	},
	{
		key: "multiPron",
		icon: Layers,
		title: "Multiple Pronunciations",
		value: (stats: typeof cmudictStatsData) => stats.meta.multiplePronunciationCount,
		description: "Words with multiple variants",
	},
];

export function OverviewCards() {
	const stats = cmudictStatsData;

	return (
		<section className="w-full bg-background-soft rounded-xl shadow-sm divide-y">
			{CARD_CONFIG.map((card) => {
				const Icon = card.icon;
				const title = card.title;
				const value = card.value(stats).toLocaleString();

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
							<p className="text-xs text-muted-foreground">{card.description}</p>
						</div>
					</div>
				);
			})}
		</section>
	);
}
