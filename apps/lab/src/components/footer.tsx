import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";

export function Footer() {
	return (
		<footer className="animate-in fade-in duration-700 delay-300 fill-mode-both motion-reduce:animate-none">
			<div className="container mx-auto px-4 py-3">
				<div className="flex flex-col sm:flex-row gap-3 justify-between items-center text-sm">
					<nav className="flex gap-4 items-center">
						<Link
							href="/credits"
							className="rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							Credits
						</Link>
						<a
							href="https://github.com/rigomart/phonaria"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							GitHub
						</a>
					</nav>
					<div className="flex items-center gap-4">
						<ThemeSwitcher />
						<p className="text-xs text-muted-foreground">
							&copy; {new Date().getFullYear()} Phonaria
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
