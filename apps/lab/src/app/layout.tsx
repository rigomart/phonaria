import type { Metadata } from "next";
import { Noto_Sans, Sora } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { flags } from "@/lib/flags";
import {
	getGoogleSiteVerification,
	getSiteUrl,
	isIndexingEnabled,
	SITE_DESCRIPTION,
	SITE_NAME,
} from "@/lib/site";
import Providers from "./providers";
import "@phonaria/ui/globals.css";

const sora = Sora({
	variable: "--font-display-serif",
	subsets: ["latin"],
	fallback: ["system-ui", "sans-serif"],
});

const notoSans = Noto_Sans({
	variable: "--font-noto-sans",
	subsets: ["latin"],
	fallback: ["system-ui", "sans-serif"],
	preload: true,
});

const googleSiteVerification = getGoogleSiteVerification();

export const metadata: Metadata = {
	// Makes every relative metadata URL absolute, and canonical "./" resolve to
	// the current route. Indexability is governed here for the whole app.
	metadataBase: new URL(getSiteUrl()),
	title: {
		default: SITE_NAME,
		template: `%s - ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	alternates: { canonical: "./" },
	openGraph: {
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		siteName: SITE_NAME,
		url: "./",
	},
	twitter: {
		card: "summary",
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
	},
	robots: { index: isIndexingEnabled(), follow: true },
	verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className={`${sora.variable} ${notoSans.variable}`}>
			<body className="antialiased">
				<Providers>
					<div className="min-h-screen flex flex-col">
						<Header flags={flags.snapshot()} />
						<main className="flex-1 flex min-h-0 flex-col">{children}</main>
						<Footer />
					</div>
				</Providers>
			</body>
		</html>
	);
}
