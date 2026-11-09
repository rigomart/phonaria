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
import { formatPercentage } from "@/lib/phoneme-frequency";
import { soundPagePath } from "@/lib/sound-pages";
import { hasWordPage, wordPagePath } from "@/lib/word-pages";

const OTHER_WORDS = 3;

export interface WordSound {
	phonemeId: EnglishPhonemeSymbolId;
	ipa: string;
	path: string;
}

export interface LetterGroup {
	letters: string;
	/** Empty for silent letters, two for letters that spell two sounds (x in box). */
	sounds: WordSound[];
}

export interface OtherWord {
	word: string;
	/** The word with the shared spelling in brackets: "tou[gh]". */
	spelled: string;
}

export interface UnusualSpelling {
	/** As the sound pages name it: "gh", or "o-e" for o and a silent e. */
	spelling: string;
	sound: WordSound;
	percentage: number;
	/** Other common words that spell the sound this way, most frequent first. */
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

type Place = "start" | "inside" | "end";

/** Where in the word a segment's sounds fall, as the spelling shares count it. */
function placeOf(entry: WordPageEntry, index: number): Place {
	const before = entry.segments.slice(0, index).flatMap(({ sounds }) => sounds).length;
	const total = entry.segments.flatMap(({ sounds }) => sounds).length;
	return before === 0 ? "start" : before === total - 1 ? "end" : "inside";
}

/** Other words with the spelling, those with it in the same place first: tough beside enough. */
function otherWords(
	word: string,
	phonemeId: EnglishPhonemeSymbolId,
	spelling: string,
	place: Place,
): OtherWord[] {
	const entry = EnglishSpellingShares[phonemeId];
	const share = [...entry.spellings, ...entry.other].find((row) => row.spelling === spelling);
	if (!share) return [];
	const places = (["start", "inside", "end"] as const).filter((other) => other !== place);
	const candidates = [
		...share.words[place],
		...(share.topWord ? [share.topWord] : []),
		...places.flatMap((other) => share.words[other]),
	];
	const others = new Map<string, OtherWord>();
	for (const spelled of candidates) {
		const other = plainWord(spelled);
		if (other !== word && !others.has(other) && others.size < OTHER_WORDS) {
			others.set(other, { word: other, spelled });
		}
	}
	return [...others.values()];
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

function buildView(entry: WordPageEntry): WordPageView {
	return {
		word: entry.word,
		name: capitalize(entry.word),
		ipa: formatWordIpa(entry.pronunciation),
		pronunciation: entry.pronunciation,
		path: wordPagePath(entry.word),
		letters: entry.segments.map(({ letters, sounds }) => ({
			letters,
			sounds: sounds.map(wordSound),
		})),
		unusual: entry.rareSpellings.map(({ spelling, phonemeId, percentage }) => {
			const index = entry.segments.findIndex(
				(segment) =>
					(segment.spelling ?? segment.letters) === spelling &&
					segment.sounds.length === 1 &&
					extractBasePhonemeId(segment.sounds[0]) === phonemeId,
			);
			return {
				spelling,
				sound: wordSound(phonemeId),
				percentage,
				others: otherWords(
					entry.word,
					phonemeId as EnglishPhonemeSymbolId,
					spelling,
					placeOf(entry, Math.max(index, 0)),
				),
			};
		}),
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

/** "Enough in IPA is /ɪˈnʌf/ in American English, with a recording and the letters behind each sound. The gh spells /f/, as in tough: only 1.0% of /f/ sounds are spelled gh." */
export function wordPageDescription(view: WordPageView): string {
	const [first] = view.unusual;
	const intro = `${view.name} in IPA is /${view.ipa}/ in American English, with a recording and the letters behind each sound.`;
	if (!first) return intro;
	const example = first.others[0] ? `, as in ${first.others[0].word}` : "";
	return `${intro} The ${first.spelling} spells /${first.sound.ipa}/${example}: only ${formatPercentage(first.percentage)} of /${first.sound.ipa}/ sounds are spelled ${first.spelling}.`;
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
