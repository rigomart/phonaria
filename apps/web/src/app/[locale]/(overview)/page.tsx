import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { getScopedI18n } from "@/locales/server";
import { FeatureHighlight } from "./_components/feature-highlight";
import { G2PPreview } from "./_components/g2p-preview";
import { IpaChartPreview } from "./_components/ipa-chart-preview";
import { PhonemeDetailsPreview } from "./_components/phoneme-details-preview";
import { ToolSection } from "./_components/tool-section";

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
			<div className="border-b border-border/60 bg-linear-120 from-background-strong to-background">
				<div className="container mx-auto px-4 py-8 lg:px-6">
					<div className="max-w-2xl">
						<h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t("title")}</h1>
						<p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
							{t("description")}
						</p>
					</div>
				</div>
			</div>

			<ToolSection
				title={t("tools.g2p.title")}
				features={[
					t("tools.g2p.features.transcription"),
					t("tools.g2p.features.phonemes"),
					t("tools.g2p.features.dictionary"),
				]}
				linkHref="/"
				linkText={t("tools.g2p.link-text")}
				preview={<G2PPreview />}
			/>

			<ToolSection
				title={t("tools.ipa-chart.title")}
				features={[
					t("tools.ipa-chart.features.chart"),
					t("tools.ipa-chart.features.audio"),
					t("tools.ipa-chart.features.details"),
				]}
				linkHref="/ipa-chart"
				linkText={t("tools.ipa-chart.link-text")}
				preview={<IpaChartPreview />}
				isReversed
			/>

			<FeatureHighlight
				title={t("tools.phoneme-details.title")}
				description={t("tools.phoneme-details.description")}
				badge={t("tools.phoneme-details.badge")}
				preview={<PhonemeDetailsPreview />}
			/>
		</div>
	);
}
