import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Mono, Noto_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { routing } from "@/i18n/routing";
import Providers from "./providers";
import "@phonaria/ui/index.css";

const notoSerif = Noto_Serif({
	variable: "--font-noto-serif",
	subsets: ["latin"],
	fallback: ["system-ui", "serif"],
});

const notoSans = Noto_Sans({
	variable: "--font-noto-sans",
	subsets: ["latin"],
	fallback: ["system-ui", "sans-serif"],
});

const notoSansMono = Noto_Sans_Mono({
	variable: "--font-noto-sans-mono",
	subsets: ["latin"],
	fallback: ["system-ui", "monospace"],
});

export async function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
	title: "Phonaria - Pronunciation toolkit for ESL learners",
	description:
		"Learner-first pronunciation toolkit for people studying English as a second language. Gathers the core resources learners need to understand how English sounds work, explore spelling and phoneme patterns, and connect what they read with how it should sound.",
};

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
			className={`${notoSerif.variable} ${notoSans.variable} ${notoSansMono.variable}`}
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
