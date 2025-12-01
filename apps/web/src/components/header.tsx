"use client";

import { AudioLines, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useScopedI18n } from "@/locales/client";

export function Header() {
	const [open, setOpen] = useState(false);
	const t = useScopedI18n("components.header.navigation");

	const navigationLinks = [
		{ href: "/transcription", label: t("transcription") },
		{ href: "/ipa-chart", label: t("ipa-chart") },
		{ href: "/stats", label: t("stats") },
	];

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background-strong">
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						{/* Mobile menu button - positioned before logo */}
						<Sheet open={open} onOpenChange={setOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="md:hidden">
									<Menu className="size-5" />
									<span className="sr-only">Toggle menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="left">
								<SheetHeader>
									<div className="flex items-center gap-2 py-2">
										<span className="flex size-6 items-center justify-center">
											<AudioLines className="size-4" aria-hidden="true" />
										</span>
										<SheetTitle>
											<span className="text-base font-medium">Phonaria</span>
										</SheetTitle>
										<SheetDescription className="sr-only">Sidebar navigation</SheetDescription>
									</div>
								</SheetHeader>

								{/* Navigation links */}
								<nav className="flex flex-col items-start gap-1 px-4">
									{navigationLinks.map((link) => (
										<Button asChild variant="link">
											<Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
												{link.label}
											</Link>
										</Button>
									))}
								</nav>

								{/* Dark mode toggle at the bottom */}
								<SheetFooter>
									<div className="border-t border-border pt-4">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium text-muted-foreground">Theme</span>
											<ThemeSwitcher />
										</div>
									</div>
								</SheetFooter>
							</SheetContent>
						</Sheet>

						<Link
							href="/"
							className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
						>
							<span className="flex size-6 items-center justify-center">
								<AudioLines className="size-4" aria-hidden="true" />
							</span>
							<span className="text-base font-medium">Phonaria</span>
						</Link>

						<nav className="hidden items-center gap-5 md:flex">
							{navigationLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
								>
									{link.label}
								</Link>
							))}
						</nav>
					</div>

					{/* Desktop mode toggle */}
					<div className="hidden md:flex items-center gap-2">
						<ThemeSwitcher />
					</div>
				</div>
			</div>
		</header>
	);
}
