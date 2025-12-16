"use client";

import { MonitorIcon, Moon, MoonIcon, Sun, SunIcon } from "lucide-react";
import type * as React from "react";

import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./menu";

export type ThemeMode = "light" | "dark" | "system";

export type ThemeSwitcherLabels = {
	toggleAriaLabel: string;
	light: React.ReactNode;
	dark: React.ReactNode;
	system: React.ReactNode;
};

type ThemeSwitcherProps = {
	value: ThemeMode;
	onValueChange: (value: ThemeMode) => void;
	labels: ThemeSwitcherLabels;
};

function ThemeSwitcher({ onValueChange, labels }: ThemeSwitcherProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="outline" aria-label={labels.toggleAriaLabel} />}
			>
				<Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
				<Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
				<span className="sr-only">{labels.toggleAriaLabel}</span>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => onValueChange("light")}>
					<SunIcon /> {labels.light}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onValueChange("dark")}>
					<MoonIcon /> {labels.dark}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onValueChange("system")}>
					<MonitorIcon /> {labels.system}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { ThemeSwitcher, type ThemeSwitcherProps };
