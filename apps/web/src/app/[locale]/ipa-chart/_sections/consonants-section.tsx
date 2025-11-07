import { consonants } from "@/lib/phoneme-mocks";
import { useScopedI18n } from "@/locales/client";
import { PhonemeCategories } from "../_components/phoneme-categories";

export function ConsonantsSection() {
	const t = useScopedI18n("ipa-chart.sections.consonants");
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
