import { AudioLines } from "lucide-react";
import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";

const navigationLinks = [
	{ href: "/overview", label: "Overview" },
	{ href: "/", label: "G2P Tool" },
	{ href: "/ipa-chart", label: "IPA Chart" },
	{ href: "/minimal-pairs", label: "Minimal Pairs" },
];

export function Header() {
	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-8">
						<Link
							href="/"
							className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
						>
							<span className="flex size-8 items-center justify-center">
								<AudioLines className="size-5" aria-hidden="true" />
							</span>
							<span className="text-lg font-medium">Phonix</span>
						</Link>

						<nav className="hidden items-center gap-6 md:flex">
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

					<ModeToggle />
				</div>

				<nav className="mt-4 flex gap-4 overflow-x-auto md:hidden">
					{navigationLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>
		</header>
	);
}
