import {
	LEARNING_STAGE_DESCRIPTIONS,
	LEARNING_STAGE_LABELS,
	LEARNING_STAGE_ORDER,
} from "@/data/contrasts";

const stageSummaries = LEARNING_STAGE_ORDER.map((stage) => ({
	stage,
	label: LEARNING_STAGE_LABELS[stage],
	description: LEARNING_STAGE_DESCRIPTIONS[stage],
})).filter((summary) => summary.description);

export function ContrastsHeroSection() {
	return (
		<section className="border-b bg-muted/10">
			<div className="container mx-auto px-4 py-12 lg:px-6">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
					<div className="flex flex-col gap-5">
						<div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
							<span className="h-1.5 w-1.5 rounded-full bg-primary" />
							<span>Sound Contrasts</span>
						</div>
						<h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
							Use contrast sets to tighten your listening drills
						</h1>
						<p className="text-base leading-relaxed text-muted-foreground">
							This hub organises minimal-pair practice into staged sets. Each one keeps the word
							list short, surfaces the exact phonemes that shift, and links back to articulation
							reminders.
						</p>
						<div className="rounded-xl border border-dashed border-border/50 bg-background/70 p-4 text-sm leading-relaxed text-muted-foreground">
							<p className="font-semibold text-foreground">How to use this page</p>
							<ol className="mt-2 space-y-2 text-sm">
								<li>
									<strong className="text-foreground">1.</strong> Pick a stage that matches what you
									need right now—Foundation first, then move forward once those contrasts feel
									solid.
								</li>
								<li>
									<strong className="text-foreground">2.</strong> Play each word pair, repeat aloud,
									and note which cues (length, jaw, voicing) separate the sounds.
								</li>
								<li>
									<strong className="text-foreground">3.</strong> Jump into the articulation
									snapshot if a pair still blends, then loop back to the audio.
								</li>
							</ol>
						</div>
					</div>

					<div className="rounded-2xl border border-border/60 bg-card/85 p-5 shadow-sm">
						<h2 className="text-sm font-semibold text-foreground">Stage roadmap</h2>
						<p className="mt-1 text-xs text-muted-foreground">
							Use this as a quick reference for where to focus next.
						</p>
						<ol className="mt-4 space-y-3">
							{stageSummaries.map((summary) => (
								<li
									key={summary.stage}
									className="rounded-xl border border-dashed border-muted-foreground/40 bg-background/80 p-3"
								>
									<p className="text-sm font-semibold text-foreground">{summary.label}</p>
									{summary.description ? (
										<p className="mt-1 text-xs text-muted-foreground">{summary.description}</p>
									) : null}
								</li>
							))}
						</ol>
					</div>
				</div>
			</div>
		</section>
	);
}
