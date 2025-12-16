"use client";

import { ThemeSwitcher as UiThemeSwitcher } from "@phonaria/ui/components/theme-switcher";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	const t = useTranslations("components.theme-switcher");

	const value = theme === "light" || theme === "dark" || theme === "system" ? theme : "system";

	return (
		<UiThemeSwitcher
			value={value}
			onValueChange={(nextTheme) => setTheme(nextTheme)}
			labels={{
				toggleAriaLabel: t("toggle-aria"),
				light: t("light"),
				dark: t("dark"),
				system: t("system"),
			}}
		/>
	);
}
