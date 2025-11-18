import { cn } from "@/lib/utils";
import { useScopedI18n } from "@/locales/client";
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
					<div className="text-xs text-muted-foreground p-2 border rounded-lg bg-accent/10">
						{t(`${variant}.diagram`)}
					</div>
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
