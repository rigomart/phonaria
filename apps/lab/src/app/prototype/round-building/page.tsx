/**
 * PROTOTYPE ONLY — throwaway route for wayfinder ticket #131.
 *
 * Round 4. Central and bottom placement both read well; the side rail and the
 * scrolling strip are gone. What is left is a clean 2x2 over the two surviving
 * ideas:
 *
 *              recessed glyphs   bordered keys
 *   central     center-ghost      center-keys
 *   bottom      bottom-ghost      bottom-keys
 *
 * `bottom-ghost` is the cross that wasn't built before — the recessed treatment
 * at the pinned placement — and is the default.
 *
 * Everything else is held constant: C's page (clickable dots, big word,
 * type-to-build field), identical navigation, and the same pre-submit check.
 *
 * Deliberately NOT built: session generation, CMU lookup, answer checking,
 * scoring, results, lessons, replay. The words and their syllable counts are
 * hardcoded. This prototype only answers the interaction question.
 */

import type { Metadata } from "next";
import { PrototypeSwitcher } from "../_components/prototype-switcher";
import { VariantBottom } from "./_components/variant-bottom";
import { VariantCenter } from "./_components/variant-center";

export const metadata: Metadata = {
	title: "PROTOTYPE — Round building",
	robots: { index: false, follow: false },
};

const VARIANTS = [
	{ key: "bottom-ghost", name: "Bottom pane, recessed glyphs" },
	{ key: "bottom-keys", name: "Bottom pane, bordered keys" },
	{ key: "center-ghost", name: "Central panel, recessed glyphs" },
	{ key: "center-keys", name: "Central panel, bordered keys" },
];

export default async function RoundBuildingPrototypePage({
	searchParams,
}: {
	searchParams: Promise<{ variant?: string }>;
}) {
	const { variant } = await searchParams;
	const current = VARIANTS.some((entry) => entry.key === variant)
		? (variant as string)
		: "bottom-ghost";

	return (
		<div className="flex flex-1 flex-col bg-background">
			{current === "bottom-ghost" && <VariantBottom treatment="ghost" />}
			{current === "bottom-keys" && <VariantBottom treatment="keys" />}
			{current === "center-ghost" && <VariantCenter treatment="ghost" />}
			{current === "center-keys" && <VariantCenter treatment="keys" />}
			<PrototypeSwitcher current={current} variants={VARIANTS} />
		</div>
	);
}
