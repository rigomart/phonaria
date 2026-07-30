/**
 * PROTOTYPE ONLY — throwaway route for wayfinder ticket #131.
 *
 * Round 3. The first pass picked C — search-first, calm, centred — so all four
 * variants here ARE C. They keep its page (clickable dots, big word, type-to-
 * build field, pre-submit check) and its navigation, and disagree about exactly
 * one thing: where the always-visible IPA palette lives and how much visual
 * weight it is allowed to carry.
 *
 * Deliberately NOT built: session generation, CMU lookup, answer checking,
 * scoring, results, lessons, replay. The words and their syllable counts are
 * hardcoded. This prototype only answers the interaction question.
 */

import type { Metadata } from "next";
import { PrototypeSwitcher } from "../_components/prototype-switcher";
import { VariantDock } from "./_components/variant-dock";
import { VariantGhost } from "./_components/variant-ghost";
import { VariantSplit } from "./_components/variant-split";
import { VariantStrip } from "./_components/variant-strip";

export const metadata: Metadata = {
	title: "PROTOTYPE — Round building",
	robots: { index: false, follow: false },
};

const VARIANTS = [
	{ key: "ghost", name: "Palette recessed, no card" },
	{ key: "strip", name: "Palette as one scrolling line" },
	{ key: "dock", name: "Palette as keyboard chrome" },
	{ key: "split", name: "Palette as a side rail" },
];

export default async function RoundBuildingPrototypePage({
	searchParams,
}: {
	searchParams: Promise<{ variant?: string }>;
}) {
	const { variant } = await searchParams;
	const current = VARIANTS.some((entry) => entry.key === variant) ? (variant as string) : "ghost";

	return (
		<div className="flex flex-1 flex-col bg-background">
			{current === "ghost" && <VariantGhost />}
			{current === "strip" && <VariantStrip />}
			{current === "dock" && <VariantDock />}
			{current === "split" && <VariantSplit />}
			<PrototypeSwitcher current={current} variants={VARIANTS} />
		</div>
	);
}
