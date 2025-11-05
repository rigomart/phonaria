import { setStaticParamsLocale } from "next-international/server";
import type { ReactElement } from "react";
import { Header } from "@/components/header";
import { I18nProviderClient } from "@/locales/client";
import { getStaticParams } from "@/locales/server";

export function generateStaticParams() {
	return getStaticParams();
}

export default async function LocaleLayout({
	params,
	children,
}: {
	params: Promise<{ locale: string }>;
	children: ReactElement;
}) {
	// Ensure that the incoming `locale` is valid
	const { locale } = await params;

	setStaticParamsLocale(locale);

	return (
		<I18nProviderClient locale={locale}>
			<div className="h-screen flex flex-col">
				<Header />
				{children}
			</div>
		</I18nProviderClient>
	);
}
