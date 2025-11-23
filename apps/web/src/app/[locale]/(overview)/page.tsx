import { BookOpen, Mic } from "lucide-react";
import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { getScopedI18n } from "@/locales/server";
import { G2PPreviewStatic } from "./_components/g2p-preview-static";
import { HeroSection } from "./_components/hero-section";
import { IpaChartPreviewStatic } from "./_components/ipa-chart-preview-static";
import { ToolCard } from "./_components/tool-card";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getScopedI18n("overview-page.meta");
	return {
		title: t("title"),
		description: t("description"),
	};
}

export default async function OverviewPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	setStaticParamsLocale(locale);

	const t = await getScopedI18n("overview-page");

	return (
		<div className="flex flex-1 flex-col bg-background">
			<HeroSection />

			{/* LAUNCHPAD GRID */}
			<section className="py-8 lg:py-12 bg-muted/10">
				<div className="container mx-auto px-4 lg:px-6">
					<div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
						{/* G2P CARD */}
						<ToolCard
							title={t("launchpad.g2p.title")}
							description={t("launchpad.g2p.description")}
							href="/"
							icon={<Mic className="size-5" />}
							preview={<G2PPreviewStatic />}
						/>

						{/* IPA CHART CARD */}
						<ToolCard
							title={t("launchpad.ipa-chart.title")}
							description={t("launchpad.ipa-chart.description")}
							href="/ipa-chart"
							icon={<BookOpen className="size-5" />}
							preview={<IpaChartPreviewStatic />}
						/>
					</div>
				</div>
			</section>
		</div>
	);
}
