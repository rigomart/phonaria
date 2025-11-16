import { Badge } from "@/components/ui/badge";
import { getScopedI18n } from "@/locales/server";

export async function IpaChartPreview() {
	const t = await getScopedI18n("overview-page.core-modules-section.feature-cards.ipa-chart.preview");
	const vowelSamples = ["i", "ɪ", "eɪ", "æ"]; // truncated for brevity
	const consonantSamples = ["ʃ", "tʃ", "θ", "ŋ"];

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
				<span>{t("feature-left")}</span>
				<span>{t("feature-right")}</span>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<div className="rounded-xl border border-border/70 bg-background/70 p-3 shadow-xs">
					<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
						{t("vowels-label")}
					</p>
					<div className="mt-2 flex flex-wrap gap-1">
						{vowelSamples.map((symbol) => (
							<Badge key={symbol} variant="secondary" className="rounded-full px-2 py-1 text-xs">
								{symbol}
							</Badge>
						))}
					</div>
				</div>
				<div className="rounded-xl border border-border/70 bg-background/70 p-3 shadow-xs">
					<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
						{t("consonants-label")}
					</p>
					<div className="mt-2 flex flex-wrap gap-1">
						{consonantSamples.map((symbol) => (
							<Badge key={symbol} variant="outline" className="rounded-full px-2 py-1 text-xs">
								{symbol}
							</Badge>
						))}
					</div>
				</div>
			</div>
			<div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-xs text-muted-foreground">
				{t("hint")}
			</div>
		</div>
	);
}
