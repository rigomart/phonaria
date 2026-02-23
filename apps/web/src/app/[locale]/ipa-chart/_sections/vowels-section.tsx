import {
	getIpaForPhonemeId,
	getLanguagePhonemeCount,
	getLanguagePhonemeIds,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Pressable } from "@phonaria/ui/components/pressable";
import { useTranslations } from "next-intl";
import { usePhonemeDetailsCopy } from "@/data/phoneme-details/client";
import { cn } from "@/lib/utils";
import { ChartInfoButton } from "../_components/chart-info-button";
import { MonophthongVowelChart, VowelChartLegend } from "../_components/vowel-chart";
import { getStaticVowelEntries } from "../_lib/vowel-chart-data";
import { useIpaChartStore } from "../_store/ipa-chart-store";

type Props = {
	targetAccent: TargetAccent;
	className?: string;
};

export function VowelChartSection({ targetAccent, className }: Props) {
	const t = useTranslations("ipa-chart.sections.vowels");
	const ariaT = useTranslations("ipa-chart.info-button");
	const { phonemeDetailsById } = usePhonemeDetailsCopy();
	const entries = getStaticVowelEntries(phonemeDetailsById, targetAccent);

	const diphthongCount = getLanguagePhonemeCount(targetAccent).diphthongs;

	return (
		<section className={cn("max-w-3xl mx-auto space-y-4", className)}>
			<div className="rounded-xl border bg-background-soft p-2 sm:p-3 shadow-sm space-y-3">
				<div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
					<VowelChartLegend />
					<ChartInfoButton content={t("diagram")} ariaLabel={ariaT("aria-vowels")} />
				</div>
				<div className="-mx-2">
					<MonophthongVowelChart entries={entries} />
				</div>
			</div>

			{diphthongCount > 0 && <DiphthongNote targetAccent={targetAccent} count={diphthongCount} />}
		</section>
	);
}

function DiphthongNote({ targetAccent, count }: { targetAccent: TargetAccent; count: number }) {
	const t = useTranslations("ipa-chart.sections.vowels.diphthong-note");
	const accentT = useTranslations("common.accent");

	const selectPhoneme = useIpaChartStore((s) => s.selectPhoneme);
	const diphthongIds = getLanguagePhonemeIds(targetAccent, "diphthongs");

	const handleClick = (phonemeId: PhonemeSymbolId) => {
		selectPhoneme(phonemeId);
	};

	return (
		<div className="rounded-xl border bg-background-soft p-3 sm:p-4 space-y-3">
			<div className="space-y-1.5">
				<h3 className="text-sm font-semibold">{t("title")}</h3>
				<p className="text-sm text-muted-foreground leading-relaxed">
					{t("description", {
						accent: accentT(targetAccent),
						count: String(count),
					})}
				</p>
			</div>

			<div className="space-y-1.5">
				<p className="text-xs font-medium text-muted-foreground">{t("symbols-label")}</p>
				<div className="flex flex-wrap gap-1.5">
					{diphthongIds.map((id) => (
						<Pressable key={id} size="sm" variant="outline" onClick={() => handleClick(id)}>
							/{getIpaForPhonemeId(id)}/
						</Pressable>
					))}
				</div>
			</div>

			<p className="text-xs text-muted-foreground leading-relaxed">{t("transcription-hint")}</p>
		</div>
	);
}
