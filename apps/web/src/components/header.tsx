import { AudioLines } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

const navigationLinks = [
	{ href: "/overview", label: "Overview" },
	{ href: "/", label: "Transcription" },
	{ href: "/contrasts", label: "Contrasts" },
	{ href: "/ipa-chart", label: "IPA Reference" },
];

export function Header() {
	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background">
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-6">
						<Link
							href="/"
							className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
						>
							<span className="flex size-6 items-center justify-center">
								<AudioLines className="size-4" aria-hidden="true" />
							</span>
							<span className="text-base font-medium">Phonix</span>
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

					<ModeToggle />
				</div>

				<nav className="mt-3 flex gap-3 overflow-x-auto md:hidden">
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
