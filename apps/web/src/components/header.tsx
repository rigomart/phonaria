"use client";

import { AudioLines, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useScopedI18n } from "@/locales/client";

export function Header() {
	const [open, setOpen] = useState(false);
	const t = useScopedI18n("components.header.navigation");

	const navigationLinks = [
		{ href: "/overview", label: t("overview") },
		{ href: "/", label: t("transcription") },
		{ href: "/ipa-chart", label: t("ipa-chart") },
	];

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background-soft">
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
							<SheetContent side="left" className="w-[280px] sm:w-[320px]">
								{/* Logo at the top of the sheet */}
								<div className="flex items-center gap-2 mb-8">
									<span className="flex size-6 items-center justify-center">
										<AudioLines className="size-4" aria-hidden="true" />
									</span>
									<span className="text-base font-medium">Phonaria</span>
								</div>

								{/* Navigation links */}
								<nav className="flex flex-col gap-1">
									{navigationLinks.map((link) => (
										<Link
											key={link.href}
											href={link.href}
											onClick={() => setOpen(false)}
											className="flex items-center rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors"
										>
											{link.label}
										</Link>
									))}
								</nav>

								{/* Dark mode toggle at the bottom */}
								<div className="absolute bottom-6 left-6 right-6">
									<div className="border-t border-border pt-4">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium text-muted-foreground">Theme</span>
											<ModeToggle />
										</div>
									</div>
								</div>
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
						<ModeToggle />
					</div>
				</div>
			</div>
		</header>
	);
}
