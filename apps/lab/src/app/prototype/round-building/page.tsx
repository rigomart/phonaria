/**
 * PROTOTYPE ONLY — throwaway route for wayfinder ticket #131.
 *
 * Variants of the Lab round-building experience — how a learner builds and
 * revises five IPA sound sequences — switchable via `?variant=` on
 * `/prototype/round-building`.
 *
 * Round 2: C won the first pass, so C and C2 are now two nav models over the
 * same refined base (always-visible IPA panel, pre-submit check, no
 * "review all answers" button). A and B are kept for reference only.
 *
 * Deliberately NOT built: session generation, CMU lookup, answer checking,
 * scoring, results, lessons, replay. The words and their syllable counts are
 * hardcoded. This prototype only answers the interaction question.
 */

import type { Metadata } from "next";
import { PrototypeSwitcher } from "../_components/prototype-switcher";
import { VariantA } from "./_components/variant-a";
import { VariantB } from "./_components/variant-b";
import { VariantC } from "./_components/variant-c";
import { VariantC2 } from "./_components/variant-c2";

export const metadata: Metadata = {
	title: "PROTOTYPE — Round building",
	robots: { index: false, follow: false },
};

const VARIANTS = [
	{ key: "C", name: "Stepper — Back / Next word / Finish" },
	{ key: "C2", name: "Word rail — pick a word, finish any time" },
	{ key: "A", name: "Focus — docked keyboard (superseded)" },
	{ key: "B", name: "Worksheet — chart drawer (superseded)" },
];

export default async function RoundBuildingPrototypePage({
	searchParams,
}: {
	searchParams: Promise<{ variant?: string }>;
}) {
	const { variant } = await searchParams;
	const current = VARIANTS.some((entry) => entry.key === variant) ? (variant as string) : "C";

	return (
		<div className="flex flex-1 flex-col bg-background">
			{current === "C" && <VariantC />}
			{current === "C2" && <VariantC2 />}
			{current === "A" && <VariantA />}
			{current === "B" && <VariantB />}
			<PrototypeSwitcher current={current} variants={VARIANTS} />
		</div>
	);
}
