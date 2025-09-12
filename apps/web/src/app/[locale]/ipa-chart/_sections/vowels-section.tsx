"use client";

import { useTranslations } from "next-intl";
import { vowels } from "shared-data";
import { PhonemeCategories } from "../_components/phoneme-categories";

export function VowelsSection() {
	const t = useTranslations("IpaChart.Sections.vowels");
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-medium">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>
			<PhonemeCategories phonemes={vowels} type="vowel" defaultOpenCategories={true} />
		</div>
	);
}
