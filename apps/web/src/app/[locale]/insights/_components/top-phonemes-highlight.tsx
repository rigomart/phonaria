"use client";

import { cmudictStatsData, getIpaForPhonemeId } from "shared-data";
import { Badge } from "@/components/ui/badge";
import { useScopedI18n } from "@/locales/client";

// Known important phonemes to highlight
const HIGHLIGHT_PHONEMES = [
	{
		phonemeId: "mid-central-unrounded",
		translationKey: "schwa",
	},
	{
		phonemeId: "voiced-postalveolar-approximant",
		translationKey: "post-alveolar-approximant",
	},
	{
		phonemeId: "voiceless-alveolar-plosive",
		translationKey: "voiceless-alveolar-plosive",
	},
] as const;

export function TopPhonemesHighlight() {
	const stats = cmudictStatsData;
	const t = useScopedI18n("stats-page.sections.top-phonemes");

	// Find data for our highlights
	const highlights = HIGHLIGHT_PHONEMES.map((highlight) => {
		const data = stats.phonemes.find((p) => p.phonemeId === highlight.phonemeId);
		const ipa = getIpaForPhonemeId(highlight.phonemeId) ?? highlight.phonemeId;
		return {
			...highlight,
			data,
			ipa,
		};
	}).filter((h) => h.data);

	return (
		<div className="grid gap-4 sm:grid-cols-3 mb-4">
			{highlights.map((item) => (
				<div
					key={item.phonemeId}
					className="flex flex-col gap-2 p-4 rounded-lg shadow-md bg-secondary"
				>
					<div className="flex items-center justify-between gap-2">
						<span
							className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate"
							title={t(`highlights.${item.translationKey}.name`)}
						>
							{t(`highlights.${item.translationKey}.name`)}
						</span>
						<Badge variant="secondary" className="text-sm">
							/{item.ipa}/
						</Badge>
					</div>

					<div>
						<div className="text-2xl font-bold tracking-tight">
							{item.data?.wordCoverage.percentage.toFixed(1)}%
						</div>
						<p className="text-xs text-muted-foreground">{t("coverage-label")}</p>
					</div>
				</div>
			))}
		</div>
	);
}
