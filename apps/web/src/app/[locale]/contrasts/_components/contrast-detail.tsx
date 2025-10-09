import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LEARNING_STAGE_LABELS, type MinimalPairSet } from "@/data/contrasts";
import { ArticulationPanel } from "./articulation-panel";
import { PairCard } from "./pair-card";

interface ContrastDetailProps {
	set: MinimalPairSet;
}

export function ContrastDetail({ set }: ContrastDetailProps) {
	const stageLabel = LEARNING_STAGE_LABELS[set.learningStage];

	return (
		<section id="contrast-overview" className="flex flex-col gap-8">
			<Card className="border-primary/30 bg-card shadow-sm">
				<CardHeader className="gap-3 pb-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
							{stageLabel}
						</Badge>
						<span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
							{set.category} contrast
						</span>
					</div>
					<CardTitle className="text-2xl font-semibold text-balance lg:text-3xl">
						{set.title}
					</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">{set.summary}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 text-sm text-muted-foreground">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
						Focus: {set.focusPhonemes.join(" vs ")}
					</p>
					{set.description ? <p className="max-w-2xl">{set.description}</p> : null}
					{set.l1Notes ? (
						<p className="max-w-2xl rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 p-3 text-xs">
							{set.l1Notes}
						</p>
					) : null}
				</CardContent>
			</Card>
			<PairCard set={set} />
			<ArticulationPanel set={set} />
		</section>
	);
}
