import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { getLanguageAlternates, getLocalePath } from "@/lib/seo";

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

export default function IpaChartLayout({ children }: { children: React.ReactNode }) {
	return <Suspense fallback={null}>{children}</Suspense>;
}
