"use client";

import { Button } from "@phonaria/ui/components/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@phonaria/ui/components/sheet";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "@/components/link";
import { useScrolled } from "@/hooks/use-scrolled";
import type { AppFlags } from "@/lib/flags";
import { IPA_CHART_INDEX_PATH } from "@/lib/ipa-chart-metadata";
import { getChartTabPath } from "@/lib/ipa-chart/sound-route";
import { cn } from "@/lib/utils";
import { HeaderActionsSlot } from "./header-actions";
import { Logo } from "./logo";
import { chartSections, getTools, usePathname } from "./site-nav";
import { ThemeSwitcher } from "./theme-switcher";

const focusRing =
	"rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Header({ flags }: { flags: AppFlags }) {
	const pathname = usePathname();
	const scrolled = useScrolled();
	const onChart = pathname.startsWith(IPA_CHART_INDEX_PATH);
	const chartTab = getChartTabPath(pathname, "en-us");

	return (
		<header
			className={cn(
				"sticky top-0 z-40 border-b bg-background transition-[border-color] motion-reduce:transition-none",
				scrolled || onChart ? "border-border" : "border-transparent",
			)}
		>
			<div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
				<Link
					href="/"
					aria-label="Phonaria"
					className={cn("flex items-center text-foreground", focusRing)}
				>
					<Logo className="size-5" />
				</Link>

				<nav aria-label="Main" className="hidden h-full items-stretch gap-5 text-sm sm:flex">
					{getTools(flags).map((tool) => {
						const active = tool.match(pathname);
						return (
							<Link
								key={tool.id}
								href={tool.href}
								aria-current={active ? "page" : undefined}
								className={cn(
									"relative flex items-center transition-colors motion-reduce:transition-none",
									focusRing,
									active
										? "text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{tool.label}
							</Link>
						);
					})}
				</nav>

				<div className="ml-auto flex items-center gap-1">
					<HeaderActionsSlot className="flex items-center" />
					<ThemeSwitcher />
					<MobileMenu flags={flags} />
				</div>
			</div>

			{onChart && (
				<div className="border-t">
					<nav
						aria-label="IPA Chart"
						className="mx-auto flex w-full max-w-6xl gap-1 px-4 py-2 text-sm sm:px-6"
					>
						{chartSections.map((section) => {
							// A sound's page keeps its chart's tab lit.
							const active = chartTab === section.href;
							return (
								<Link
									key={section.href}
									href={section.href}
									aria-current={pathname === section.href ? "page" : undefined}
									className={cn(
										"rounded-full px-3 py-1 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
										active
											? "bg-secondary text-foreground"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									{section.label}
								</Link>
							);
						})}
					</nav>
				</div>
			)}
		</header>
	);
}

function MobileMenu({ flags }: { flags: AppFlags }) {
	const pathname = usePathname();
	const chartTab = getChartTabPath(pathname, "en-us");
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<Button
						variant="ghost"
						size="icon-sm"
						className="text-muted-foreground hover:text-foreground sm:hidden"
						aria-label="Open menu"
					/>
				}
			>
				<MenuIcon aria-hidden />
			</SheetTrigger>
			<SheetContent side="top">
				<SheetHeader>
					<SheetTitle>Menu</SheetTitle>
				</SheetHeader>
				<nav aria-label="Main" className="flex flex-col px-4 pb-6">
					{getTools(flags).map((tool) => {
						const active = tool.match(pathname);
						return (
							<div key={tool.id} className="border-b last:border-b-0">
								<Link
									href={tool.href}
									onClick={close}
									aria-current={active ? "page" : undefined}
									className={cn(
										"flex items-center gap-3 py-3 text-base",
										active ? "font-medium text-foreground" : "text-muted-foreground",
									)}
								>
									<tool.icon className="size-4" aria-hidden />
									{tool.label}
								</Link>
								{tool.id === "ipa-chart" && (
									<div className="flex gap-2 pb-3 pl-7">
										{chartSections.map((section) => (
											<Link
												key={section.href}
												href={section.href}
												onClick={close}
												aria-current={pathname === section.href ? "page" : undefined}
												className={cn(
													"rounded-full border px-3 py-1 text-sm",
													chartTab === section.href
														? "bg-secondary text-foreground"
														: "text-muted-foreground",
												)}
											>
												{section.label}
											</Link>
										))}
									</div>
								)}
							</div>
						);
					})}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
