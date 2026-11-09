import {
	EnglishPhonemeContrasts,
	type EnglishPhonemeSymbolId,
	extractBasePhonemeId,
	findSubstitution,
	getIpaForPhonemeId,
	splitSpelledWord,
	toBasePhonemeIds,
} from "@phonaria/phonetics-data";
import {
	EnglishSpellingShares,
	OTHER_SPELLINGS_BELOW_PERCENTAGE,
} from "@phonaria/phonetics-data/data/en/spelling-shares";
import { getWordPage, type WordPageEntry } from "@phonaria/phonetics-data/data/en/word-pages";
import { phonemeAudioPath } from "@/components/phoneme-details/sound";
import { syllabify } from "@/lib/g2p/syllabifier";
import { contrastPagePath } from "@/lib/minimal-pairs";
import { soundPagePath } from "@/lib/sound-pages";
import { soundHeading } from "@/lib/sound-pages";
import { CatalogWordPronunciations } from "@/lib/speech/catalog-pronunciations";
import { findWordPagePath, hasWordPage, wordPagePath } from "@/lib/word-pages";

export interface WordSound {
	phonemeId: EnglishPhonemeSymbolId;
	ipa: string;
	path: string;
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

export interface WordPair {
	contrastId: string;
	path: string;
	other: string;
	/** This word's sound, then the other word's. */
	sounds: [WordSound, WordSound];
	/** Which of this word's sounds changes, counting from 0. */
	index: number;
}

/** One of the word's sounds with everything the sound-by-sound breakdown shows about it. */
export interface SoundPart {
	/** The letters that spell it; "o…e" for a split spelling. */
	letters: string;
	sound: WordSound;
	/** The sound's name as its page heads it: "Short U". */
	name: string;
	/** The sound's own recording, or null where it has none (diphthongs). */
	audioPath: string | null;
	stressed: boolean;
	/**
	 * This spelling's share of the sound in everyday speech, with the sound's other spellings;
	 * null for letters that spell two sounds (x in box), which the shares don't rank.
	 */
	percentage: number | null;
	shares: ShareSegment[];
	/** Under 2%: rare for the sound. */
	rare: boolean;
	examples: (OtherWord & { path?: string })[];
	/** The minimal pairs this word is in where this sound is the one that changes. */
	contrasts: { path: string; other: string; theirs: WordSound }[];
}

export interface WordPageView {
	word: string;
	/** The word capitalized, for headings: "Enough". */
	name: string;
	/** IPA with stress marks, no slashes: "ɪˈnʌf". */
	ipa: string;
	pronunciation: string;
	path: string;
	/** Every sound in the word, in order; letters that spell two sounds give two. Silent letters are left out. */
	sounds: SoundPart[];
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

/** Where `pronunciation` turns into one of `other`'s accepted pronunciations, swapping `own` for `theirs`. */
function changedIndex(
	pronunciation: string,
	other: string,
	own: EnglishPhonemeSymbolId,
	theirs: EnglishPhonemeSymbolId,
): number | undefined {
	const from = toBasePhonemeIds(pronunciation);
	for (const to of CatalogWordPronunciations.get(other) ?? []) {
		const change = findSubstitution(from, to);
		if (change && change.from === own && change.to === theirs) return change.index;
	}
	return undefined;
}

function pairsWith(word: string, pronunciation: string): WordPair[] {
	return EnglishPhonemeContrasts.flatMap((contrast) =>
		contrast.minimalPairs.flatMap(({ words }) => {
			const side = words.indexOf(word);
			if (side < 0) return [];
			const own = contrast.phonemeIds[side];
			const theirs = contrast.phonemeIds[1 - side];
			const other = words[1 - side];
			const index = changedIndex(pronunciation, other, own, theirs);
			if (index === undefined) return [];
			return [
				{
					contrastId: contrast.id,
					path: contrastPagePath(contrast.id),
					other,
					sounds: [wordSound(own), wordSound(theirs)] as [WordSound, WordSound],
					index,
				},
			];
		}),
	);
}

function capitalize(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

/** The letter groups that make up a rare spelling: its letters, and the silent e of a split one (o-e). */
function shareOf(phonemeId: EnglishPhonemeSymbolId, spelling: string): number {
	const { spellings, other } = EnglishSpellingShares[phonemeId];
	return [...spellings, ...other].find((share) => share.spelling === spelling)?.percentage ?? 0;
}

function soundParts(entry: WordPageEntry, pairs: WordPair[]): SoundPart[] {
	let soundIndex = 0;
	return entry.segments.flatMap(({ letters, sounds, spelling, others }): SoundPart[] => {
		const first = soundIndex;
		soundIndex += sounds.length;
		if (sounds.length > 1) {
			return sounds.map((token): SoundPart => {
				const sound = wordSound(token);
				return {
					letters,
					sound,
					name: soundHeading(sound.phonemeId),
					audioPath: phonemeAudioPath(sound.phonemeId),
					stressed: !token.endsWith("0"),
					percentage: null,
					shares: [],
					rare: false,
					examples: [],
					contrasts: [],
				};
			});
		}
		if (sounds.length === 0) return [];
		const label = spelling ?? letters;
		const sound = wordSound(sounds[0]);
		const percentage = shareOf(sound.phonemeId, label);
		return [
			{
				letters: label.endsWith("-e") ? `${label[0]}…e` : letters,
				sound,
				name: soundHeading(sound.phonemeId),
				audioPath: phonemeAudioPath(sound.phonemeId),
				stressed: !sounds[0].endsWith("0"),
				percentage,
				shares: shareSegments(sound.phonemeId, label),
				rare: percentage < OTHER_SPELLINGS_BELOW_PERCENTAGE,
				examples: (others ?? []).map((spelled) => {
					const other = otherWord(spelled);
					return { ...other, path: findWordPagePath(other.word) };
				}),
				contrasts: pairs
					.filter((pair) => pair.index === first)
					.map((pair) => ({ path: pair.path, other: pair.other, theirs: pair.sounds[1] })),
			},
		];
	});
}

function buildView(entry: WordPageEntry): WordPageView {
	return {
		word: entry.word,
		name: capitalize(entry.word),
		ipa: formatWordIpa(entry.pronunciation),
		pronunciation: entry.pronunciation,
		path: wordPagePath(entry.word),
		sounds: soundParts(entry, pairsWith(entry.word, entry.pronunciation)),
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
