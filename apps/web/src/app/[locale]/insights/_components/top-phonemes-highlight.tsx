"use client";

import { Info } from "lucide-react";
import { cmudictStatsData, getIpaForPhonemeId } from "shared-data";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useScopedI18n } from "@/locales/client";

const TOP_PHONEMES_COUNT = 3;

export function TopPhonemesHighlight() {
	const t = useScopedI18n("stats-page.sections.top-phonemes");

	const topPhonemes = [...cmudictStatsData.phonemes]
		.sort((a, b) => b.wordCoverage.percentage - a.wordCoverage.percentage)
		.slice(0, TOP_PHONEMES_COUNT)
		.map((phoneme) => ({
			phonemeId: phoneme.phonemeId,
			ipa: getIpaForPhonemeId(phoneme.phonemeId) ?? phoneme.phonemeId,
			coverage: phoneme.wordCoverage.count,
			percentage: phoneme.wordCoverage.percentage,
		}));

	const formatPercent = (value: number) =>
		value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

	return (
		<div className="mb-4 space-y-2">
			<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
				<span>{t("title", { count: TOP_PHONEMES_COUNT })}</span>
				<Tooltip>
					<TooltipTrigger className="inline-flex items-center justify-center rounded-full border border-border bg-background/60 p-1 text-[10px] leading-none">
						<Info className="h-3 w-3" />
					</TooltipTrigger>
					<TooltipContent side="top" sideOffset={6} className="max-w-[240px] text-xs">
						{t("info")}
					</TooltipContent>
				</Tooltip>
			</div>

			<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{topPhonemes.map((item, index) => (
					<div
						key={item.phonemeId}
						className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3"
					>
						<div className="flex items-center gap-2">
							<span className="inline-flex size-6 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
								{index + 1}
							</span>
							<span className="text-xs font-medium text-muted-foreground truncate">
								{item.phonemeId}
							</span>
							<Badge variant="secondary" className="text-sm px-2 py-1 leading-none">
								/{item.ipa}/
							</Badge>
						</div>

						<div className="flex items-baseline gap-2">
							<div className="text-xl font-semibold tracking-tight">
								{formatPercent(item.percentage)}%
							</div>
							<p className="text-xs text-muted-foreground">
								({t("words-label", { count: item.coverage.toLocaleString() })})
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
