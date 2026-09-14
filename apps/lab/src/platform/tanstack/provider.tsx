"use client";

import type { ReactNode } from "react";
import { LinkProvider } from "../link";
import { Link } from "./link";
import { ThemeProvider } from "./theme";

/** TanStack Start route-root adapter selection for Link and theme. */
export function TanStackPlatformProvider({ children }: { children: ReactNode }) {
	return (
		<LinkProvider Link={Link}>
			<ThemeProvider>{children}</ThemeProvider>
		</LinkProvider>
	);
}
