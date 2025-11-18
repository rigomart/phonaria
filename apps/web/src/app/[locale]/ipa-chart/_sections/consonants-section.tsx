import { useScopedI18n } from "@/locales/client";
import { ConsonantChart } from "../_components/consonant-chart";

export function ConsonantsSection() {
	const t = useScopedI18n("ipa-chart.sections.consonants");
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-medium">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>
			<div className="space-y-3 rounded-lg border bg-background-soft p-1 shadow-sm">
				<div className="text-xs text-muted-foreground p-2 border rounded-lg bg-accent/10">
					{t("diagram.description")}
				</div>
				<ConsonantChart />
			</div>
		</div>
	);
}
