import { getLanguagePhonemeCount } from "@phonaria/phonetics-data";
import { parseSoundsParam, soundsToIpa } from "@/lib/sound-search/search";

export const HOME_PAGE_TITLE = "English to IPA transcription for American English";
export const HOME_PAGE_DESCRIPTION = `See how any English word or sentence is pronounced in American English, in IPA, sound by sound, with recordings. Plus an IPA chart and all ${getLanguagePhonemeCount("en-us").total} sounds.`;

export const SEARCH_PATH = "/search";

type SearchPageSource = { q?: string; sounds?: string };

function soundsIpa(sounds: string | undefined): string | undefined {
	const picked = parseSoundsParam(sounds);
	return picked.length > 0 ? soundsToIpa(picked) : undefined;
}

export function searchPageTitle({ q, sounds }: SearchPageSource): string {
	const ipa = soundsIpa(sounds);
	if (ipa) return `Words that start with /${ipa}/`;
	return q ? `${q} in IPA` : "Search";
}

export function searchPageDescription({ q, sounds }: SearchPageSource): string {
	const ipa = soundsIpa(sounds);
	if (ipa) return `Common English words whose pronunciation starts with /${ipa}/.`;
	return q
		? `How "${q}" is pronounced in American English, in IPA, sound by sound.`
		: HOME_PAGE_DESCRIPTION;
}
