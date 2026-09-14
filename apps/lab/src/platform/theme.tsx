"use client";

import { createContext, type ReactNode, useContext } from "react";

export type ThemeMode = "light" | "dark" | "system";

export type ThemeApi = {
	theme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeApi | null>(null);

export function ThemeApiProvider({ value, children }: { value: ThemeApi; children: ReactNode }) {
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeApi {
	const value = useContext(ThemeContext);
	if (!value) {
		throw new Error("useTheme must be used within a platform ThemeProvider");
	}
	return value;
}
