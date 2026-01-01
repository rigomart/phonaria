import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLanguageAlternates, getLocalePath } from "@/lib/seo";
import { FindBySoundClient } from "./_components/find-by-sound-client";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const locale = (await params).locale as Locale;
	const t = await getTranslations({ locale, namespace: "find-by-sound-page" });

	return {
		title: t("meta.title"),
		description: t("meta.description"),
		alternates: {
			canonical: getLocalePath(locale, "/find-by-sound"),
			languages: getLanguageAlternates("/find-by-sound"),
		},
	};
}

export default async function FindBySoundPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	setRequestLocale(locale as Locale);

	return (
		<div className="flex-1 min-h-0 h-full bg-background">
			<div className="container mx-auto h-full min-h-0 px-4 py-4 lg:py-6">
				<FindBySoundClient />
			</div>
		</div>
	);
}
