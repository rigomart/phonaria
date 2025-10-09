import { Badge } from "@/components/ui/badge";
import {
	LEARNING_STAGE_DESCRIPTIONS,
	LEARNING_STAGE_LABELS,
	LEARNING_STAGE_ORDER,
	type MinimalPairSet,
} from "@/data/contrasts";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface ContrastSelectorSectionProps {
	sets: MinimalPairSet[];
	activeSetId: string;
	basePath: string;
	searchParams?: Record<string, string | string[] | undefined>;
}

export function ContrastSelectorSection({
	sets,
	activeSetId,
	basePath,
	searchParams,
}: ContrastSelectorSectionProps) {
	const groupedSets = LEARNING_STAGE_ORDER.map((stage) => ({
		stage,
		label: LEARNING_STAGE_LABELS[stage],
		description: LEARNING_STAGE_DESCRIPTIONS[stage],
		items: sets.filter((set) => set.learningStage === stage),
	})).filter((group) => group.items.length);

	const sanitizedSearchParams = Object.fromEntries(
		Object.entries(searchParams ?? {}).filter(([, value]) => value !== undefined),
	);

	return (
		<nav
			aria-label="Sound contrast stages"
			className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm lg:p-5"
		>
			<div className="space-y-2 border-b border-border/50 pb-4">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
					Contrast Roadmap
				</p>
				<h2 className="text-base font-semibold leading-tight text-foreground">
					Work through stages in order
				</h2>
				<p className="text-xs text-muted-foreground">
					Start with core vowel contrasts, then move into targeted consonant work as you gain
					confidence.
				</p>
			</div>

			<div className="mt-5 space-y-6">
				{groupedSets.map((group) => (
					<div key={group.stage} className="space-y-3">
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
								{group.label}
							</p>
							{group.description ? (
								<p className="mt-1 text-xs text-muted-foreground/80">{group.description}</p>
							) : null}
						</div>
						<div className="space-y-2">
							{group.items.map((set) => {
								const isActive = activeSetId === set.id;
								const query = {
									...sanitizedSearchParams,
									contrast: set.slug,
								} satisfies Record<string, string | string[]>;

								return (
									<Link
										key={set.id}
										href={{ pathname: basePath, query }}
										scroll={false}
										className={cn(
											"group flex flex-col gap-2 rounded-xl border px-4 py-3 transition",
											"hover:border-primary/60 hover:bg-primary/5",
											isActive
												? "border-primary bg-primary/10 shadow-sm"
												: "border-border bg-background/80",
										)}
									>
										<div className="flex items-start justify-between gap-3">
											<div className="flex flex-col gap-1">
												<p className="text-sm font-semibold leading-tight text-foreground">
													{set.title}
												</p>
												<p className="text-xs text-muted-foreground">{set.summary}</p>
											</div>
											<Badge
												variant="secondary"
												className="mt-0.5 text-[10px] uppercase tracking-wide"
											>
												{set.category}
											</Badge>
										</div>
									</Link>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</nav>
	);
}
