import type { Metadata } from "next";
import { LabShell } from "@/components/lab-shell";
import { flags } from "@/lib/flags";
import { getDocumentMetadata } from "@/platform";
import Providers from "./providers";
import "@phonaria/ui/globals.css";
import "@/platform/fonts";

const documentMetadata = getDocumentMetadata();

export const metadata: Metadata = {
	// Makes every relative metadata URL absolute, and canonical "./" resolve to
	// the current route. Indexability is governed here for the whole app.
	metadataBase: new URL(documentMetadata.siteUrl),
	title: {
		default: documentMetadata.defaultTitle,
		template: documentMetadata.titleTemplate,
	},
	description: documentMetadata.description,
	alternates: { canonical: documentMetadata.canonical },
	openGraph: {
		title: documentMetadata.siteName,
		description: documentMetadata.description,
		siteName: documentMetadata.siteName,
		url: documentMetadata.canonical,
	},
	twitter: {
		card: "summary",
		title: documentMetadata.siteName,
		description: documentMetadata.description,
	},
	robots: { index: documentMetadata.indexingEnabled, follow: true },
	verification: documentMetadata.googleSiteVerification
		? { google: documentMetadata.googleSiteVerification }
		: undefined,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased">
				<Providers>
					<LabShell flags={flags.snapshot()}>{children}</LabShell>
				</Providers>
			</body>
		</html>
	);
}
