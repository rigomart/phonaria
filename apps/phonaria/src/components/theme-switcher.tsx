"use client";

import { ThemeSwitcher as UiThemeSwitcher } from "@phonaria/ui/components/theme-switcher";
import { useTheme } from "@/components/theme";

export function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();

	return (
		<UiThemeSwitcher
			value={theme}
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
