"use client";

import type { MinimalPairSet } from "@/data/contrasts";
import { ContrastDetail } from "../_components/contrast-detail";
import { ContrastSelectorSection } from "./contrast-selector-section";

interface ContrastsExperienceSectionProps {
	sets: MinimalPairSet[];
	activeSet: MinimalPairSet | null;
	basePath: string;
	searchParams?: Record<string, string | string[] | undefined>;
}

export function ContrastsExperienceSection({
	sets,
	activeSet,
	basePath,
	searchParams,
}: ContrastsExperienceSectionProps) {
	if (!sets.length) {
		return (
			<section className="border-t bg-muted/20">
				<div className="container mx-auto px-4 py-16">
					<p className="text-center text-sm text-muted-foreground">
						No contrast data is available yet. Check back soon.
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="border-t bg-muted/15">
			<div className="container mx-auto grid gap-6 px-4 py-10 lg:grid-cols-[minmax(0,260px)_1fr] lg:items-start lg:gap-10 xl:px-6">
				<aside className="lg:max-h-[80vh] lg:overflow-y-auto lg:pr-2 lg:sticky lg:top-24">
					<ContrastSelectorSection
						sets={sets}
						activeSetId={activeSet?.id ?? ""}
						basePath={basePath}
						searchParams={searchParams}
					/>
				</aside>
				<main className="flex w-full min-h-0 flex-col gap-6">
					{activeSet ? (
						<ContrastDetail set={activeSet} />
					) : (
						<div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
							Select a contrast set to begin listening practice.
						</div>
					)}
				</main>
			</div>
		</section>
	);
}
