import { getLanguagePhonemeCount } from "@phonaria/phonetics-data";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getIpaChartTargetLanguage } from "../_lib/target-language";

type Props = {
	locale: Locale;
};

export async function IntroSection({ locale }: Props) {
	const t = await getTranslations({ locale, namespace: "ipa-chart.intro" });
	const targetLanguage = getIpaChartTargetLanguage(locale);
	const counts = getLanguagePhonemeCount(targetLanguage);

	return (
		<section className="border-b bg-muted/30">
			<div className="container mx-auto px-4 py-4">
				<h1 className="text-base font-semibold tracking-tight">{t("title")}</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{t("description", {
						consonantCount: counts.consonants,
						vowelCount: counts.vowels,
					})}
				</p>
			</div>
		</section>
	);
}
