import { EnglishWordPageList } from "@phonaria/phonetics-data/data/en/word-page-list";

export const WORDS_PATH = "/words";

/**
 * The words that have a page, in list order. The route, the sitemap and the links into
 * the pages all read this list. Only the list is loaded here; a page's data loads with the page.
 */
export function listWordPageWords(): readonly string[] {
	return EnglishWordPageList;
}

let words: ReadonlySet<string> | undefined;

/** Whether the word has a page. Matches the lowercase word. */
export function hasWordPage(word: string): boolean {
	words ??= new Set(listWordPageWords());
	return words.has(word);
}

export function wordPagePath(word: string): string {
	return `${WORDS_PATH}/${word}`;
}

/** The page of a word as written anywhere (any case, surrounding spaces), or undefined. */
export function findWordPagePath(word: string): string | undefined {
	const normalized = word.trim().toLowerCase();
	return hasWordPage(normalized) ? wordPagePath(normalized) : undefined;
}

export function listWordPagePaths(): string[] {
	return listWordPageWords().map(wordPagePath);
}
