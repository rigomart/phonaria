import { tryExtractBasePhonemeId } from "@phonaria/phonetics-data";
import type { TopicDefinition } from "../types";

/**
 * A word qualifies only when every CMU variant contains schwa — if only some
 * variants had it, a learner could dodge the target sound entirely.
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
	targetSounds: ["AX"],
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
			"/ə/ is the most common vowel sound in English — and spelling never tells you where it hides. You'll get five words. Build each one's full sound sequence from its sounds, then see how you did at the end.",
		startLabel: "Start session",
	},
	// Stub until the lesson catalog lands (#140, implementation step 9).
	lessonCatalog: [],
};
