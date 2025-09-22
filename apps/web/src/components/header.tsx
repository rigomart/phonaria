import { AudioLines } from "lucide-react";
import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";

const navigationLinks = [
	{ href: "/", label: "G2P Tool" },
	{ href: "/ipa-chart", label: "IPA Chart" },
	{ href: "/minimal-pairs", label: "Minimal Pairs" },
];

export function Header() {
	return (
		<header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur rounded-b-4xl">
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-center justify-between gap-3">
					<div className="flex flex-1 items-center gap-3">
						<Link
							href="/"
							className="group flex items-center gap-3 rounded-full border border-transparent bg-gradient-to-r from-primary/10 via-primary/10 to-primary/10 px-3 py-2 text-left transition hover:border-primary/40 hover:from-primary/20 hover:via-primary/10 hover:to-primary/20"
						>
							<span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary/20">
								<AudioLines className="size-4" aria-hidden="true" />
							</span>
							<span className="flex leading-tight gap-2 items-center">
								<span className="text-base font-semibold tracking-tight">Phonix</span>
								<Badge variant="secondary" className="hidden whitespace-nowrap md:inline-flex">
									Beta
								</Badge>
							</span>
						</Link>
						
						<nav className="hidden items-center gap-1 md:flex">
							{navigationLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
								>
									{link.label}
								</Link>
							))}
						</nav>
					</div>

						<ModeToggle />
		
				</div>
				<nav className="mt-3 flex gap-2 overflow-x-auto md:hidden">
					{navigationLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>
		</header>
	);
}
