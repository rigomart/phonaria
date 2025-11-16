import { useScopedI18n } from "@/locales/client";
import { VowelChart, VowelChartLegend } from "../_components/vowel-chart";
import type { VowelChartEntry } from "../_lib/vowel-chart-data";
import { diphthongVowelEntries, staticVowelEntries } from "../_lib/vowel-chart-data";

export function VowelsSection() {
	const t = useScopedI18n("ipa-chart.sections.vowels");

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-xl font-medium">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>

			<div className="space-y-10">
				<VowelChartPanel
					title={t("monophthongs.title")}
					description={t("monophthongs.description")}
					entries={staticVowelEntries}
				/>
				<VowelChartPanel
					title={t("diphthongs.title")}
					description={t("diphthongs.description")}
					entries={diphthongVowelEntries}
				/>
			</div>
		</div>
	);
}

type PanelProps = {
	title: string;
	description: string;
	entries: VowelChartEntry[];
};

function VowelChartPanel({ title, description, entries }: PanelProps) {
	return (
		<section className="space-y-4">
			<div>
				<h3 className="text-lg font-semibold">{title}</h3>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<div className="space-y-3">
				<div className="rounded-2xl border bg-card/60 p-4 shadow-sm">
					<VowelChart entries={entries} />
				</div>
				<VowelChartLegend />
			</div>
		</section>
	);
}
