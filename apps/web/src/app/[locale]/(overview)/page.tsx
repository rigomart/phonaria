import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLanguageAlternates, getLocalePath } from "@/lib/seo";
import { HeroSection } from "./_components/hero-section";
import { IpaIntroSection } from "./_components/ipa-intro-section";
import { IpaVisualizerSection } from "./_components/ipa-visualizer-section";
import { SpellingVsSoundSection } from "./_components/spelling-vs-sound-section";

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

	return (
		<div className="flex flex-1 flex-col items-center bg-background bg-grid-pattern">
			<div className="w-full max-w-5xl my-4 space-y-8">
				<HeroSection />

				<div className="flex flex-col bg-background-soft rounded-xl border divide-y">
					<SpellingVsSoundSection />

					<IpaIntroSection />

					<IpaVisualizerSection />
				</div>
			</div>
		</div>
	);
}
