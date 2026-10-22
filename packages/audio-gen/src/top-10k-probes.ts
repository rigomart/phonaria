/**
 * Probe words for #353, grouped by the risk each covers. A word in several groups is
 * recorded once, with every reason. A word with forms gets a clip per form.
 */
export const probeGroups: readonly {
	readonly reason: string;
	readonly words: readonly string[];
}[] = [
	{ reason: "rule split, 2 syllables", words: ["something", "never"] },
	{ reason: "rule split, 3 syllables", words: ["company", "understand", "according"] },
	{
		reason: "rule split, 4 syllables",
		words: ["development", "relationship", "california", "everybody"],
	},
	{
		reason: "rule split, 5 syllables",
		words: ["individual", "administration", "opportunities", "significantly"],
	},
	{
		reason: "rule split, 6+ syllables",
		words: ["responsibility", "identification", "simultaneously", "telecommunications"],
	},
	{
		reason: "compound split at one consonant (more.over said mo.reover)",
		words: ["moreover", "whatever", "whenever", "wherever"],
	},
	{
		reason: "function word, rule picks the stressed form",
		words: ["the", "a", "of", "for", "and", "to", "was", "are", "your", "does"],
	},
	{
		reason: "rule keeps an odd first dictionary form",
		words: ["direction", "caribbean", "restaurants", "unusual", "welsh"],
	},
	{ reason: "abbreviation said as words", words: ["etc"] },
	{
		reason: "rule keeps a syllable count others drop",
		words: ["every", "our", "literally", "jewelry", "veteran", "several"],
	},
	{
		reason: "r-coloured vowel or /ɚ/",
		words: [
			"world",
			"first",
			"further",
			"after",
			"number",
			"heart",
			"court",
			"clear",
			"where",
			"sure",
			"fire",
			"power",
		],
	},
	{
		reason: "syllabic consonant",
		words: ["bottle", "button", "little", "rhythm", "mountain", "certain", "prison"],
	},
	{ reason: "rare sound /ʒ/", words: ["usual", "genre", "garage", "pleasure", "asia"] },
	{ reason: "rare sound /ɔɪ/", words: ["choice", "noise", "employ", "loyal"] },
	{ reason: "vowel pair /ɛ/–/æ/", words: ["head", "men", "left", "land", "band", "dance"] },
	{ reason: "vowel pair /ɑ/–/ʌ/", words: ["box", "bodies", "golf", "color", "done", "wondering"] },
	{ reason: "vowel pair /u/–/ʊ/", words: ["move", "truth", "soon", "foot", "took", "looking"] },
	{
		reason: "vowel pair /i/–/ɪ/",
		words: ["feel", "field", "leaving", "still", "living", "sitting"],
	},
	{
		reason: "heteronym, one clip per meaning",
		words: ["read", "lead", "live", "close", "minute", "record"],
	},
	{ reason: '"also said" form', words: ["either", "data", "route", "aunt"] },
	{
		reason: "/t/ ends the stressed syllable so it taps (round 2)",
		words: [
			"data",
			"little",
			"bottle",
			"title",
			"water",
			"literally",
			"veteran",
			"political",
			"united",
			"committee",
			"hospital",
			"writing",
			"daughter",
			"meeting",
		],
	},
	{
		reason: "compound split after the first word's stop (round 2)",
		words: ["whatever", "setup", "backup", "makeup", "pickup", "startup", "weekend", "workout"],
	},
];

/** Reasons per word, in group order. */
export function probeReasons(): Map<string, string[]> {
	const reasons = new Map<string, string[]>();
	for (const { reason, words } of probeGroups) {
		for (const word of words) reasons.set(word, [...(reasons.get(word) ?? []), reason]);
	}
	return reasons;
}
