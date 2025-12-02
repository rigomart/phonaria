import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { getScopedI18n } from "@/locales/server";
import { OverviewCards } from "./_components/overview-cards";
import { PhonemeFrequencyChart } from "./_components/phoneme-frequency-chart";
import { SyllableHistogram } from "./_components/syllable-histogram";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getScopedI18n("stats-page.meta");
	return {
		title: t("title"),
		description: t("description"),
	};
}

export default async function StatsPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	setStaticParamsLocale(locale);

	const t = await getScopedI18n("stats-page");

	return (
		<div className="flex flex-1 flex-col bg-background overflow-y-auto">
			<div className="container mx-auto p-4 py-4 sm:p-6 max-w-6xl">
				<h1 className="text-3xl font-bold mb-1">{t("title")}</h1>
				<p className="text-muted-foreground mb-4">{t("description")}</p>

				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-6">
						<OverviewCards />
						<SyllableHistogram />
					</div>

					<PhonemeFrequencyChart />
				</div>
			</div>
		</div>
	);
}
