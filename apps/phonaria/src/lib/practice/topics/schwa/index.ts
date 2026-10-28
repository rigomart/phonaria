import { EnglishPracticeSchwa } from "@phonaria/phonetics-data/languages/en/practice";
import { everyVariantContains } from "../every-variant-contains";
import type { TopicDefinition } from "../types";

export const everyVariantContainsSchwa = everyVariantContains("AX");

export const SchwaTopic: TopicDefinition = {
	id: "schwa",
	topicSounds: ["AX"],
	curatedEntries: EnglishPracticeSchwa,
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
