import type { Metadata } from "next";
import { MinimalPairsExperienceSection } from "./_sections/experience-section";
import { ContrastSelectorSection } from "./_sections/contrast-selector-section";
import { MinimalPairsHeroSection } from "./_sections/hero-section";

export const metadata: Metadata = {
	title: "Minimal Pairs Listening Sessions",
	description:
		"Explore curated ESL listening drills that highlight high-impact English minimal pair contrasts with audio, IPA, and articulation cues.",
};

export default function MinimalPairsRoute() {
	return (
		<div className="flex h-full min-h-0 flex-1 flex-col bg-background">
			<MinimalPairsHeroSection />
			<ContrastSelectorSection />
			<MinimalPairsExperienceSection />
		</div>
	);
}
