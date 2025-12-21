import { ScrollArea, ScrollBar } from "@phonaria/ui/components/scroll-area";
import { useTranslations } from "next-intl";
import { ChartInfoButton } from "../_components/chart-info-button";
import { ConsonantChart } from "../_components/consonant-chart";

export function ConsonantsSection() {
	const t = useTranslations("ipa-chart.sections.consonants");
	const ariaT = useTranslations("ipa-chart.info-button");
	return (
		<div className="space-y-3 rounded-xl border bg-background-soft shadow-sm p-2 sm:p-3">
			<div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
				<div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground">
					<div className="flex items-center gap-1 sm:gap-1.5">
						<span className="size-2.5 sm:size-3 rounded border border-border bg-background opacity-80" />
						<span>{t("legend.voiceless")}</span>
					</div>
					<div className="flex items-center gap-1 sm:gap-1.5">
						<span className="size-2.5 sm:size-3 rounded border border-primary/20 bg-primary/15 font-semibold" />
						<span>{t("legend.voiced")}</span>
					</div>
				</div>
				<ChartInfoButton content={t("diagram")} ariaLabel={ariaT("aria-consonants")} />
			</div>
			<ScrollArea className="-mx-1">
				<div className="px-1">
					<ConsonantChart />
				</div>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}
