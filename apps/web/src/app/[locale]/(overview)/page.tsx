import { BookOpen, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { getScopedI18n } from "@/locales/server";
import { HeroSection } from "./_components/hero-section";
import { IpaChartPreview } from "./_components/ipa-chart-preview";
import { ToolCard } from "./_components/tool-card";
import { TranscriptionPreview } from "./_components/transcription-preview";

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

	const t = await getScopedI18n("overview-page.tools");

	return (
		<div className="flex flex-1 flex-col bg-background">
			{/* Hero Section with Interactive Demo */}
			<HeroSection />

			{/* Tool Cards */}
			<section className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
				<div className="grid gap-6 lg:grid-cols-2 lg:gap-8 max-w-6xl mx-auto">
					<ToolCard
						title={t("transcription.title")}
						description={t("transcription.description")}
						bullets={[
							t("transcription.bullets.0"),
							t("transcription.bullets.1"),
							t("transcription.bullets.2"),
						]}
						cta={t("transcription.cta")}
						href="/transcription"
						icon={<MessageSquareText className="h-6 w-6" />}
						preview={<TranscriptionPreview />}
					/>

					<ToolCard
						title={t("reference.title")}
						description={t("reference.description")}
						bullets={[t("reference.bullets.0"), t("reference.bullets.1"), t("reference.bullets.2")]}
						cta={t("reference.cta")}
						href="/ipa-chart"
						icon={<BookOpen className="h-6 w-6" />}
						preview={<IpaChartPreview />}
					/>
				</div>
			</section>
		</div>
	);
}
