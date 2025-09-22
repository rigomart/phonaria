import type { MinimalPairSet } from "shared-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticulationPanel } from "./articulation-panel";
import { PairCard } from "./pair-card";

interface ContrastDetailProps {
	set: MinimalPairSet;
}

export function ContrastDetail({ set }: ContrastDetailProps) {
	return (
		<section id="minimal-pair-contrast" className="flex flex-col gap-8">
			<Card className="border-primary/30 bg-card shadow-sm">
				<CardHeader className="gap-4 pb-4">
					<div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
						<span className="h-1.5 w-1.5 rounded-full bg-primary" />
						<span>{set.category} contrast</span>
					</div>
					<CardTitle className="text-2xl font-semibold text-balance lg:text-3xl">
						{set.title}
					</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">
						Focus on {set.focusPhonemes.join(" and ")} to tune your ear to the difference.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 text-sm text-muted-foreground">
					{set.description ? <p className="max-w-2xl">{set.description}</p> : null}
					{set.l1Notes ? (
						<p className="max-w-2xl rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 p-3 text-xs">
							{set.l1Notes}
						</p>
					) : null}
				</CardContent>
			</Card>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
				{set.pairs.map((pair) => (
					<PairCard key={pair.id} pair={pair} />
				))}
			</div>
			<ArticulationPanel set={set} />
		</section>
	);
}
