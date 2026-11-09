import { type EnglishPhonemeSymbolId, splitSpelledWord } from "@phonaria/phonetics-data";
import {
	EnglishSpellingShares,
	type SpellingShare,
} from "@phonaria/phonetics-data/data/en/spelling-shares";

const WORDS_PER_SPELLING = 3;
const OTHER_SPELLINGS_SHOWN = 8;

export interface SpellingExample {
	word: string;
	/** The word with the letters of the spelling in brackets: "enou[gh]". */
	spelled: string;
}

export interface RankedSpelling {
	spelling: string;
	/** Share of the sound in everyday speech spelled this way, 0–100. */
	percentage: number;
	examples: SpellingExample[];
}

function example(spelled: string): SpellingExample {
	return {
		word: splitSpelledWord(spelled)
			.map(({ text }) => text)
			.join(""),
		spelled,
	};
}

/** The most frequent word, then the first word of each place (start, inside, end), then the next of each, up to `limit`. */
function pickExamples({ topWord, words }: SpellingShare, limit: number): SpellingExample[] {
	const lists = [words.start, words.inside, words.end];
	const longest = Math.max(...lists.map((list) => list.length));
	const ordered = [
		...(topWord ? [topWord] : []),
		...Array.from({ length: longest }, (_, round) => lists.map((list) => list[round])).flat(),
	];
	const picked = new Map<string, SpellingExample>();
	for (const spelled of ordered) {
		if (spelled === undefined || picked.size >= limit) continue;
		const next = example(spelled);
		if (!picked.has(next.word)) picked.set(next.word, next);
	}
	return [...picked.values()];
}

/**
 * A sound's spellings, most common first, each with its share of the sound in
 * everyday speech and up to three words; then a few rarer spellings, under 2%
 * each, with one word each. Rare spellings without a recorded word are left out.
 */
export function getRankedSpellings(phonemeId: EnglishPhonemeSymbolId): {
	ranked: RankedSpelling[];
	other: RankedSpelling[];
} {
	const { spellings, other } = EnglishSpellingShares[phonemeId];
	return {
		ranked: spellings.map((share) => ({
			spelling: share.spelling,
			percentage: share.percentage,
			examples: pickExamples(share, WORDS_PER_SPELLING),
		})),
		other: other
			.map((share) => ({
				spelling: share.spelling,
				percentage: share.percentage,
				examples: pickExamples(share, 1),
			}))
			.filter(({ examples }) => examples.length > 0)
			.slice(0, OTHER_SPELLINGS_SHOWN),
	};
}

/** The sounds that `spelling` spells 2% or more of, in sound-ID order. */
export function soundsSpelledBy(spelling: string): EnglishPhonemeSymbolId[] {
	return (Object.keys(EnglishSpellingShares) as EnglishPhonemeSymbolId[]).filter((id) =>
		EnglishSpellingShares[id].spellings.some((share) => share.spelling === spelling),
	);
}
