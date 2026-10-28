import { EnglishPracticeStrut } from "@phonaria/phonetics-data/languages/en/practice";
import { everyVariantContains } from "../every-variant-contains";
import type { TopicDefinition } from "../types";

/** Strut is always stressed, so unlike schwa it occurs in one-syllable words. */
export const StrutTopic: TopicDefinition = {
	id: "strut",
	topicSounds: ["AH"],
	curatedEntries: EnglishPracticeStrut,
	isEligibleWord: everyVariantContains("AH"),
	slotSpec: [
		{ min: 1, max: 1 },
		{ min: 1, max: 1 },
		{ min: 2, max: 2 },
		{ min: 2, max: 3 },
		{ min: 3, max: null },
	],
	display: {
		name: "Strut",
		blurb: "The short, open “uh” of a stressed syllable — schwa’s stronger twin.",
		topicStatLabel: "strut vowels matched",
	},
};
