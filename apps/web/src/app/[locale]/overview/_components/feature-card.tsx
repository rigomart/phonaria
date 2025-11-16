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
import { PhonemeInspectorPreview } from "./phoneme-inspector-preview";

export type FeatureCardId = "g2p" | "inspector" | "ipa-chart";

export type FeatureCardConfig = {
id: FeatureCardId;
href: string;
icon: LucideIcon;
preview: React.ReactNode;
};

export type FeatureCardCopy = {
name: string;
tagline: string;
description: string;
highlights: string[];
actionLabel: string;
};

export const featureCards: FeatureCardConfig[] = [
{
id: "g2p",
href: "/",
icon: Sparkles,
preview: <G2PPreview />,
},
{
id: "inspector",
href: "/#phoneme-inspector",
icon: Route,
preview: <PhonemeInspectorPreview />,
},
{
id: "ipa-chart",
href: "/ipa-chart",
icon: BookOpenCheck,
preview: <IpaChartPreview />,
},
];

export function FeatureCard({ feature, copy }: { feature: FeatureCardConfig; copy: FeatureCardCopy }) {
const Icon = feature.icon;

return (
<Card key={feature.id} className="relative overflow-hidden border-border/70 bg-background/80">
<CardHeader className="gap-4">
<div className="flex items-start justify-between gap-4">
<div className="flex flex-col gap-2">
<Badge variant="outline" className="w-fit bg-primary/5 text-primary">
{copy.tagline}
</Badge>
<CardTitle className="text-xl font-semibold text-foreground">{copy.name}</CardTitle>
<CardDescription className="text-sm leading-relaxed">{copy.description}</CardDescription>
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
{copy.highlights.map((highlight) => (
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
{copy.actionLabel}
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
