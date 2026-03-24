"use client";

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
import Link from "next/link";
import { Logo } from "./logo";

const navLinkClass =
	"rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function Header() {
	return (
		<header className="relative flex items-center justify-center px-4 py-3 animate-in fade-in duration-500">
			<a
				href="/"
				className="group absolute left-4 flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
				aria-label="Phonaria Lab"
			>
				<Logo className="size-6" />
				<span className="font-display text-sm font-medium opacity-0 blur-[4px] transition-[opacity,filter] duration-200 group-hover:opacity-100 group-hover:blur-[0px]">
					Phonaria
				</span>
			</a>
			<nav className="flex items-center gap-3 text-sm">
				<Link href="/" className={navLinkClass}>
					Transcription
				</Link>
				<NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuItem>
							<NavigationMenuTrigger className="h-auto px-0 py-0 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground focus:bg-transparent data-popup-open:bg-transparent">
								IPA Chart
							</NavigationMenuTrigger>
							<NavigationMenuPositioner>
								<NavigationMenuPopup className="w-40">
									<NavigationMenuContent>
										<NavigationMenuLink render={<Link href="/ipa-chart/consonants" />}>
											Consonants
										</NavigationMenuLink>
										<NavigationMenuLink render={<Link href="/ipa-chart/vowels" />}>
											Vowels
										</NavigationMenuLink>
									</NavigationMenuContent>
								</NavigationMenuPopup>
							</NavigationMenuPositioner>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</nav>
		</header>
	);
}
