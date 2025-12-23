import { BarChart3, BookOpen, Mic } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLanguageAlternates, getLocalePath } from "@/lib/seo";
import { G2PPreviewStatic } from "./_components/g2p-preview-static";
import { HeroSection } from "./_components/hero-section";
import { IpaChartPreviewStatic } from "./_components/ipa-chart-preview-static";
import { StatsPreviewStatic } from "./_components/stats-preview-static";
import { ToolCard } from "./_components/tool-card";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const locale = (await params).locale as Locale;
	const t = await getTranslations({ locale, namespace: "overview-page" });

	return {
		title: t("meta.title"),
		description: t("meta.description"),
		alternates: {
			canonical: getLocalePath(locale, ""),
			languages: getLanguageAlternates(""),
		},
	};
}

export default async function OverviewPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;

	setRequestLocale(locale as Locale);
	const t = await getTranslations("overview-page");

	return (
		<div className="flex flex-1 flex-col bg-background">
			<HeroSection />

			<section className="container mx-auto p-3 py-6 sm:p-4 lg:p-6">
				<div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
					<ToolCard
						title={t("launchpad.g2p.title")}
						description={t("launchpad.g2p.description")}
						href="/transcription"
						icon={<Mic className="size-5" />}
						preview={<G2PPreviewStatic />}
					/>

					<ToolCard
						title={t("launchpad.ipa-chart.title")}
						description={t("launchpad.ipa-chart.description")}
						href="/ipa-chart"
						icon={<BookOpen className="size-5" />}
						preview={<IpaChartPreviewStatic />}
					/>

					<ToolCard
						title={t("launchpad.stats.title")}
						description={t("launchpad.stats.description")}
						href="/insights"
						icon={<BarChart3 className="size-5" />}
						preview={<StatsPreviewStatic />}
					/>
				</div>
			</section>
		</div>
	);
}
