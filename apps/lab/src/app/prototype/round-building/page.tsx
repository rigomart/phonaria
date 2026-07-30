/**
 * PROTOTYPE ONLY — throwaway route for wayfinder ticket #131.
 *
 * Round 5. Settled: C's page, and the palette as a CENTRAL panel of BORDERED
 * KEYS in the page flow. The bottom pane, the side rail, the scrolling strip and
 * the recessed treatment are all decided against.
 *
 * The only thing still varying is how hard the consonant/vowel boundary is
 * pushed. Each variant uses a different mechanism, so they can be compared
 * without anything else moving.
 *
 * Deliberately NOT built: session generation, CMU lookup, answer checking,
 * scoring, results, lessons, replay. The words and their syllable counts are
 * hardcoded. This prototype only answers the interaction question.
 */

import type { Metadata } from "next";
import { PrototypeSwitcher } from "../_components/prototype-switcher";
import { type Separation, SessionScreen } from "./_components/session-screen";

export const metadata: Metadata = {
	title: "PROTOTYPE — Round building",
	robots: { index: false, follow: false },
};

const VARIANTS: { key: Separation; name: string }[] = [
	{ key: "labels", name: "Group headings" },
	{ key: "rule", name: "Hairline rule" },
	{ key: "tint", name: "Vowels tinted" },
	{ key: "tint-labels", name: "Vowels tinted + headings" },
];

export default async function RoundBuildingPrototypePage({
	searchParams,
}: {
	searchParams: Promise<{ variant?: string }>;
}) {
	const { variant } = await searchParams;
	const match = VARIANTS.find((entry) => entry.key === variant);
	const current = match?.key ?? "labels";

	return (
		<div className="flex flex-1 flex-col bg-background">
			<SessionScreen separation={current} />
			<PrototypeSwitcher current={current} variants={VARIANTS} />
		</div>
	);
}
