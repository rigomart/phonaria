import Link from "next/link";
import { getScopedI18n } from "@/locales/server";

export async function Footer() {
	const t = await getScopedI18n("components.footer");

	const currentYear = new Date().getFullYear();
	const copyrightText = t("copyright", { year: currentYear });

	return (
		<footer className="border-t border-border/40 bg-background">
			<div className="container mx-auto px-4 py-4">
				<div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-sm">
					<nav className="flex gap-4 items-center">
						<Link
							href="/credits"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							{t("links.credits")}
						</Link>
						<a
							href="https://github.com/anthropics/phonaria"
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							{t("links.github")}
						</a>
					</nav>
					<p className="text-xs text-muted-foreground">{copyrightText}</p>
				</div>
			</div>
		</footer>
	);
}
