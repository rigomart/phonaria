import { cmudictStatsData } from "@phonaria/phonetics-data";
import { Badge } from "@phonaria/ui/components/badge";
import { type Locale, useFormatter, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { InsightsFacts } from "./_components/insights-facts";
import { OverviewCards } from "./_components/overview-cards";
import { PhonemeFrequencyChart } from "./_components/phoneme-frequency-chart";
import { SyllableHistogram } from "./_components/syllable-histogram";

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default function InsightsPage({ params }: PageProps<"/[locale]/insights">) {
	const { locale } = use(params);

	setRequestLocale(locale as Locale);

	const t = useTranslations("stats-page");
	const format = useFormatter();

	const lastUpdated = format.dateTime(cmudictStatsData.meta.generatedAt, "long-date-time");

	return (
		<div className="flex flex-1 flex-col bg-background">
			<div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-4">
				<div className="flex flex-col justify-between gap-2">
					<div className="flex items-center gap-3">
						<h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t("title")}</h1>
						<Badge variant="outline" className="hidden sm:inline-flex">
							{t("sections.overview.updated", { date: lastUpdated })}
						</Badge>
					</div>
					<p className="text-xs text-muted-foreground">
						{t("source-note.prefix")}{" "}
						<Link href="/credits" className="underline underline-offset-4 hover:text-foreground">
							{t("source-note.link")}
						</Link>{" "}
						{t("source-note.suffix")}
					</p>
				</div>

				<div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
					<div className="lg:col-span-4 flex flex-col gap-4">
						<OverviewCards />

						<Card>
							<CardHeader>
								<CardTitle>{t("sections.facts.title")}</CardTitle>
							</CardHeader>
							<CardContent>
								<InsightsFacts />
							</CardContent>
						</Card>

						<SyllableHistogram />
					</div>

					<div className="lg:col-span-8">
						<PhonemeFrequencyChart />
					</div>
				</div>
			</div>
		</div>
	);
}
