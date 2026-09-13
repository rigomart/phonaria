/**
 * next-themes adapter for the Next.js Lab. Bridges into the portable theme
 * contract so shared chrome can call `useTheme` without importing next-themes.
 */
"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { type ReactNode, useMemo } from "react";
import { ThemeApiProvider, type ThemeMode } from "../theme";

export type { ThemeMode };

function ThemeBridge({ children }: { children: ReactNode }) {
	const { theme, setTheme } = useNextTheme();
	const value = useMemo(() => {
		const resolved: ThemeMode =
			theme === "light" || theme === "dark" || theme === "system" ? theme : "system";
		return {
			theme: resolved,
			setTheme: (nextTheme: ThemeMode) => {
				setTheme(nextTheme);
			},
		};
	}, [theme, setTheme]);

	return <ThemeApiProvider value={value}>{children}</ThemeApiProvider>;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<ThemeBridge>{children}</ThemeBridge>
		</NextThemesProvider>
	);
}

export { useTheme } from "../theme";
