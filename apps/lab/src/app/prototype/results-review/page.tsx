/**
 * PROTOTYPE ONLY — throwaway route for wayfinder ticket #130.
 *
 * RESOLVED. The scoreboard shape with ALL ROWS EXPANDED (`open`) is the
 * chosen reveal: headline word score, stats, five full word rows on one page,
 * lessons collapsed behind a disclosure, retry footer. The walkthrough and
 * lesson-led structures lost in round 1 (history has them at b02aaee); the
 * mixed and dense row densities lost in round 2 and are kept on the route
 * only as the record of what lost.
 *
 * Deliberately NOT built: real scoring (data is hardcoded per #133's
 * contract), real word audio (speech synthesis stands in), replay rules
 * (#132 — the retry buttons are dead), lesson copy (fog; stand-ins).
 */

import type { Metadata } from "next";
import { PrototypeSwitcher } from "../_components/prototype-switcher";
import { VariantDense } from "./_components/variant-dense";
import { VariantMixed } from "./_components/variant-mixed";
import { VariantOpen } from "./_components/variant-open";
import { VariantScoreboard } from "./_components/variant-scoreboard";

export const metadata: Metadata = {
	title: "PROTOTYPE — Results & review",
	robots: { index: false, follow: false },
};

const VARIANTS = [
	{ key: "open", name: "All rows expanded — CHOSEN" },
	{ key: "mixed", name: "Detail only on mistakes" },
	{ key: "dense", name: "One line per word" },
	{ key: "scoreboard", name: "Round 1 reference — dropdowns" },
];

export default async function ResultsReviewPrototypePage({
	searchParams,
}: {
	searchParams: Promise<{ variant?: string }>;
}) {
	const { variant } = await searchParams;
	const current = VARIANTS.find((entry) => entry.key === variant)?.key ?? "open";

	return (
		<div className="flex flex-1 flex-col bg-background">
			{current === "mixed" && <VariantMixed />}
			{current === "open" && <VariantOpen />}
			{current === "dense" && <VariantDense />}
			{current === "scoreboard" && <VariantScoreboard />}
			<PrototypeSwitcher current={current} variants={VARIANTS} />
		</div>
	);
}
