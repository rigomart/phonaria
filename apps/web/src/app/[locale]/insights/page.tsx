import type { Metadata } from "next";
import Link from "next/link";
import { setStaticParamsLocale } from "next-international/server";
import { cmudictStatsData } from "shared-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScopedI18n } from "@/locales/server";
import { InsightsFacts } from "./_components/insights-facts";
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
	const lastUpdated = new Date(cmudictStatsData.meta.generatedAt).toLocaleString(locale, {
		dateStyle: "long",
		timeStyle: "short",
	});

	return (
		<div className="flex flex-1 flex-col bg-background">
			<div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-4">
				{/* Compact header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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

				{/* Bento grid layout */}
				<div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
					{/* Left column: Stats overview */}
					<div className="lg:col-span-4 flex flex-col gap-4">
						{/* Overview stats card */}
						<OverviewCards />

						{/* Insights facts */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-semibold text-muted-foreground">
									Quick Insights
								</CardTitle>
							</CardHeader>
							<CardContent>
								<InsightsFacts />
							</CardContent>
						</Card>

						{/* Syllable histogram */}
						<SyllableHistogram />
					</div>

					{/* Right column: Phoneme chart (takes more space) */}
					<div className="lg:col-span-8">
						<PhonemeFrequencyChart />
					</div>
				</div>
			</div>
		</div>
	);
}
