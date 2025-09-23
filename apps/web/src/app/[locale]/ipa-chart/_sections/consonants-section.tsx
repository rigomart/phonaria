import { useTranslations } from "next-intl";
import { consonants } from "shared-data";
import { PhonemeCategories } from "../_components/phoneme-categories";

export function ConsonantsSection() {
	const t = useTranslations("IpaChart.Sections.consonants");
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-medium">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>
			<PhonemeCategories phonemes={consonants} type="consonant" />
		</div>
	);
}
