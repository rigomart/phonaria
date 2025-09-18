import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/header";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
	props: Omit<LayoutProps<"/[locale]">, "children">,
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

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
	// Ensure that the incoming `locale` is valid
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	// Enable static rendering
	setRequestLocale(locale);

	return (
		<NextIntlClientProvider>
			<div className="h-screen flex flex-col">
				<Header />
				{children}
			</div>
		</NextIntlClientProvider>
	);
}
