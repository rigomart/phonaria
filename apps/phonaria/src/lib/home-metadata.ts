import { getLanguagePhonemeCount } from "@phonaria/phonetics-data";

export const HOME_PAGE_TITLE = "English to IPA transcription for American English";
export const HOME_PAGE_DESCRIPTION = `See how any English word or sentence is pronounced in American English, in IPA, sound by sound, with recordings. Plus an IPA chart and all ${getLanguagePhonemeCount("en-us").total} sounds.`;

export const SEARCH_PATH = "/search";

export function searchPageTitle(query: string | undefined): string {
	return query ? `${query} in IPA` : "Search";
}

export function searchPageDescription(query: string | undefined): string {
	return query
		? `How "${query}" is pronounced in American English, in IPA, sound by sound.`
		: HOME_PAGE_DESCRIPTION;
}
