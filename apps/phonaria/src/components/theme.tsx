"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

export type ThemeApi = {
	theme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
};

const STORAGE_KEY = "theme";

const ThemeContext = createContext<ThemeApi | null>(null);

function resolveTheme(theme: ThemeMode): "light" | "dark" {
	if (theme === "light" || theme === "dark") return theme;
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
	const resolved = resolveTheme(theme);
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(resolved);
	root.style.colorScheme = resolved;
}

/** Runs before paint so the first frame already carries the stored theme. */
export function themeInitScript(): string {
	return `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}')||'system';var r=t==='light'||t==='dark'?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.add(r);document.documentElement.style.colorScheme=r;}catch(e){}})();`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<ThemeMode>("system");

	useEffect(() => {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		const initial: ThemeMode =
			stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
		setThemeState(initial);
		applyTheme(initial);
	}, []);

	const setTheme = useCallback((next: ThemeMode) => {
		setThemeState(next);
		window.localStorage.setItem(STORAGE_KEY, next);
		applyTheme(next);
	}, []);

	const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeApi {
	const value = useContext(ThemeContext);
	if (!value) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return value;
}
