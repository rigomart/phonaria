import wordPagesJson from "../../../data/en/word-pages.json";
import { deepFreeze } from "../../shared/readonly";

/** Letters of the word and the sounds they spell, as stored pronunciation tokens (stress kept). */
export interface WordPageSegment {
	letters: string;
	/** Empty for silent letters; two tokens for letters that spell two sounds (x in box). */
	sounds: readonly string[];
	/** Set when the spelling counted for the sound differs from the letters: "a-e" for the a of make. */
	spelling?: string;
}

/** A spelling of the word that is rare for its sound, with that spelling's share of the sound. */
export interface WordPageRareSpelling {
	spelling: string;
	phonemeId: string;
	/** Share of the sound in everyday speech spelled this way, 0–100, under 2. */
	percentage: number;
}

export interface WordPageEntry {
	word: string;
	/** The curated list's first pronunciation, which the word's main recording was made from. */
	pronunciation: string;
	segments: readonly WordPageSegment[];
	rareSpellings: readonly WordPageRareSpelling[];
}

/**
 * The words that have a page at /words/<word>, with what each page shows: common
 * en-us words whose spelling hides a sound, most notable first. To know only which
 * words have a page, use `EnglishWordPageList`, which leaves this data out. Generated into data/en/word-pages.json by
 * `python3 packages/helper-scripts/pick-word-pages.py` and reviewed before committing.
 */
export const EnglishWordPages = deepFreeze(wordPagesJson.words) as readonly WordPageEntry[];

const byWord = new Map(EnglishWordPages.map((entry) => [entry.word, entry]));

/** The word's page data, or undefined when it has no page. Matches lowercase words only. */
export function getWordPage(word: string): WordPageEntry | undefined {
	return byWord.get(word);
}
