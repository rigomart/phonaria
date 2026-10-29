/** Copy and path for minimal-pair speaking practice, gated by `FLAG_SPEECH`. */
export const MinimalPairActivity = {
	path: "/minimal-pairs",
	/** The contrast catalog behind it covers this accent only. */
	targetAccent: "en-us",
	name: "Minimal pairs",
	description:
		"Two words that differ by one sound, like ship and sheep. Say one and find out which came through.",
	privacyNotice: "Recordings go to Microsoft for checking and aren't kept.",
} as const;
