import { tryExtractBasePhonemeId } from "@phonaria/phonetics-data";
import type { TopicDefinition } from "../types";

/**
 * A word qualifies only when every CMU variant contains schwa — if only some
 * variants had it, a learner could dodge the topic sound entirely.
 */
export function everyVariantContainsSchwa(variants: readonly string[]): boolean {
	return (
		variants.length > 0 &&
		variants.every((variant) =>
			variant.split(" ").some((token) => tryExtractBasePhonemeId(token) === "AX"),
		)
	);
}

export const SchwaTopic: TopicDefinition = {
	id: "schwa",
	topicSounds: ["AX"],
	isEligibleWord: everyVariantContainsSchwa,
	slotSpec: [
		{ min: 2, max: 2 },
		{ min: 2, max: 3 },
		{ min: 3, max: 3 },
		{ min: 3, max: 4 },
		{ min: 4, max: null },
	],
	display: {
		kicker: "Practice",
		heading: "Schwa",
		description:
			"Build the sound sequence for five words, then compare each answer with the dictionary pronunciation.",
		startLabel: "Start session",
		topicStatLabel: "schwas matched",
	},
};
