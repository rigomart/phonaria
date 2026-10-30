import {
	EnglishPhonemeSpellingPatterns,
	type EnglishPhonemeSymbolId,
	formatPhonemeLabel,
	getIpaForPhonemeId,
	getPhonemeType,
	type SpellingPattern,
	splitSpelledWord,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { getPhonemeComparisons } from "@/lib/phoneme-comparisons";
import { summarizePhonemeFrequency } from "@/lib/phoneme-frequency";

export const SOUNDS_PATH = "/sounds";
export const SOUNDS_PAGE_TITLE = "The sounds of American English";
export const SOUNDS_PAGE_DESCRIPTION =
	"Every consonant and vowel sound of American English, each with how it's made, how it's spelled, example words and minimal pairs.";

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
	const { word, letters } = getSoundKeyExample(phonemeId);
	return `The /${getIpaForPhonemeId(phonemeId)}/ sound (${letters} in '${word}'): how to pronounce it`;
}

const list = new Intl.ListFormat("en", { type: "conjunction" });

export function soundPageDescription(phonemeId: EnglishPhonemeSymbolId): string {
	const ipa = getIpaForPhonemeId(phonemeId);
	const { word } = getSoundKeyExample(phonemeId);
	const kind =
		getPhonemeType(phonemeId) === "diphthong"
			? `a vowel that glides from /${ipa.charAt(0)}/ to /${ipa.slice(-1)}/`
			: `the ${formatPhonemeLabel("en-us", phonemeId).toLowerCase()}`;
	const spellings = getSpelling(phonemeId).patterns;
	const partners = getPhonemeComparisons("en-us", phonemeId).map(
		({ partnerIpa }) => `/${partnerIpa}/`,
	);
	const topics = [
		"how it's made",
		`spellings (${list.format(spellings)})`,
		...(partners.length > 0 ? [`minimal pairs with ${list.format(partners)}`] : []),
		...(summarizePhonemeFrequency("en-us", phonemeId) ? ["how common it is"] : []),
	];
	return `How to say /${ipa}/ as in '${word}', ${kind}: ${list.format(topics)}.`;
}
