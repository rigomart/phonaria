"use client";

import { ThemeSwitcher as UiThemeSwitcher } from "@phonaria/ui/components/theme-switcher";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();

	const value = theme === "light" || theme === "dark" || theme === "system" ? theme : "system";

	return (
		<UiThemeSwitcher
			value={value}
			onValueChange={(nextTheme) => setTheme(nextTheme)}
			labels={{
				toggleAriaLabel: "Toggle theme",
				light: "Light",
				dark: "Dark",
				system: "System",
			}}
		/>
	);
}
