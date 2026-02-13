import { EnglishCmudictStatsData } from "@phonaria/phonetics-data/data/en/cmudict-stats";
import { Badge } from "@phonaria/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@phonaria/ui/components/card";
import type { Metadata } from "next";
import { type Locale, useFormatter, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { TargetAccentSelector } from "@/components/target-accent-selector";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getLanguageAlternates, getLocalePath } from "@/lib/seo";
import { InsightsFacts } from "./_components/insights-facts";
import { OverviewCards } from "./_components/overview-cards";
import { PhonemeFrequencyChart } from "./_components/phoneme-frequency-chart";
import { SyllableHistogram } from "./_components/syllable-histogram";

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const locale = (await params).locale as Locale;
	const t = await getTranslations({ locale, namespace: "stats-page" });

	return {
		title: t("meta.title"),
		description: t("meta.description"),
		alternates: {
			canonical: getLocalePath(locale, "/insights"),
			languages: getLanguageAlternates("/insights"),
		},
	};
}

export default function InsightsPage({ params }: PageProps<"/[locale]/insights">) {
	const { locale } = use(params);

	setRequestLocale(locale as Locale);

	const t = useTranslations("stats-page");
	const format = useFormatter();

	const lastUpdated = format.dateTime(EnglishCmudictStatsData.meta.generatedAt, "long-date-time");

	return (
		<div className="flex flex-1 flex-col bg-background">
			<div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-4">
				<div className="flex flex-col justify-between gap-2">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t("title")}</h1>
							<Badge variant="outline" className="hidden sm:inline-flex">
								{t("sections.overview.updated", { date: lastUpdated })}
							</Badge>
						</div>
						<TargetAccentSelector supportedAccents={["en-us"]} />
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
