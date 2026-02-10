import { BarChart3, BookOpen, Mic, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const TOOLS = [
	{ href: "/transcription", icon: Mic, key: "transcription" },
	{ href: "/ipa-chart", icon: BookOpen, key: "ipa-reference" },
	{ href: "/find-by-sound", icon: Search, key: "find-by-sound" },
	{ href: "/insights", icon: BarChart3, key: "insights" },
] as const;

export async function HeroSection() {
	const t = await getTranslations("overview-page");

	return (
		<section>
			<div className="mb-5">
				<h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t("hero.title")}</h1>
				<p className="mt-1.5 text-muted-foreground text-sm max-w-lg">{t("hero.subtitle")}</p>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{TOOLS.map((tool) => (
					<Link
						key={tool.href}
						href={tool.href}
						className="group flex flex-col gap-2 p-3.5 rounded-xl bg-background border hover:border-primary hover:shadow-sm transition-all"
					>
						<div className="flex items-center gap-2">
							<div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
								<tool.icon className="size-3.5 text-muted-foreground" />
							</div>
							<span className="text-sm font-medium group-hover:text-primary transition-colors">
								{t(`tools.${tool.key}.label`)}
							</span>
						</div>
						<p className="text-xs text-muted-foreground leading-snug">
							{t(`tools.${tool.key}.description`)}
						</p>
						<div className="mt-auto pt-2 border-t text-xs text-muted-foreground font-mono truncate">
							{t(`tools.${tool.key}.preview`)}
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
