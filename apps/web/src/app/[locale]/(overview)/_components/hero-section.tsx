import { BarChart3, BookOpen, Mic, Search } from "lucide-react";
import Link from "next/link";

const TOOLS = [
	{
		href: "/transcription",
		icon: Mic,
		label: "Transcription",
		description: "See how any word or sentence is pronounced",
	},
	{
		href: "/ipa-chart",
		icon: BookOpen,
		label: "IPA Reference",
		description: "Browse all English sounds with audio",
	},
	{
		href: "/find-by-sound",
		icon: Search,
		label: "Find by Sound",
		description: "Search words by how they sound",
	},
	{
		href: "/insights",
		icon: BarChart3,
		label: "Insights",
		description: "Statistics on English pronunciation",
	},
];

export function HeroSection() {
	return (
		<section className="rounded-xl p-4">
			<div className="flex flex-col md:flex-row md:items-center gap-4">
				<div className="space-y-1 text-center md:text-left md:shrink-0">
					<h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
						English Phonetics Toolkit
					</h1>
					<p className="text-muted-foreground text-base max-w-md mx-auto md:mx-0">
						Tools to help you understand how English words are pronounced.
					</p>
				</div>

				<div className="grid grid-cols-2 gap-2 flex-1">
					{TOOLS.map((tool) => (
						<Link
							key={tool.href}
							href={tool.href}
							className="group flex flex-col gap-1 p-2 rounded-lg bg-background-soft border hover:border-primary hover:bg-accent transition-all"
						>
							<div className="flex items-center gap-1.5">
								<tool.icon className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
								<span className="font-medium text-xs md:text-sm">{tool.label}</span>
							</div>
							<span className="text-[11px] text-muted-foreground leading-snug hidden md:block">
								{tool.description}
							</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
