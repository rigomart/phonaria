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
 * Moves focus past the header. The click handler keeps `#main-content` out of
 * the address; without JavaScript the fragment does the same job.
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
