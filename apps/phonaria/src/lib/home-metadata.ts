import { getLanguagePhonemeCount } from "@phonaria/phonetics-data";

export const HOME_PAGE_TITLE = "English to IPA transcription for American English";
export const HOME_PAGE_DESCRIPTION = `See how any English word or sentence is pronounced in American English, in IPA, sound by sound, with recordings. Plus an IPA chart and all ${getLanguagePhonemeCount("en-us").total} sounds.`;
