import type { ReactNode } from "react";
import type { LabFlags } from "@/lib/flags";
import { Footer } from "./footer";
import { Header } from "./header";

/** Shared Lab chrome for the TanStack Start route tree. */
export function LabShell({ flags, children }: { flags: LabFlags; children: ReactNode }) {
	return (
		<div className="min-h-screen flex flex-col">
			<Header flags={flags} />
			<main className="flex-1 flex min-h-0 flex-col">{children}</main>
			<Footer />
		</div>
	);
}
