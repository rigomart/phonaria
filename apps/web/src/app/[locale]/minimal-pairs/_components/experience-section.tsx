"use client";

import { ContrastDetail } from "./contrast-detail";
import { useMinimalPairSelection } from "../_hooks/use-minimal-pair-selection";

export function MinimalPairsExperienceSection() {
	const { activeSet } = useMinimalPairSelection();

	if (!activeSet) {
		return (
			<section className="border-t bg-muted/20">
				<div className="container mx-auto px-4 py-16">
					<p className="text-center text-sm text-muted-foreground">
						No minimal pairs available yet.
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="border-t bg-muted/15">
			<div className="container mx-auto flex flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start lg:gap-10 xl:px-6">
				<main className="flex w-full min-h-0 flex-col gap-6">
					<ContrastDetail set={activeSet} />
				</main>
			</div>
		</section>
	);
}
