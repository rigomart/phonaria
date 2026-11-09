import {
	EnglishPhonemeContrasts,
	type EnglishPhonemeSymbolId,
	extractBasePhonemeId,
	getIpaForPhonemeId,
	splitSpelledWord,
} from "@phonaria/phonetics-data";
import { EnglishSpellingShares } from "@phonaria/phonetics-data/data/en/spelling-shares";
import { getWordPage, type WordPageEntry } from "@phonaria/phonetics-data/data/en/word-pages";
import { syllabify } from "@/lib/g2p/syllabifier";
import { contrastPagePath } from "@/lib/minimal-pairs";
import { soundPagePath } from "@/lib/sound-pages";
import { hasWordPage, wordPagePath } from "@/lib/word-pages";

export interface WordSound {
	phonemeId: EnglishPhonemeSymbolId;
	ipa: string;
	path: string;
}

export interface LetterGroup {
	letters: string;
	/** Empty for silent letters, two for letters that spell two sounds (x in box). */
	sounds: WordSound[];
	/** True when these letters are, or are the silent e of, a rare spelling of their sound. */
	rare: boolean;
}

export interface OtherWord {
	word: string;
	/** The word with the shared spelling in brackets: "tou[gh]". */
	spelled: string;
}

/** One part of a sound's spellings, sized by its share of the sound in everyday speech. */
export interface ShareSegment {
	/** The spelling, or null for the rarer spellings taken together. */
	spelling: string | null;
	percentage: number;
	/** True for the spelling this word uses. */
	own: boolean;
}

export interface UnusualSpelling {
	/** As the sound pages name it: "gh", or "o-e" for o and a silent e. */
	spelling: string;
	sound: WordSound;
	percentage: number;
	/** The sound's common spellings, then this one, then the rest. */
	shares: ShareSegment[];
	/** Other common words that spell the sound this way, the same place in the word first. */
	others: OtherWord[];
}

export interface WordPair {
	contrastId: string;
	path: string;
	other: string;
	/** This word's sound, then the other word's. */
	sounds: [WordSound, WordSound];
}

export interface WordPageView {
	word: string;
	/** The word capitalized, for headings: "Enough". */
	name: string;
	/** IPA with stress marks, no slashes: "ɪˈnʌf". */
	ipa: string;
	pronunciation: string;
	path: string;
	letters: LetterGroup[];
	unusual: UnusualSpelling[];
	pairs: WordPair[];
}

function wordSound(token: string): WordSound {
	const phonemeId = extractBasePhonemeId(token) as EnglishPhonemeSymbolId;
	return { phonemeId, ipa: getIpaForPhonemeId(phonemeId), path: soundPagePath(phonemeId) };
}

/**
 * IPA with a stress mark before each stressed syllable, none for one syllable: "ɪˈnʌf", "noʊ".
 * Where the dictionary marks two syllables as primary (engineering), the last keeps it and
 * the others become secondary: "ˌɛndʒəˈnɪɹɪŋ".
 */
export function formatWordIpa(pronunciation: string): string {
	const syllables = syllabify(pronunciation.split(" "));
	const lastPrimary = syllables.map(({ stress }) => stress).lastIndexOf("primary");
	return syllables
		.map(({ stress, phonemes }, index) => {
			const shown =
				syllables.length === 1
					? "none"
					: stress === "primary" && index !== lastPrimary
						? "secondary"
						: stress;
			const mark = shown === "primary" ? "ˈ" : shown === "secondary" ? "ˌ" : "";
			return mark + phonemes.map((phoneme) => ("ipa" in phoneme ? phoneme.ipa : "")).join("");
		})
		.join("");
}

function plainWord(spelled: string): string {
	return splitSpelledWord(spelled)
		.map(({ text }) => text)
		.join("");
}

/** The sound's spellings of 2% or more, then `spelling`, then all the rest as one part. */
function shareSegments(phonemeId: EnglishPhonemeSymbolId, spelling: string): ShareSegment[] {
	const { spellings, other } = EnglishSpellingShares[phonemeId];
	const common = spellings.map((share) => ({
		spelling: share.spelling,
		percentage: share.percentage,
		own: share.spelling === spelling,
	}));
	const own = other.find((share) => share.spelling === spelling);
	const rest = other
		.filter((share) => share.spelling !== spelling)
		.reduce((sum, share) => sum + share.percentage, 0);
	return [
		...common,
		...(own ? [{ spelling, percentage: own.percentage, own: true }] : []),
		...(rest > 0 ? [{ spelling: null, percentage: rest, own: false }] : []),
	];
}

function otherWord(spelled: string): OtherWord {
	return { word: plainWord(spelled), spelled };
}

function pairsWith(word: string): WordPair[] {
	return EnglishPhonemeContrasts.flatMap((contrast) =>
		contrast.minimalPairs.flatMap(({ words }) => {
			const index = words.indexOf(word);
			if (index < 0) return [];
			const own = contrast.phonemeIds[index];
			const theirs = contrast.phonemeIds[1 - index];
			return [
				{
					contrastId: contrast.id,
					path: contrastPagePath(contrast.id),
					other: words[1 - index],
					sounds: [wordSound(own), wordSound(theirs)] as [WordSound, WordSound],
				},
			];
		}),
	);
}

function capitalize(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

/** The letter groups that make up a rare spelling: its letters, and the silent e of a split one (o-e). */
function rareSegmentIndices(entry: WordPageEntry): Set<number> {
	const indices = new Set<number>();
	entry.segments.forEach(({ letters, sounds, spelling }, index) => {
		const label = spelling ?? letters;
		const rare =
			sounds.length === 1 &&
			entry.rareSpellings.some(
				(r) => r.spelling === label && r.phonemeId === extractBasePhonemeId(sounds[0]),
			);
		if (!rare) return;
		indices.add(index);
		if (label.endsWith("-e")) indices.add(index + 2);
	});
	return indices;
}

function buildView(entry: WordPageEntry): WordPageView {
	const rare = rareSegmentIndices(entry);
	return {
		word: entry.word,
		name: capitalize(entry.word),
		ipa: formatWordIpa(entry.pronunciation),
		pronunciation: entry.pronunciation,
		path: wordPagePath(entry.word),
		letters: entry.segments.map(({ letters, sounds }, index) => ({
			letters,
			sounds: sounds.map(wordSound),
			rare: rare.has(index),
		})),
		unusual: entry.rareSpellings.map(({ spelling, phonemeId, percentage, others }) => ({
			spelling,
			sound: wordSound(phonemeId),
			percentage,
			shares: shareSegments(phonemeId as EnglishPhonemeSymbolId, spelling),
			others: others.map(otherWord),
		})),
		pairs: pairsWith(entry.word),
	};
}

/** Everything a word's page shows, or undefined when the word has no page. */
export function getWordPageView(word: string): WordPageView | undefined {
	const entry = hasWordPage(word) ? getWordPage(word) : undefined;
	return entry ? buildView(entry) : undefined;
}

export function wordPageTitle({ name, ipa }: Pick<WordPageView, "name" | "ipa">): string {
	return `${name} in IPA: /${ipa}/, phonetic transcription and audio`;
}

/** "Enough in IPA is /ɪˈnʌf/ in American English. Hear it and see which letters spell each sound." */
export function wordPageDescription({ name, ipa }: Pick<WordPageView, "name" | "ipa">): string {
	return `${name} in IPA is /${ipa}/ in American English. Hear it and see which letters spell each sound.`;
}

export function wordPageHeadText(view: WordPageView | undefined) {
	return view
		? {
				path: view.path,
				name: view.name,
				title: wordPageTitle(view),
				description: wordPageDescription(view),
			}
		: undefined;
}
