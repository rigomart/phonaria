/** Copy and path for minimal-pair speaking practice, gated by `FLAG_SPEECH`. */
export const MinimalPairActivity = {
	path: "/practice/minimal-pairs",
	name: "Minimal pairs",
	description:
		"Say a word like ship or sheep and find out which sound came through. Pick a pair of sounds to start.",
	privacyNotice: "Recordings go to Microsoft for checking and aren't kept.",
} as const;
