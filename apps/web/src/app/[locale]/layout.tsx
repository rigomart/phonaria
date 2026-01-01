import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { Locale } from "next-intl";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import Providers from "./providers";
import "@phonaria/ui/globals.css";

const notoSans = Noto_Sans({
	variable: "--font-noto-sans",
	subsets: ["latin"],
	fallback: ["system-ui", "sans-serif"],
	preload: true,
});

const notoSansMono = Noto_Sans_Mono({
	variable: "--font-noto-sans-mono",
	subsets: ["latin"],
	fallback: ["system-ui", "monospace"],
});

export async function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const locale = (await params).locale as Locale;
	const t = await getTranslations({ locale, namespace: "locale-layout" });

	return {
		metadataBase: new URL(SITE_URL),
		title: t("title"),
		description: t("description"),
		applicationName: SITE_NAME,
		openGraph: {
			title: t("title"),
			description: t("description"),
			siteName: SITE_NAME,
			type: "website",
		},
		twitter: {
			card: "summary",
			title: t("title"),
			description: t("description"),
		},
		robots: {
			index: true,
			follow: true,
		},
		verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
	};
}

export default async function RootLayout({
	params,
	children,
}: Readonly<{
	params: Promise<{ locale: string }>;
	children: React.ReactNode;
}>) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		return notFound();
	}

	setRequestLocale(locale);

	return (
		<html
			lang={locale}
			suppressHydrationWarning
			className={`${notoSans.variable} ${notoSansMono.variable}`}
		>
			<body className={`antialiased`}>
				<NextIntlClientProvider>
					<NuqsAdapter>
						<Providers>
							<div className="min-h-screen flex flex-col">
								<Header />
								<main className="flex-1 flex min-h-0 flex-col">{children}</main>
								<Footer />
							</div>
						</Providers>
					</NuqsAdapter>
				</NextIntlClientProvider>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
