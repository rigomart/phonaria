/**
 * Copy and path for the minimal-pair pages. The pairs and recordings show in
 * every build; speaking practice on them is gated by `FLAG_SPEECH`.
 */
export const MinimalPairActivity = {
	path: "/minimal-pairs",
	/** The contrast catalog behind it covers this accent only. */
	targetAccent: "en-us",
	name: "Minimal pairs",
	/** For the pages, with or without speaking practice. */
	listDescription:
		"Word pairs that differ by one sound, like ship and sheep, for the American English sounds learners often mix up.",
	description:
		"Two words that differ by one sound, like ship and sheep. Say one and find out which came through.",
	speechCheckNotice:
		"Microsoft checks your recording, and Phonaria doesn't keep it. The check can mishear you.",
} as const;
