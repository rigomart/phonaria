import { cn } from "@/lib/utils";
import { useScopedI18n } from "@/locales/client";
import { VowelChart, VowelChartLegend } from "../_components/vowel-chart";
import type { VowelChartEntry } from "../_lib/vowel-chart-data";
import { diphthongVowelEntries, staticVowelEntries } from "../_lib/vowel-chart-data";

type Variant = "monophthongs" | "diphthongs";

type Props = {
	variant: Variant;
	className?: string;
};

const entriesByVariant: Record<Variant, VowelChartEntry[]> = {
	monophthongs: staticVowelEntries,
	diphthongs: diphthongVowelEntries,
};

export function VowelChartSection({ variant, className }: Props) {
	const t = useScopedI18n("ipa-chart.sections.vowels");
	const entries = entriesByVariant[variant];

	return (
		<section className={cn("space-y-4 max-w-3xl mx-auto", className)}>
			<div>
				<h2 className="text-lg font-semibold">{t(`${variant}.title`)}</h2>
				<p className="text-sm text-muted-foreground">{t(`${variant}.description`)}</p>
			</div>
			<div className="space-y-3">
				<div className="rounded-lg border bg-background-soft p-1 shadow-sm">
					<VowelChart entries={entries} />
				</div>
				<VowelChartLegend />
			</div>
		</section>
	);
}
