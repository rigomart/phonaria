"use client";

import { Button } from "@phonaria/ui/components/button";
import { type LucideIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { type ThemeMode, useTheme } from "@/components/theme";

const modes: readonly { value: ThemeMode; label: string; icon: LucideIcon }[] = [
	{ value: "system", label: "System", icon: MonitorIcon },
	{ value: "light", label: "Light", icon: SunIcon },
	{ value: "dark", label: "Dark", icon: MoonIcon },
];

/** One button that steps through system → light → dark, showing the current mode. */
export function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	const index = modes.findIndex((mode) => mode.value === theme);
	const current = modes[index] ?? modes[0];
	const next = modes[(index + 1) % modes.length] ?? modes[0];

	return (
		<Button
			variant="ghost"
			size="icon-sm"
			className="text-muted-foreground hover:text-foreground"
			aria-label={`Theme: ${current.label}. Switch to ${next.label}`}
			title={`Theme: ${current.label}`}
			onClick={() => setTheme(next.value)}
		>
			<current.icon aria-hidden />
		</Button>
	);
}
