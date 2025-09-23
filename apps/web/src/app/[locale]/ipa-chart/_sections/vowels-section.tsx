"use client";

import { useTranslations } from "next-intl";
import { vowels } from "shared-data";
import { VowelChart } from "../_components/vowel-chart";
import { SupplementalVowelGroup } from "../_components/vowel-supplement";

export function VowelsSection() {
	const t = useTranslations("IpaChart.Sections.vowels");
	const rhoticVowels = vowels.filter((phoneme) => phoneme.type === "rhotic");
	const diphthongs = vowels.filter((phoneme) => phoneme.type === "diphthong");
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-medium">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>
			<VowelChart vowels={vowels} />
			<div className="space-y-4">
				{rhoticVowels.length > 0 && (
					<SupplementalVowelGroup title="Rhotic vowels" phonemes={rhoticVowels} />
				)}
				{diphthongs.length > 0 && (
					<SupplementalVowelGroup title="Diphthongs" phonemes={diphthongs} />
				)}
			</div>
		</div>
	);
}
