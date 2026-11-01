import type {
	ConsonantArticulation,
	DiphthongVowelArticulation,
	MonophthongVowelArticulation,
} from "@phonaria/phonetics-data";

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

const VOWEL_HEIGHT_WORDS: Record<string, string> = {
	close: "high",
	"near-close": "fairly high",
	"close-mid": "halfway up",
	mid: "halfway up",
	"open-mid": "fairly low",
	"near-open": "low",
	open: "very low",
};

const VOWEL_BACKNESS_WORDS: Record<string, string> = {
	front: "toward the front",
	"near-front": "toward the front",
	central: "in the middle",
	"near-back": "toward the back",
	back: "toward the back",
};

function tongue(height: string, backness: string, separator = " and "): string {
	return `${VOWEL_HEIGHT_WORDS[height] ?? height}${separator}${VOWEL_BACKNESS_WORDS[backness] ?? backness}`;
}

function lips(roundness: string): string {
	return roundness === "rounded" ? "the lips rounded" : "the lips relaxed";
}

/**
 * "/i/ is made with the tongue high and toward the front, and the lips
 * relaxed." A diphthong says where the glide starts and ends, and the lips
 * where they are rounded or change.
 */
export function describeVowel(
	ipa: string,
	articulation: MonophthongVowelArticulation | DiphthongVowelArticulation,
): string {
	const { features } = articulation;
	if (articulation.vowelType === "monophthong") {
		const r = articulation.features.rhoticity === "r-colored" ? ", bunched up as for r" : "";
		return `/${ipa}/ is made with the tongue ${tongue(features.height, features.backness)}${r}, and ${lips(features.roundness)}.`;
	}
	const { targetHeight, targetBackness, targetRoundness } = articulation.features;
	const lipWords =
		targetRoundness !== features.roundness
			? targetRoundness === "rounded"
				? ", rounding the lips"
				: ", relaxing the lips"
			: features.roundness === "rounded"
				? ", with the lips rounded"
				: "";
	return `/${ipa}/ starts with the tongue ${tongue(features.height, features.backness, ", ")}, and glides to ${tongue(targetHeight, targetBackness, ", ")}${lipWords}.`;
}
