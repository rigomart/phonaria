import type { ConsonantArticulation } from "@phonaria/phonetics-data";

const CONSONANT_WORDS: Record<string, string> = {
	voiced: "with the voice on",
	voiceless: "with the voice off",
	bilabial: "with both lips",
	labiodental: "with the top teeth on the lower lip",
	dental: "with the tongue between the teeth",
	alveolar: "with the tongue tip on the gum ridge behind the top teeth",
	postalveolar: "with the tongue just behind the gum ridge",
	palatal: "with the middle of the tongue raised to the roof of the mouth",
	velar: "with the back of the tongue raised",
	"labial-velar": "with rounded lips and the back of the tongue raised",
	glottal: "in the throat",
	plosive: "stopping the air and releasing it",
	fricative: "pushing air through a narrow gap",
	affricate: "stopping the air and releasing it as a hiss",
	nasal: "sending air through the nose",
	approximant: "letting air flow smoothly",
	"lateral-approximant": "letting air flow past the sides of the tongue",
	tap: "tapping the tongue once",
	trill: "letting the tongue vibrate",
};

export type ConsonantFeature = "place" | "manner" | "voicing";

const ALL_FEATURES: readonly ConsonantFeature[] = ["place", "manner", "voicing"];

/**
 * "/θ/ is made with the tongue between the teeth, pushing air through a
 * narrow gap, with the voice off." Says only the `keys` features, in that
 * order; all three by default.
 */
export function describeConsonant(
	ipa: string,
	{ features }: ConsonantArticulation,
	keys: readonly ConsonantFeature[] = ALL_FEATURES,
): string {
	const words = keys.map((key) => CONSONANT_WORDS[features[key]] ?? features[key]);
	return `/${ipa}/ is made ${keys[0] === "manner" ? "by " : ""}${words.join(", ")}.`;
}
