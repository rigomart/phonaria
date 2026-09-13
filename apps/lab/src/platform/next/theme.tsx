/**
 * next-themes adapter for Lab theme setup.
 * Temporary migration boundary. next-themes is React-generic and can be reused
 * on TanStack Start; this module is the app-owned theme contract.
 */
"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import type { ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";

export function ThemeProvider({ children }: { children: ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			{children}
		</NextThemesProvider>
	);
}

export function useTheme(): {
	theme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
} {
	const { theme, setTheme } = useNextTheme();
	const value: ThemeMode =
		theme === "light" || theme === "dark" || theme === "system" ? theme : "system";

	return {
		theme: value,
		setTheme: (nextTheme) => {
			setTheme(nextTheme);
		},
	};
}
