import {
	EnglishPhonemeSpellingPatterns,
	type EnglishPhonemeSymbolId,
	getIpaForPhonemeId,
	getLanguagePhonemeCount,
	type SpellingPattern,
	splitSpelledWord,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { getHeadlinePair } from "@/lib/headline-pairs";
import { getPhonemeComparisons } from "@/lib/phoneme-comparisons";

const counts = getLanguagePhonemeCount("en-us");

export const SOUNDS_PATH = "/sounds";
export const SOUNDS_PAGE_HEADING = "The sounds of American English";
export const SOUNDS_PAGE_TITLE = `The ${counts.total} sounds of American English, with IPA and examples`;
export const SOUNDS_PAGE_DESCRIPTION = `All ${counts.consonants} consonants and ${counts.vowels} vowels of American English, each with its IPA symbol, how it's made, how it's spelled, example words and minimal pairs.`;

/** Each en-us sound's everyday name, the one learners search for, as it reads mid-sentence. */
const SOUND_NAMES = {
	P: "P",
	B: "B",
	T: "T",
	D: "D",
	K: "K",
	G: "G",
	F: "F",
	V: "V",
	TH: "voiceless TH",
	DH: "voiced TH",
	S: "S",
	Z: "Z",
	SH: "SH",
	ZH: "ZH",
	H: "H",
	M: "M",
	N: "N",
	NG: "NG",
	L: "L",
	R: "R",
	W: "W",
	Y: "Y",
	CH: "CH",
	J: "J",
	I: "long E",
	IX: "short I",
	U: "long OO",
	UX: "short OO",
	AX: "schwa",
	E: "short E",
	AH: "short U",
	O: "AW",
	AE: "short A",
	A: "AH",
	ER: "ER",
	EI: "long A",
	OU: "long O",
	AI: "long I",
	AU: "OW",
	OI: "OY",
} as const satisfies Record<EnglishPhonemeSymbolId, string>;

/** "voiceless TH", "schwa", "P": reads after "the" and before "sound". */
export function getSoundName(phonemeId: EnglishPhonemeSymbolId): string {
	return SOUND_NAMES[phonemeId];
}

/** The sound's heading, e.g. "Voiceless TH /θ/". */
export function soundHeading(phonemeId: EnglishPhonemeSymbolId): string {
	const name = getSoundName(phonemeId);
	return `${name.charAt(0).toUpperCase()}${name.slice(1)} /${getIpaForPhonemeId(phonemeId)}/`;
}

/** The sound's heading, or undefined where it has no everyday name: only en-us sounds have one. */
export function findSoundHeading(
	targetAccent: TargetAccent,
	phonemeId: string,
): string | undefined {
	if (targetAccent !== "en-us" || !Object.hasOwn(SOUND_NAMES, phonemeId)) return undefined;
	return soundHeading(phonemeId as EnglishPhonemeSymbolId);
}

/** Each en-us sound's slug in its page's URL. Slugs are public: changing one breaks links to it. */
const SOUND_SLUGS = {
	P: "p-pat",
	B: "b-bat",
	T: "t-top",
	D: "d-day",
	K: "k-kid",
	G: "g-gum",
	F: "f-fan",
	V: "v-van",
	TH: "th-thin",
	DH: "th-this",
	S: "s-sun",
	Z: "z-zoo",
	SH: "sh-shop",
	ZH: "zh-vision",
	H: "h-house",
	M: "m-ram",
	N: "n-sun",
	NG: "ng-sing",
	L: "l-let",
	R: "r-red",
	W: "w-west",
	Y: "y-you",
	CH: "ch-cheap",
	J: "j-jeep",
	I: "ee-seed",
	IX: "ih-sit",
	U: "oo-food",
	UX: "oo-book",
	AX: "schwa",
	E: "eh-red",
	AH: "uh-cup",
	O: "aw-saw",
	AE: "ae-cat",
	A: "ah-father",
	ER: "er-her",
	EI: "ay-day",
	OU: "oh-boat",
	AI: "eye-time",
	AU: "ow-now",
	OI: "oy-boy",
} as const satisfies Record<EnglishPhonemeSymbolId, string>;

export type SoundSlug = (typeof SOUND_SLUGS)[EnglishPhonemeSymbolId];

const PHONEME_IDS_BY_SLUG = new Map(
	Object.entries(SOUND_SLUGS).map(([phonemeId, slug]) => [
		slug as string,
		phonemeId as EnglishPhonemeSymbolId,
	]),
);

export function getSoundSlug(phonemeId: EnglishPhonemeSymbolId): SoundSlug {
	return SOUND_SLUGS[phonemeId];
}

export function getPhonemeIdForSoundSlug(slug: string): EnglishPhonemeSymbolId | undefined {
	return PHONEME_IDS_BY_SLUG.get(slug);
}

export function soundPagePath(phonemeId: EnglishPhonemeSymbolId): string {
	return `${SOUNDS_PATH}/${getSoundSlug(phonemeId)}`;
}

/** The sound's page, or undefined where it has none: only en-us sounds have pages. */
export function findSoundPagePath(
	targetAccent: TargetAccent,
	phonemeId: string,
): string | undefined {
	if (targetAccent !== "en-us" || !Object.hasOwn(SOUND_SLUGS, phonemeId)) return undefined;
	return soundPagePath(phonemeId as EnglishPhonemeSymbolId);
}

/** Every sound's page, consonants then vowels. */
export function listSoundPagePaths(): string[] {
	return (Object.keys(SOUND_SLUGS) as EnglishPhonemeSymbolId[]).map(soundPagePath);
}

function getSpelling(phonemeId: EnglishPhonemeSymbolId): SpellingPattern {
	const spelling = (
		EnglishPhonemeSpellingPatterns as Partial<Record<EnglishPhonemeSymbolId, SpellingPattern>>
	)[phonemeId];
	if (!spelling) throw new Error(`/${getIpaForPhonemeId(phonemeId)}/ has no spelling patterns.`);
	return spelling;
}

/** The word in the sound's slug, from its spelling examples (the first one for schwa). */
export function getSoundKeyExample(phonemeId: EnglishPhonemeSymbolId) {
	const { examples } = getSpelling(phonemeId);
	const word = getSoundSlug(phonemeId).split("-").at(-1);
	const example = examples.find((candidate) => candidate.word === word) ?? examples[0];
	if (!example) throw new Error(`/${getIpaForPhonemeId(phonemeId)}/ has no spelling examples.`);
	const letters = splitSpelledWord(example.spelled)
		.filter(({ highlighted }) => highlighted)
		.map(({ text }) => text)
		.join("-");
	return { word: example.word, spelled: example.spelled, letters };
}

export function soundPageTitle(phonemeId: EnglishPhonemeSymbolId): string {
	const { word } = getSoundKeyExample(phonemeId);
	return `How to pronounce the ${getSoundName(phonemeId)} sound /${getIpaForPhonemeId(phonemeId)}/ (as in '${word}')`;
}

function joinWithAnd(parts: readonly string[]): string {
	return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts.join("");
}

const DESCRIPTION_PAIR_LIMIT = 3;

export function soundPageDescription(phonemeId: EnglishPhonemeSymbolId): string {
	const { word } = getSoundKeyExample(phonemeId);
	const other = getSpelling(phonemeId).examples.find((example) => example.word !== word);
	const words = other ? `'${word}' and '${other.word}'` : `'${word}'`;
	const pairs = getPhonemeComparisons("en-us", phonemeId)
		.slice(0, DESCRIPTION_PAIR_LIMIT)
		.map(({ contrastId }) => getHeadlinePair(contrastId).join(" vs "));
	const covers =
		pairs.length > 0
			? `how it's made, how it's spelled, and minimal pairs like ${joinWithAnd(pairs)}`
			: "how it's made and how it's spelled";
	return `How to say the ${getSoundName(phonemeId)} sound /${getIpaForPhonemeId(phonemeId)}/ in ${words}: ${covers}.`;
}
