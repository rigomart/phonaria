import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/app-providers";
import { EnsureDocumentTitle } from "@/components/ensure-document-title";
import { LabShell } from "@/components/lab-shell";
import { NotFoundContent } from "@/components/not-found-content";
import { themeInitScript } from "@/components/theme";
import { buildRootHead } from "@/lib/document-head";
import { flags } from "@/lib/flags";
import "@phonaria/ui/globals.css";
import "@/lib/fonts";

export const Route = createRootRoute({
	head: () => {
		const head = buildRootHead();
		return {
			...head,
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
			<LabShell flags={flags.snapshot()}>
				<Outlet />
			</LabShell>
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
