import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLanguageAlternates, getLocalePath } from "@/lib/seo";
import { PhonemeSearchClient } from "./_components/phoneme-search-client";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const locale = (await params).locale as Locale;
	const t = await getTranslations({ locale, namespace: "phoneme-search-page" });

	return {
		title: t("meta.title"),
		description: t("meta.description"),
		alternates: {
			canonical: getLocalePath(locale, "/phoneme-search"),
			languages: getLanguageAlternates("/phoneme-search"),
		},
	};
}

export default async function PhonemeSearchPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale as Locale);

	return (
		<div className="flex-1 min-h-0 h-full bg-background">
			<div className="container mx-auto h-full min-h-0 px-2 py-2 lg:py-3">
				<PhonemeSearchClient />
			</div>
		</div>
	);
}
