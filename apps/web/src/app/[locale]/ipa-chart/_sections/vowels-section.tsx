import { cn } from "@/lib/utils";
import { useScopedI18n } from "@/locales/client";
import { ChartInfoButton } from "../_components/chart-info-button";
import { DiphthongVowelChart } from "../_components/diphthong-chart";
import { MonophthongVowelChart, VowelChartLegend } from "../_components/vowel-chart";
import type {
	DiphthongVowelChartEntry,
	StaticVowelChartEntry,
	VowelChartEntry,
} from "../_lib/vowel-chart-data";
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

const ariaLabelsByVariant: Record<Variant, string> = {
	monophthongs: "How to read the monophthong vowel chart",
	diphthongs: "How to read the diphthong vowel chart",
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
				<div className="relative rounded-lg border bg-background-soft p-1 shadow-sm">
					<ChartInfoButton
						content={t(`${variant}.diagram`)}
						ariaLabel={ariaLabelsByVariant[variant]}
					/>
					{variant === "monophthongs" ? (
						<MonophthongVowelChart entries={entries as StaticVowelChartEntry[]} />
					) : (
						<DiphthongVowelChart entries={entries as DiphthongVowelChartEntry[]} />
					)}
					<div className="p-1">
						<VowelChartLegend />
					</div>
				</div>
			</div>
		</section>
	);
}
