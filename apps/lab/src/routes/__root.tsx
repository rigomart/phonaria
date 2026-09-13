import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/app-providers";
import { LabShell } from "@/components/lab-shell";
import { NotFoundContent } from "@/components/not-found-content";
import { flags } from "@/lib/flags";
import { getDocumentMetadata } from "@/platform";
import { TanStackPlatformProvider } from "@/platform/tanstack";
import { themeInitScript } from "@/platform/tanstack/theme";
import "@phonaria/ui/globals.css";
import "@/platform/fonts";

export const Route = createRootRoute({
	head: () => {
		const documentMetadata = getDocumentMetadata();
		return {
			meta: [
				{ charSet: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ title: documentMetadata.defaultTitle },
				{ name: "description", content: documentMetadata.description },
				{
					name: "robots",
					content: documentMetadata.indexingEnabled ? "index, follow" : "noindex, follow",
				},
				{ property: "og:title", content: documentMetadata.siteName },
				{ property: "og:description", content: documentMetadata.description },
				{ property: "og:site_name", content: documentMetadata.siteName },
				{ property: "og:url", content: documentMetadata.siteUrl },
				{ name: "twitter:card", content: "summary" },
				{ name: "twitter:title", content: documentMetadata.siteName },
				{ name: "twitter:description", content: documentMetadata.description },
				...(documentMetadata.googleSiteVerification
					? [{ name: "google-site-verification", content: documentMetadata.googleSiteVerification }]
					: []),
			],
			scripts: [{ children: themeInitScript() }],
		};
	},
	notFoundComponent: NotFoundContent,
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	return (
		<TanStackPlatformProvider>
			<AppProviders>
				<LabShell flags={flags.snapshot()}>
					<Outlet />
				</LabShell>
			</AppProviders>
		</TanStackPlatformProvider>
	);
}

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="antialiased">
				{children}
				<Scripts />
			</body>
		</html>
	);
}
