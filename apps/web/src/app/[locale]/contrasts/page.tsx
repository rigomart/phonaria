import type { Metadata } from "next";
import { findSetBySlugOrId, getMinimalPairSets, type MinimalPairSet } from "@/data/contrasts";
import { ContrastsExperienceSection } from "./_sections/experience-section";
import { ContrastsHeroSection } from "./_sections/hero-section";

type Awaitable<T> = T | Promise<T>;

type ContrastsRouteProps = {
	searchParams?: Awaitable<Record<string, string | string[] | undefined>>;
};

const contrastSets = getMinimalPairSets();

function resolveActiveSet(contrastParam: string | string[] | undefined): MinimalPairSet | null {
	const fallback = contrastSets[0] ?? null;
	if (!contrastParam) return fallback;

	const value = Array.isArray(contrastParam) ? contrastParam[0] : contrastParam;
	if (!value) return fallback;

	return findSetBySlugOrId(value) ?? fallback;
}

export const metadata: Metadata = {
	title: "Sound Contrasts Listening Sessions",
	description:
		"Explore curated ESL listening drills that highlight high-impact English sound contrasts with audio, IPA, and articulation cues.",
};

export default async function ContrastsRoute({ searchParams }: ContrastsRouteProps) {
	const resolvedSearchParams: Record<string, string | string[] | undefined> = searchParams
		? await searchParams
		: {};
	const sets = contrastSets;
	const activeSet = resolveActiveSet(resolvedSearchParams.contrast);
	const basePath = "/contrasts";

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col bg-background">
			<ContrastsHeroSection />
			<ContrastsExperienceSection
				sets={sets}
				activeSet={activeSet}
				basePath={basePath}
				searchParams={resolvedSearchParams}
			/>
		</div>
	);
}
