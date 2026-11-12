/**
 * Copy and path for the minimal-pair pages. The pairs and recordings show in
 * every build; speaking practice on them is gated by `FLAG_SPEECH`.
 */
export const MinimalPairActivity = {
	path: "/minimal-pairs",
	/** The contrast catalog behind it covers this accent only. */
	targetAccent: "en-us",
	name: "Minimal pairs",
	/** For the pages, with or without speaking practice; `first` and `second` name the example pair, with their IPA. */
	listDescription: (first: string, second: string) =>
		`Word pairs that differ by one sound, like ${first} and ${second}, for the American English sounds learners often mix up.`,
	description: (first: string, second: string) =>
		`Two words that differ by one sound, like ${first} and ${second}.`,
	speechCheckNotice:
		"Your recording goes to Microsoft for the check and isn't kept after. The check can be wrong.",
} as const;
