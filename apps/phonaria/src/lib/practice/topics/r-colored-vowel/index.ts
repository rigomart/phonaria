import { EnglishPracticeRColoredVowel } from "@phonaria/phonetics-data/languages/en/practice";
import { everyVariantContains } from "../every-variant-contains";
import type { TopicDefinition } from "../types";

/** ER is stressed /ɝ/ and unstressed /ɚ/ alike, so one-syllable words carry it too. */
export const RColoredVowelTopic: TopicDefinition = {
	id: "r-colored-vowel",
	topicSounds: ["ER"],
	curatedEntries: EnglishPracticeRColoredVowel,
	isEligibleWord: everyVariantContains("ER"),
	slotSpec: [
		{ min: 1, max: 1 },
		{ min: 1, max: 2 },
		{ min: 2, max: 2 },
		{ min: 2, max: 3 },
		{ min: 3, max: null },
	],
	display: {
		name: "R-colored vowel",
		blurb: "A vowel and an r said as one sound — strong in “bird”, quiet at the end of “water”.",
		topicStatLabel: "r-colored vowels matched",
	},
};
