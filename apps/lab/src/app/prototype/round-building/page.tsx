/**
 * PROTOTYPE ONLY — throwaway route for wayfinder ticket #131.
 *
 * Three variants of the Lab round-building experience — how a learner builds and
 * revises five IPA sound sequences — switchable via `?variant=` on
 * `/prototype/round-building`.
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

export const metadata: Metadata = {
	title: "PROTOTYPE — Round building",
	robots: { index: false, follow: false },
};

const VARIANTS = [
	{ key: "A", name: "Focus — one round, docked keyboard" },
	{ key: "B", name: "Worksheet — all five rounds, chart drawer" },
	{ key: "C", name: "Compose — type-to-build, review step" },
];

export default async function RoundBuildingPrototypePage({
	searchParams,
}: {
	searchParams: Promise<{ variant?: string }>;
}) {
	const { variant } = await searchParams;
	const current = VARIANTS.some((entry) => entry.key === variant) ? variant : "A";

	return (
		<div className="flex flex-1 flex-col bg-background">
			{current === "A" && <VariantA />}
			{current === "B" && <VariantB />}
			{current === "C" && <VariantC />}
			<PrototypeSwitcher current={current as string} variants={VARIANTS} />
		</div>
	);
}
