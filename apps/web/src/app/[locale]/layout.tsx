import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

// Local helper to type App Router layout props without relying on global types
// Matches Next.js App Router "LayoutProps" inference pattern
// path is used for inference but not executed at runtime
export type LocalLayoutProps<Path extends string> = {
	children: React.ReactNode;
	params: Promise<{ locale: string } & Record<string, string>>;
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
} & { __path?: Path };

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
	props: Omit<LocalLayoutProps<"/[locale]">, "children">,
): Promise<Metadata> {
	const { locale } = await props.params;

	const t = await getTranslations({
		locale: locale as Locale,
		namespace: "LocaleLayout",
	});

	return {
		title: t("title"),
		description: t("description"),
	};
}

export default async function LocaleLayout({ children, params }: LocalLayoutProps<"/[locale]">) {
	// Ensure that the incoming `locale` is valid
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	// Enable static rendering
	setRequestLocale(locale);

	return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
