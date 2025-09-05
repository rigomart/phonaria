import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
	return (
		<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-6">
						<Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
							Phonix
						</Link>
						<nav className="hidden md:flex items-center gap-4">
							<Link href="/" className="text-sm hover:text-primary transition-colors">
								G2P Tool
							</Link>
							<Link href="/ipa-chart" className="text-sm hover:text-primary transition-colors">
								IPA Chart
							</Link>
						</nav>
					</div>
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}
