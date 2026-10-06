import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/app-providers";
import { AppShell } from "@/components/app-shell";
import { EnsureDocumentTitle } from "@/components/ensure-document-title";
import { NotFoundContent } from "@/components/not-found-content";
import { themeInitScript } from "@/components/theme";
import { buildRootHead } from "@/lib/document-head";
import { flags } from "@/lib/flags";
import { fontStylesheets } from "@/lib/fonts";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
	head: () => {
		const head = buildRootHead();
		return {
			...head,
			links: [{ rel: "stylesheet", href: appCss }, ...fontStylesheets, ...(head.links ?? [])],
			scripts: [{ children: themeInitScript() }],
		};
	},
	notFoundComponent: NotFoundContent,
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	return (
		<AppProviders>
			<AppShell flags={flags.snapshot()}>
				<Outlet />
			</AppShell>
		</AppProviders>
	);
}

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="antialiased">
				<EnsureDocumentTitle />
				{children}
				<Scripts />
			</body>
		</html>
	);
}
