import { ArrowRight, BookOpenCheck, type LucideIcon, Route, Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { G2PPreview } from "./g2p-preview";
import { IpaChartPreview } from "./ipa-chart-preview";
import { MinimalPairsPreview } from "./minimal-pairs-preview";

export type FeatureCardConfig = {
	id: string;
	name: string;
	tagline: string;
	description: string;
	href: string;
	highlights: string[];
	icon: LucideIcon;
	preview: React.ReactNode;
};

export const featureCards: FeatureCardConfig[] = [
	{
		id: "g2p",
		name: "G2P Studio",
		tagline: "Instant transcription workspace",
		description:
			"Convert custom text to stress-marked IPA and inspect each phoneme with linked references.",
		href: "/",
		highlights: [
			"Handles multi-line text with automatic cleanup",
			"Clickable phoneme chips that explain articulation",
			"Links to dictionary entries when a match is found",
		],
		icon: Sparkles,
		preview: <G2PPreview />,
	},
	{
		id: "ipa-chart",
		name: "IPA Reference Hub",
		tagline: "Interactive chart explorer",
		description:
			"Study General American vowels and consonants with audio, diagrams, and example keywords.",
		href: "/ipa-chart",
		highlights: [
			"Filter vowel or consonant groups for quick focus",
			"Tap any phoneme cell to hear the sound",
			"See example words that feature the target sound",
		],
		icon: BookOpenCheck,
		preview: <IpaChartPreview />,
	},
	{
		id: "minimal-pairs",
		name: "Minimal Pair Labs",
		tagline: "Targeted listening drills",
		description:
			"Contrast similar sounds through curated word pairs with built-in listening support.",
		href: "/minimal-pairs",
		highlights: [
			"Choose from ready-made contrast sets",
			"Hear native audio for each word pair",
			"Add quick notes about what still needs practice",
		],
		icon: Route,
		preview: <MinimalPairsPreview />,
	},
];

export function FeatureCard({ feature }: { feature: FeatureCardConfig }) {
	const Icon = feature.icon;

	return (
		<Card key={feature.id} className="relative overflow-hidden border-border/70 bg-background/80">
			<CardHeader className="gap-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex flex-col gap-2">
						<Badge variant="outline" className="w-fit bg-primary/5 text-primary">
							{feature.tagline}
						</Badge>
						<CardTitle className="text-xl font-semibold text-foreground">{feature.name}</CardTitle>
						<CardDescription className="text-sm leading-relaxed">
							{feature.description}
						</CardDescription>
					</div>
					<span className="rounded-full bg-primary/10 p-3 text-primary">
						<Icon className="size-5" aria-hidden="true" />
					</span>
				</div>
			</CardHeader>
			<CardContent className="grid gap-5">
				<div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background p-4 shadow-inner">
					{feature.preview}
				</div>
				<div className="flex flex-wrap gap-2">
					{feature.highlights.map((highlight) => (
						<Badge key={highlight} variant="secondary" className="rounded-full px-3 py-1 text-xs">
							{highlight}
						</Badge>
					))}
				</div>
			</CardContent>
			<CardFooter className="pt-0">
				<Button asChild variant="ghost" className="px-0 text-primary">
					<Link
						href={feature.href}
						className="group inline-flex items-center gap-2 text-sm font-semibold"
					>
						Open tool
						<ArrowRight
							className="size-4 transition-transform group-hover:translate-x-1"
							aria-hidden="true"
						/>
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
