"use client";

import { type ReactNode, useState } from "react";
import type { AppFlags } from "@/lib/flags";
import { cn } from "@/lib/utils";
import { Footer } from "./footer";
import { Header } from "./header";
import { HeaderActionsProvider } from "./header-actions";
import { PhonemeDetailsSheet } from "./phoneme-details/phoneme-details-sheet";

/** Shared application chrome for the TanStack Start route tree. */
export function AppShell({ flags, children }: { flags: AppFlags; children: ReactNode }) {
	// The docked details panel takes the right edge; the page narrows beside it instead of hiding under it.
	const [detailsDocked, setDetailsDocked] = useState(false);

	return (
		<HeaderActionsProvider>
			<div
				className={cn(
					"min-h-screen flex flex-col transition-all duration-200 ease-in-out motion-reduce:transition-none",
					detailsDocked && "xl:pr-96",
				)}
			>
				<Header flags={flags} />
				<main className="flex-1 flex min-h-0 flex-col">{children}</main>
				<Footer />
			</div>
			<PhonemeDetailsSheet onDockedChange={setDetailsDocked} />
		</HeaderActionsProvider>
	);
}
