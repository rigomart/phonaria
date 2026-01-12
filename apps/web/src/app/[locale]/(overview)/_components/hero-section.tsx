import { ArrowRight, BarChart3, BookOpen, Mic, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const TOOLS = [
	{
		href: "/transcription",
		icon: Mic,
		key: "transcription",
	},
	{
		href: "/ipa-chart",
		icon: BookOpen,
		key: "ipa-reference",
	},
	{
		href: "/find-by-sound",
		icon: Search,
		key: "find-by-sound",
	},
	{
		href: "/insights",
		icon: BarChart3,
		key: "insights",
	},
] as const;

export async function HeroSection() {
	const t = await getTranslations("overview-page");

	return (
		<section className="rounded-xl p-4">
			<div className="flex flex-col md:flex-row md:items-center gap-4">
				<div className="space-y-3 text-center md:text-left md:shrink-0 max-w-md">
					<h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
						{t("hero.title")}
					</h1>
					<p className="text-muted-foreground text-base max-w-md mx-auto md:mx-0">
						{t("hero.subtitle")}
					</p>
				</div>

				<div className="grid grid-cols-2 gap-2 flex-1">
					{TOOLS.map((tool) => (
						<Link
							key={tool.href}
							href={tool.href}
							className="group relative flex flex-col gap-1 p-2 rounded-lg bg-background-soft border hover:border-primary hover:bg-accent transition-all"
						>
							<div className="flex items-center gap-1.5">
								<tool.icon className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
								<span className="font-medium text-xs md:text-sm">
									{t(`tools.${tool.key}.label`)}
								</span>
							</div>
							<span className="text-[11px] text-muted-foreground leading-snug hidden md:block">
								{t(`tools.${tool.key}.description`)}
							</span>
							<ArrowRight
								className="absolute top-2 right-2 size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
								aria-hidden="true"
							/>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
