import type { Metadata } from "next";
import type { MinimalPairSet } from "shared-data";
import { minimalPairSets } from "shared-data";
import { ContrastSelectorSection } from "./_sections/contrast-selector-section";
import { MinimalPairsExperienceSection } from "./_sections/experience-section";
import { MinimalPairsHeroSection } from "./_sections/hero-section";

type Awaitable<T> = T | Promise<T>;

type MinimalPairsRouteProps = {
	searchParams?: Awaitable<Record<string, string | string[] | undefined>>;
};

function resolveActiveSet(contrastParam: string | string[] | undefined): MinimalPairSet | null {
	const fallback = minimalPairSets[0] ?? null;
	if (!contrastParam) return fallback;

	const value = Array.isArray(contrastParam) ? contrastParam[0] : contrastParam;
	if (!value) return fallback;

	return minimalPairSets.find((set) => set.slug === value || set.id === value) ?? fallback;
}

export const metadata: Metadata = {
	title: "Minimal Pairs Listening Sessions",
	description:
		"Explore curated ESL listening drills that highlight high-impact English minimal pair contrasts with audio, IPA, and articulation cues.",
};

export default async function MinimalPairsRoute({ searchParams }: MinimalPairsRouteProps) {
	const resolvedSearchParams: Record<string, string | string[] | undefined> = searchParams
		? await searchParams
		: {};
	const sets = minimalPairSets;
	const activeSet = resolveActiveSet(resolvedSearchParams.contrast);
	const basePath = "/minimal-pairs";

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col bg-background">
			<MinimalPairsHeroSection />
			<ContrastSelectorSection
				sets={sets}
				activeSetId={activeSet?.id ?? ""}
				basePath={basePath}
				searchParams={resolvedSearchParams}
			/>
			<MinimalPairsExperienceSection activeSet={activeSet} />
		</div>
	);
}
