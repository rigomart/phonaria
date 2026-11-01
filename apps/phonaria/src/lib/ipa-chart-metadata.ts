import { getIpaForPhonemeId, getLanguagePhonemeCount } from "@phonaria/phonetics-data";
import { formatPercentage, rankPhonemes } from "@/lib/phoneme-frequency";
import { getSoundName } from "@/lib/sound-pages";

export const IPA_CHART_INDEX_PATH = "/ipa-chart";
export const IPA_CHART_CONSONANTS_PATH = "/ipa-chart/consonants";
export const IPA_CHART_VOWELS_PATH = "/ipa-chart/vowels";
export const IPA_CHART_FREQUENCY_PATH = "/ipa-chart/frequency";

const counts = getLanguagePhonemeCount("en-us");

export const CONSONANTS_PAGE_TITLE = "American English IPA chart: consonants";
export const CONSONANTS_PAGE_HEADING = "American English consonants";
export const CONSONANTS_PAGE_DESCRIPTION = `All ${counts.consonants} consonant sounds of American English in an IPA chart, by where and how they're made. Tap one to see how it's made, its spellings and example words.`;

export const VOWELS_PAGE_TITLE = "American English IPA chart: vowels";
export const VOWELS_PAGE_HEADING = "American English vowels";
export const VOWELS_PAGE_DESCRIPTION = `All ${counts.vowels} vowel sounds of American English in an IPA chart, by where the tongue sits. Tap one to see how it's made, its spellings and example words.`;

export const FREQUENCY_PAGE_TITLE = "How common each American English sound is";
export const FREQUENCY_PAGE_HEADING = "How common each sound is";
export const FREQUENCY_PAGE_DESCRIPTION = describeFrequencyPage();

function describeFrequencyPage(): string {
	const [top] = rankPhonemes("en-us");
	if (!top) throw new Error("en-us has no sound frequency data.");
	const sound = `The ${getSoundName(top.phonemeId)} /${getIpaForPhonemeId(top.phonemeId)}/`;
	return `How often each of the ${counts.total} sounds of American English comes up in everyday speech. ${sound} is the most common, at ${formatPercentage(top.percentage)}.`;
}
