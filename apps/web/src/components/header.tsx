"use client";

import { Button } from "@phonaria/ui/components/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuPopup,
	NavigationMenuPositioner,
	NavigationMenuTrigger,
} from "@phonaria/ui/components/navigation-menu";
import {
	Sheet,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetPanel,
	SheetPopup,
	SheetTitle,
	SheetTrigger,
} from "@phonaria/ui/components/sheet";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logo } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Link } from "@/i18n/navigation";

export function Header() {
	const [sheetOpen, setSheetOpen] = useState(false);
	const t = useTranslations("components.header.navigation");

	const toolsLinks = [
		{
			href: "/transcription",
			label: t("transcription"),
			description: t("transcription-description"),
		},
		{
			href: "/find-by-sound",
			label: t("find-by-sound"),
			description: t("find-by-sound-description"),
		},
	];

	const standaloneLinks = [
		{ href: "/ipa-chart", label: t("ipa-chart") },
		{ href: "/insights", label: t("insights") },
	];

	const allNavigationLinks = [...toolsLinks, ...standaloneLinks];

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background-strong">
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-2">
							<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
								<SheetTrigger
									render={<Button variant="outline" size="icon" className="md:hidden" />}
								>
									<Menu className="size-5" />
									<span className="sr-only">Toggle menu</span>
								</SheetTrigger>
								<SheetPopup side="left">
									<SheetHeader>
										<div className="flex items-center gap-2">
											<span className="flex items-center justify-center">
												<Logo className="size-6" />
											</span>
											<SheetTitle>
												<span className="text-base font-medium">Phonaria</span>
											</SheetTitle>
											<SheetDescription className="sr-only">Sidebar navigation</SheetDescription>
										</div>
									</SheetHeader>

									<SheetPanel>
										{/* Navigation links */}
										<nav className="flex flex-col gap-1">
											{allNavigationLinks.map((link) => (
												<Button
													key={link.href}
													variant="ghost"
													size="lg"
													className="w-full justify-start text-muted-foreground hover:text-foreground"
													render={<Link href={link.href} onClick={() => setSheetOpen(false)} />}
												>
													{link.label}
												</Button>
											))}
										</nav>
									</SheetPanel>

									{/* Dark mode toggle at the bottom */}
									<SheetFooter>
										<div className="flex items-center justify-between">
											<LocaleSwitcher />

											<ThemeSwitcher />
										</div>
									</SheetFooter>
								</SheetPopup>
							</Sheet>

							<Link
								href="/"
								className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
							>
								<span className="flex items-center justify-center">
									<Logo className="size-6 text-foreground" />
								</span>
								<span className="text-lg font-semibold">Phonaria</span>
							</Link>
						</div>

						<NavigationMenu className="hidden md:flex">
							<NavigationMenuList>
								<NavigationMenuItem>
									<NavigationMenuTrigger>{t("tools")}</NavigationMenuTrigger>
									<NavigationMenuPositioner>
										<NavigationMenuPopup>
											<NavigationMenuContent>
												{toolsLinks.map((link) => (
													<NavigationMenuLink key={link.href} render={<Link href={link.href} />}>
														<span className="font-medium">{link.label}</span>
														<span className="text-muted-foreground">{link.description}</span>
													</NavigationMenuLink>
												))}
											</NavigationMenuContent>
										</NavigationMenuPopup>
									</NavigationMenuPositioner>
								</NavigationMenuItem>
								{standaloneLinks.map((link) => (
									<NavigationMenuItem key={link.href}>
										<NavigationMenuLink render={<Link href={link.href} />}>
											{link.label}
										</NavigationMenuLink>
									</NavigationMenuItem>
								))}
							</NavigationMenuList>
						</NavigationMenu>
					</div>

					{/* Desktop mode toggle */}
					<div className="hidden md:flex items-center gap-2">
						<LocaleSwitcher />
						<ThemeSwitcher />
					</div>
				</div>
			</div>
		</header>
	);
}
