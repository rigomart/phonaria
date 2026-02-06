import type { TargetLanguage } from "@phonaria/phonetics-data";
import { useTranslations } from "next-intl";
import { usePhonemeDetailsCopy } from "@/data/phoneme-details/client";
import { cn } from "@/lib/utils";
import { ChartInfoButton } from "../_components/chart-info-button";
import { DiphthongVowelChart } from "../_components/diphthong-chart";
import { MonophthongVowelChart, VowelChartLegend } from "../_components/vowel-chart";
import type {
	DiphthongVowelChartEntry,
	StaticVowelChartEntry,
	VowelChartEntry,
} from "../_lib/vowel-chart-data";
import { getDiphthongVowelEntries, getStaticVowelEntries } from "../_lib/vowel-chart-data";

type Variant = "monophthongs" | "diphthongs";

type Props = {
	variant: Variant;
	targetLanguage: TargetLanguage;
	className?: string;
};

export function VowelChartSection({ variant, targetLanguage, className }: Props) {
	const t = useTranslations("ipa-chart.sections.vowels");
	const ariaT = useTranslations("ipa-chart.info-button");
	const { phonemeDetailsById } = usePhonemeDetailsCopy();
	const entries: VowelChartEntry[] =
		variant === "monophthongs"
			? getStaticVowelEntries(phonemeDetailsById, targetLanguage)
			: getDiphthongVowelEntries(phonemeDetailsById, targetLanguage);

	const ariaLabel =
		variant === "monophthongs" ? ariaT("aria-monophthongs") : ariaT("aria-diphthongs");

	return (
		<section className={cn("max-w-3xl mx-auto", className)}>
			<div className="rounded-xl border bg-background-soft p-2 sm:p-3 shadow-sm space-y-3">
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
