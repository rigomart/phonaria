import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { cmudictStatsData } from "shared-data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getScopedI18n } from "@/locales/server";
import { OverviewCards } from "./_components/overview-cards";
import { PhonemeFrequencyChart } from "./_components/phoneme-frequency-chart";
import { SyllableHistogram } from "./_components/syllable-histogram";
import { TopPhonemesHighlight } from "./_components/top-phonemes-highlight";

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
	const lastUpdated = new Date(cmudictStatsData.meta.generatedAt).toLocaleString(locale, {
		dateStyle: "long",
		timeStyle: "short",
	});

	return (
		<div className="flex flex-1 flex-col bg-background">
			<div className="container mx-auto p-4 py-6 sm:p-8 max-w-7xl space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h1>
						<p className="text-muted-foreground mt-2 text-sm sm:text-base">{t("description")}</p>
					</div>
					<Badge variant="outline">{t("sections.overview.updated", { date: lastUpdated })}</Badge>
				</div>

				<Separator />

				<div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
					<div className="flex flex-col gap-4 lg:col-span-4">
						<OverviewCards />

						<section>
							<SyllableHistogram />
						</section>
					</div>

					<div className="lg:col-span-8 space-y-4 bg-background-soft rounded-xl shadow-sm p-4">
						<TopPhonemesHighlight />

						<section>
							<PhonemeFrequencyChart />
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
