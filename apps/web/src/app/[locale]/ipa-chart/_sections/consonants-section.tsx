import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useScopedI18n } from "@/locales/client";
import { ChartInfoButton } from "../_components/chart-info-button";
import { ConsonantChart } from "../_components/consonant-chart";

export function ConsonantsSection() {
	const t = useScopedI18n("ipa-chart.sections.consonants");
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-medium">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>
			<div className="relative space-y-3 rounded-lg border bg-background-soft  shadow-sm">
				<ChartInfoButton content={t("diagram")} ariaLabel="How to read the consonant chart" />
				<ScrollArea className="p-2 sm:p-4">
					<ConsonantChart />
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</div>
		</div>
	);
}
