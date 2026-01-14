import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { getLanguageAlternates, getLocalePath } from "@/lib/seo";
import { IntroSection } from "./_sections/intro-section";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const locale = (await params).locale as Locale;
	const t = await getTranslations({ locale, namespace: "ipa-chart" });

	return {
		title: t("meta.title"),
		description: t("meta.description"),
		alternates: {
			canonical: getLocalePath(locale, "/ipa-chart"),
			languages: getLanguageAlternates("/ipa-chart"),
		},
	};
}

export default async function IpaChartLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	return (
		<>
			<IntroSection locale={locale as Locale} />
			<Suspense fallback={null}>{children}</Suspense>
		</>
	);
}
