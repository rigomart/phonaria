/**
 * PROTOTYPE ONLY — throwaway route for wayfinder ticket #130.
 *
 * Three variants of the post-submit reveal, switchable via `?variant=`:
 * how a submitted session shows the word score, phoneme-level corrections,
 * audio, mistake-relevant schwa teaching, and retry — without overwhelming
 * an IPA beginner.
 *
 * Deliberately NOT built: real scoring (data is hardcoded per #133's
 * contract), real word audio (speech synthesis stands in), replay rules
 * (#132 — the retry buttons are dead), lesson copy (fog; stand-ins).
 */

import type { Metadata } from "next";
import { PrototypeSwitcher } from "../_components/prototype-switcher";
import { VariantLessonLed } from "./_components/variant-lesson-led";
import { VariantScoreboard } from "./_components/variant-scoreboard";
import { VariantWalkthrough } from "./_components/variant-walkthrough";

export const metadata: Metadata = {
	title: "PROTOTYPE — Results & review",
	robots: { index: false, follow: false },
};

const VARIANTS = [
	{ key: "scoreboard", name: "Scoreboard — drill down" },
	{ key: "walkthrough", name: "Walkthrough — word by word" },
	{ key: "lesson", name: "Lesson-led — debrief" },
];

export default async function ResultsReviewPrototypePage({
	searchParams,
}: {
	searchParams: Promise<{ variant?: string }>;
}) {
	const { variant } = await searchParams;
	const current = VARIANTS.find((entry) => entry.key === variant)?.key ?? "scoreboard";

	return (
		<div className="flex flex-1 flex-col bg-background">
			{current === "scoreboard" && <VariantScoreboard />}
			{current === "walkthrough" && <VariantWalkthrough />}
			{current === "lesson" && <VariantLessonLed />}
			<PrototypeSwitcher current={current} variants={VARIANTS} />
		</div>
	);
}
