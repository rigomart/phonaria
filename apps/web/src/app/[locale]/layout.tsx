import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DM_Mono, Inter, Noto_Serif } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { Header } from "@/components/header";
import { I18nProviderClient } from "@/locales/client";
import { getStaticParams } from "@/locales/server";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	fallback: ["system-ui", "sans-serif"],
});

const notoSerif = Noto_Serif({
	variable: "--font-noto-serif",
	subsets: ["latin"],
	fallback: ["system-ui", "serif"],
});

const dmMono = DM_Mono({
	variable: "--font-dm-mono",
	subsets: ["latin"],
	weight: ["400"],
	fallback: ["system-ui", "monospace"],
});

export async function generateStaticParams() {
	return getStaticParams();
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

	setStaticParamsLocale(locale);

	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${inter.variable} ${dmMono.variable} ${notoSerif.variable}`}
		>
			<body className={`antialiased`}>
				<I18nProviderClient locale={locale}>
					<Providers>
						<div className="h-screen flex flex-col">
							<Header />
							{children}
						</div>
					</Providers>
				</I18nProviderClient>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
