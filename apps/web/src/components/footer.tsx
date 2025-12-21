import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
	const t = await getTranslations("components.footer");

	const currentYear = new Date().getFullYear();
	const copyrightText = t("copyright", { year: currentYear });

	return (
		<footer className="border-t border-border bg-background">
			<div className="container mx-auto px-4 py-4">
				<div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-sm">
					<nav className="flex gap-4 items-center">
						<Link
							href="/credits"
							className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						>
							{t("links.credits")}
						</Link>
						<a
							href="https://github.com/rigomart/phonaria"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
