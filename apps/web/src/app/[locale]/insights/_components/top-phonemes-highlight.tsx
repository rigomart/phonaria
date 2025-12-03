"use client";

import { cmudictStatsData } from "shared-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useScopedI18n } from "@/locales/client";

// Known important phonemes to highlight
const HIGHLIGHT_PHONEMES = [
	{
		arpa: "AH0",
		ipa: "ə",
		translationKey: "schwa",
	},
	{
		arpa: "R",
		ipa: "ɹ",
		translationKey: "post-alveolar-approximant",
	},
	{
		arpa: "T",
		ipa: "t",
		translationKey: "voiceless-alveolar-plosive",
	},
] as const;

export function TopPhonemesHighlight() {
	const stats = cmudictStatsData;
	const t = useScopedI18n("stats-page.sections.top-phonemes");

	// Find data for our highlights
	const highlights = HIGHLIGHT_PHONEMES.map((highlight) => {
		const data = stats.phonemes.find((p) => p.arpa === highlight.arpa);
		return {
			...highlight,
			data,
		};
	}).filter((h) => h.data);

	return (
		<section className="grid gap-4 md:grid-cols-3">
			{highlights.map((item) => (
				<Card key={item.arpa} className={cn("border-l-3 border-l-accent bg-background-soft")}>
					<CardHeader className="pb-0">
						<div className="flex justify-between items-center">
							<CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								{t(`highlights.${item.translationKey}.name`)}
							</CardTitle>
							<span className="text-lg border px-2 py-0.5 rounded-md whitespace-nowrap">
								/{item.ipa}/
							</span>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-baseline gap-2">
							<div className="text-2xl font-bold">
								{item.data?.wordCoverage.percentage.toFixed(1)}%
							</div>
							<p className="text-xs text-muted-foreground">{t("coverage-label")}</p>
						</div>
					</CardContent>
				</Card>
			))}
		</section>
	);
}
