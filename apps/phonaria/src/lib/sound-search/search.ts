import {
	type EnglishPhonemeSymbolId,
	getIpaForPhonemeId,
	getLanguagePhonemeIds,
	isPhonemeInLanguage,
	toBasePhonemeIds,
} from "@phonaria/phonetics-data";
import type { CuratedWordData } from "@phonaria/phonetics-data/data/en/curated-1k";

export type SoundId = EnglishPhonemeSymbolId;

export type IndexedWord = {
	word: string;
	/** Position in the frequency-ordered list; 0 is the most common word. */
	rank: number;
	/** Each distinct pronunciation, as base sound IDs. */
	pronunciations: SoundId[][];
};

export type SoundMatch = {
	word: string;
	rank: number;
	/** The pronunciation that matched; an exact one when the word has it. */
	pronunciation: SoundId[];
	/** The pronunciation is the picked sounds and nothing more. */
	exact: boolean;
};

export type SoundSearchResult = {
	/** Exact matches first, then by frequency. */
	matches: SoundMatch[];
	exactCount: number;
	/** How many words each next sound would leave. A sound missing here leads to no word. */
	next: ReadonlyMap<SoundId, number>;
};

/** Words in the curated top-10k list that sound search covers; a test keeps it equal to the list. */
export const SEARCHED_WORD_COUNT = 10_000;

/** "9 of the 10,000 most common English words start with", to be followed by the picked sounds. */
export function describeMatchCount(total: number): string {
	return `${total.toLocaleString("en-US")} of the ${SEARCHED_WORD_COUNT.toLocaleString("en-US")} most common English words ${total === 1 ? "starts" : "start"} with`;
}

/** Caps the sounds read from `?sounds=`. */
export const MAX_PICKED_SOUNDS = 20;

const SOUNDS_PARAM_SEPARATOR = "-";

export function buildSoundIndex(data: CuratedWordData): IndexedWord[] {
	return Object.entries(data.words).map(([word, variants], rank) => {
		const seen = new Set<string>();
		const pronunciations: SoundId[][] = [];
		for (const variant of variants) {
			const ids = toBasePhonemeIds(variant).filter((id): id is SoundId =>
				isPhonemeInLanguage("en-us", id),
			);
			const key = ids.join(" ");
			if (ids.length === 0 || seen.has(key)) continue;
			seen.add(key);
			pronunciations.push(ids);
		}
		return { word, rank, pronunciations };
	});
}

function startsWith(pronunciation: readonly SoundId[], sounds: readonly SoundId[]): boolean {
	return (
		pronunciation.length >= sounds.length &&
		sounds.every((id, index) => pronunciation[index] === id)
	);
}

export function searchBySounds(
	index: readonly IndexedWord[],
	sounds: readonly SoundId[],
): SoundSearchResult {
	const matches: SoundMatch[] = [];
	const nextWords = new Map<SoundId, Set<number>>();

	for (const entry of index) {
		let match: SoundMatch | null = null;
		for (const pronunciation of entry.pronunciations) {
			if (!startsWith(pronunciation, sounds)) continue;
			const exact = pronunciation.length === sounds.length;
			if (!match || (exact && !match.exact)) {
				match = { word: entry.word, rank: entry.rank, pronunciation, exact };
			}
			const following = pronunciation[sounds.length];
			if (following) {
				const words = nextWords.get(following) ?? new Set<number>();
				words.add(entry.rank);
				nextWords.set(following, words);
			}
		}
		if (match) matches.push(match);
	}

	matches.sort((a, b) => Number(b.exact) - Number(a.exact) || a.rank - b.rank);

	const next = new Map<SoundId, number>();
	for (const [id, words] of nextWords) next.set(id, words.size);

	return { matches, exactCount: matches.filter((match) => match.exact).length, next };
}

const PLAIN_WORD = /^[a-z]{2,}$/;

/**
 * A familiar word for each sound: the most common word that starts with it,
 * else the most common word that has it. Skips one-letter words and words with
 * apostrophes, which read poorly as examples.
 */
export function buildExampleWords(index: readonly IndexedWord[]): Map<SoundId, string> {
	const starts = new Map<SoundId, string>();
	const contains = new Map<SoundId, string>();
	for (const entry of index) {
		const pronunciation = entry.pronunciations[0];
		if (!pronunciation || !PLAIN_WORD.test(entry.word)) continue;
		const first = pronunciation[0];
		if (first && !starts.has(first)) starts.set(first, entry.word);
		for (const id of pronunciation) if (!contains.has(id)) contains.set(id, entry.word);
	}
	const examples = new Map<SoundId, string>();
	for (const id of getLanguagePhonemeIds("en-us")) {
		const word = starts.get(id) ?? contains.get(id);
		if (word) examples.set(id, word);
	}
	return examples;
}

export function soundsToIpa(sounds: readonly SoundId[]): string {
	return sounds.map((id) => getIpaForPhonemeId(id)).join("");
}

/** `?sounds=TH-IX` → `["TH", "IX"]`. Unknown IDs are dropped. */
export function parseSoundsParam(value: string | undefined): SoundId[] {
	if (!value) return [];
	return value
		.split(SOUNDS_PARAM_SEPARATOR)
		.filter((id): id is SoundId => isPhonemeInLanguage("en-us", id as SoundId))
		.slice(0, MAX_PICKED_SOUNDS);
}

/** An empty string, not `undefined`: sound mode with nothing picked yet. */
export function formatSoundsParam(sounds: readonly SoundId[]): string {
	return sounds.slice(0, MAX_PICKED_SOUNDS).join(SOUNDS_PARAM_SEPARATOR);
}

/** Search-param value for sound mode, or `undefined` when the URL isn't in it. */
export function normalizeSoundsParam(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	return formatSoundsParam(parseSoundsParam(value));
}
