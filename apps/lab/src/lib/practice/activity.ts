/**
 * Copy about the activity itself, identical whatever sound a topic teaches.
 * It lives here rather than on `TopicDefinition` so the picker does not put
 * the same sentence on every card.
 */
export const PracticeActivity = {
	name: "Practice",
	description:
		"Build the sound sequence for five words, then compare each answer with the dictionary pronunciation.",
	startLabel: "Start session",
} as const;
