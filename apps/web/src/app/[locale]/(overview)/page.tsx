import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLanguageAlternates, getLocalePath } from "@/lib/seo";
import { HeroSection } from "./_components/hero-section";
import { MinimalPairSection } from "./_components/minimal-pair-section";
import { PhonemeMap } from "./_components/phoneme-map";
import { WordExplorer } from "./_components/word-explorer";

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
		<div className="flex flex-1 flex-col">
			<div className="bg-background bg-cross-pattern border-b">
				<div className="w-full max-w-5xl mx-auto px-4 pt-8 pb-10">
					<HeroSection />
				</div>
			</div>

			<div className="bg-background-soft">
				<div className="w-full max-w-5xl mx-auto px-4 py-8">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<WordExplorer />
						<PhonemeMap />
					</div>
				</div>
			</div>

			<div className="bg-background-strong border-t bg-cross-pattern [--cross-fade-height:90%] [--cross-fade-width:90%]">
				<div className="w-full max-w-5xl mx-auto px-4 py-8">
					<MinimalPairSection />
				</div>
			</div>
		</div>
	);
}
