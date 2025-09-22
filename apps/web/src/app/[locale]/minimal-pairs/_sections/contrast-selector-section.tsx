"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMinimalPairSelection } from "../_hooks/use-minimal-pair-selection";

export function ContrastSelectorSection() {
	const { sets, activeSetId, selectContrast } = useMinimalPairSelection();

	return (
		<section className="border-b bg-card/40">
			<div className="container mx-auto flex flex-col gap-4 px-4 py-6 xl:px-6">
				<div className="flex flex-col gap-2">
					<h2 className="text-base font-semibold leading-tight">Choose a contrast to explore</h2>
					<p className="text-sm text-muted-foreground">
						Select a minimal pair set to review listening examples, IPA cues, and short articulation reminders.
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					{sets.map((set) => (
						<button
							key={set.id}
							type="button"
							onClick={() => selectContrast(set.id)}
							className={cn(
								"flex min-h-[4.5rem] flex-1 flex-col justify-between gap-1 rounded-xl border px-4 py-3 text-left transition sm:flex-row sm:items-center sm:gap-3",
								"lg:flex-none lg:min-w-[280px] lg:max-w-[320px]",
								"hover:border-primary/60 hover:bg-primary/5",
								activeSetId === set.id
									? "border-primary bg-primary/10 shadow-sm"
									: "border-border bg-card",
							)}
						>
							<div className="flex flex-col gap-1">
								<div className="text-sm font-semibold leading-tight sm:text-base">{set.title}</div>
								<p className="text-xs text-muted-foreground sm:text-sm">{set.summary}</p>
								<div className="flex flex-wrap gap-2 pt-1 text-[10px] text-muted-foreground sm:text-[11px]">
									{set.tags.slice(0, 2).map((tag) => (
										<Badge key={`${set.id}-${tag}`} variant="outline">
											{tag}
										</Badge>
									))}
								</div>
							</div>
							<Badge
								variant="secondary"
								className="self-start text-[10px] uppercase tracking-wide sm:self-center"
							>
								{set.category}
							</Badge>
						</button>
					))}
				</div>
			</div>
		</section>
	);
}
