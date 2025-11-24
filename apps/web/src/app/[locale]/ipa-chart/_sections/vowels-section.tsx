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

export function VowelChartSection({ variant, className }: Props) {
	const t = useScopedI18n("ipa-chart.sections.vowels");
	const ariaT = useScopedI18n("ipa-chart.info-button");
	const entries = entriesByVariant[variant];

	const ariaLabel =
		variant === "monophthongs" ? ariaT("aria-monophthongs") : ariaT("aria-diphthongs");

	return (
		<section className={cn("max-w-3xl mx-auto", className)}>
			<div className="rounded-xl bg-background-soft p-2 sm:p-3 shadow-sm space-y-3">
				<div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
					<VowelChartLegend />
					<ChartInfoButton content={t(`${variant}.diagram`)} ariaLabel={ariaLabel} />
				</div>
				<div className="-mx-2">
					{variant === "monophthongs" ? (
						<MonophthongVowelChart entries={entries as StaticVowelChartEntry[]} />
					) : (
						<DiphthongVowelChart entries={entries as DiphthongVowelChartEntry[]} />
					)}
				</div>
			</div>
		</section>
	);
}
