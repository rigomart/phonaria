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
		name: "Schwa",
		blurb: "The quiet “uh” that unstressed syllables fall back to — English’s most common vowel.",
		topicStatLabel: "schwas matched",
	},
};
