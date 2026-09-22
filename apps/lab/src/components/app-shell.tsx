import type { ReactNode } from "react";
import type { AppFlags } from "@/lib/flags";
import { Footer } from "./footer";
import { Header } from "./header";

/** Shared application chrome for the TanStack Start route tree. */
export function AppShell({ flags, children }: { flags: AppFlags; children: ReactNode }) {
	return (
		<div className="min-h-screen flex flex-col">
			<Header flags={flags} />
			<main className="flex-1 flex min-h-0 flex-col">{children}</main>
			<Footer />
		</div>
	);
}
