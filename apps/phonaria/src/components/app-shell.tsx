import { type ReactNode, useEffect } from "react";
import {
	focusMainContent,
	MAIN_CONTENT_ID,
	useFocusOnNavigation,
} from "@/hooks/use-focus-on-navigation";
import type { AppFlags } from "@/lib/flags";
import { listenForStaleDeploy } from "@/lib/stale-deploy-reload";
import { Footer } from "./footer";
import { Header } from "./header";
import { PhonemeDetailsProvider } from "./phoneme-details/phoneme-details";

/** Shared application chrome for the TanStack Start route tree. */
export function AppShell({ flags, children }: { flags: AppFlags; children: ReactNode }) {
	useFocusOnNavigation();
	useEffect(() => listenForStaleDeploy(), []);

	return (
		<PhonemeDetailsProvider>
			<div className="min-h-screen flex flex-col">
				<SkipLink />
				<Header flags={flags} />
				<main
					id={MAIN_CONTENT_ID}
					tabIndex={-1}
					className="flex-1 flex min-h-0 flex-col outline-none"
				>
					{children}
				</main>
				<Footer flags={flags} />
			</div>
		</PhonemeDetailsProvider>
	);
}

/**
 * The first stop for the Tab key, hidden until focused: it moves focus past
 * the header to the page's content. Without JavaScript the link's fragment
 * does the same; with it, the address keeps no `#main-content`.
 */
function SkipLink() {
	return (
		<a
			href={`#${MAIN_CONTENT_ID}`}
			onClick={(event) => {
				event.preventDefault();
				focusMainContent({ preferHeading: false });
			}}
			className="sr-only rounded-md bg-background text-sm font-medium text-foreground shadow-md focus:not-sr-only focus:px-3 focus:py-2 focus:fixed focus:top-2 focus:left-4 focus:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			Skip to content
		</a>
	);
}
