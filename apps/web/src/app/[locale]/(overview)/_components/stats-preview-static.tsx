"use client";

import { cmudictStatsData, getIpaForPhonemeId } from "shared-data";
import { useScopedI18n } from "@/locales/client";

const PREVIEW_STATS = [
	{
		key: "words",
		translationKey: "words",
		value: cmudictStatsData.overview.words,
	},
	{
		key: "variants",
		translationKey: "variants",
		value: cmudictStatsData.overview.variants,
	},
] as const;

const TOP_PHONEMES = cmudictStatsData.phonemes.slice(0, 3);
const MAX_COVERAGE = TOP_PHONEMES.reduce(
	(max, phoneme) => Math.max(max, phoneme.wordCoverage.percentage),
	0,
);

export function StatsPreviewStatic() {
	const tOverview = useScopedI18n("stats-page.sections.overview.cards");
	const tSections = useScopedI18n("stats-page.sections");
	const tTopPhonemes = useScopedI18n("stats-page.sections.top-phonemes");

	return (
		<div className="w-full h-full bg-background rounded-md border border-border/50 shadow-sm p-3 sm:p-4 flex flex-col gap-3 min-h-0">
			<div className="flex gap-2">
				{PREVIEW_STATS.map((stat) => (
					<div
						key={stat.key}
						className="rounded-lg bg-muted/20 border border-border/40 p-2 flex flex-col gap-1 flex-1"
					>
						<div className="text-xs text-muted-foreground font-medium">
							{tOverview(`${stat.translationKey}.title`)}
						</div>
						<div className="text-lg font-semibold leading-tight">{stat.value.toLocaleString()}</div>
					</div>
				))}
			</div>

			<div className="flex-1 rounded-lg border border-border/40 bg-background-soft p-3 flex flex-col gap-3 min-h-0">
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<span>{tSections("phonemes.title")}</span>
					<span>{tTopPhonemes("coverage-label")}</span>
				</div>

				<div className="space-y-2 flex-1">
					{TOP_PHONEMES.map((phoneme) => {
						const barWidth = MAX_COVERAGE
							? (phoneme.wordCoverage.percentage / MAX_COVERAGE) * 100
							: 0;
						const phonemeIpa = getIpaForPhonemeId(phoneme.phonemeId) ?? phoneme.phonemeId;

						return (
							<div key={phoneme.phonemeId} className="space-y-1.5">
								<div className="flex items-center justify-between text-xs">
									<div className="flex items-center gap-2 min-w-0">
										<span className="px-2 py-1 rounded-md border border-border bg-muted text-sm font-semibold leading-none">
											{phonemeIpa}
										</span>
										<span className="text-xs text-muted-foreground">{phoneme.phonemeId}</span>
									</div>
									<span className="text-xs text-muted-foreground">
										{phoneme.wordCoverage.percentage.toFixed(1)}%
									</span>
								</div>
								<div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
									<div className="h-full bg-primary/70" style={{ width: `${barWidth}%` }} />
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
