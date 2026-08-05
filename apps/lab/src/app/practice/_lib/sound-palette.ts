/**
 * The 40-key English sound palette and the search index behind the composer's
 * typing path. One ranked match list serves both the dropdown and the palette's
 * dimming, so the two can never disagree about what a query matched (#140).
 *
 * Keys are ordered for reading — plosives, fricatives, affricates, nasals,
 * approximants, then vowels by height — not in inventory order. A test asserts
 * the two stay the same set.
 *
 * English-only, like the rest of Practice: the topic registry is the seam a
 * second accent would arrive through (#140), and this module would take a
 * `TargetAccent` at that point rather than reading the English inventory.
 */
import {
	ConsonantIpaMap,
	DiphthongIpaMap,
	type EnglishConsonantSymbolId,
	type EnglishDiphthongSymbolId,
	type EnglishMonophthongSymbolId,
	EnglishPhonemeSpellingPatterns,
	type EnglishPhonemeSymbolId,
	MonophthongIpaMap,
	PhonemeArpabetLabel,
} from "@phonaria/phonetics-data";
import { phonemeLabels } from "@/lib/phoneme-labels";

export interface SoundKey {
	id: EnglishPhonemeSymbolId;
	ipa: string;
	arpabet: string;
	/** Articulatory label, e.g. "Voiceless bilabial plosive". */
	label: string;
	/** What a learner is likely to call the sound: "schwa", "eth", "kit". */
	nicknames: readonly string[];
	/** Words the sound is heard in, shown alongside the label in the dropdown. */
	examples: readonly string[];
}

/** Enough to identify the sound without turning the dropdown row into prose. */
const MAX_EXAMPLES = 3;

/**
 * Names a learner reaches for that no notation carries: the Greek letter names,
 * the lexical sets, and "schwa" itself. Example *words* are not here — those are
 * `EnglishPhonemeSpellingPatterns`' job, and duplicating them would let the two
 * drift.
 *
 * A nickname also outranks an example word, which is how the ambiguous ones land
 * where a learner means them: "cat" contains both /k/ and /æ/, and someone
 * typing it wants the vowel.
 */
const NICKNAMES: Partial<Record<EnglishPhonemeSymbolId, readonly string[]>> = {
	TH: ["theta"],
	DH: ["eth"],
	SH: ["esh"],
	NG: ["eng"],

	I: ["fleece"],
	IX: ["kit"],
	UX: ["foot"],
	U: ["goose"],
	E: ["dress"],
	AX: ["schwa", "uh", "about"],
	AH: ["strut"],
	O: ["thought"],
	AE: ["ash", "trap", "cat"],
	A: ["lot"],
	ER: ["nurse", "r-colored"],

	EI: ["face"],
	OU: ["goat"],
	AI: ["price"],
	AU: ["mouth"],
	OI: ["choice"],
};

const CONSONANT_ORDER = [
	"P",
	"B",
	"T",
	"D",
	"K",
	"G",
	"F",
	"V",
	"TH",
	"DH",
	"S",
	"Z",
	"SH",
	"ZH",
	"H",
	"CH",
	"J",
	"M",
	"N",
	"NG",
	"L",
	"R",
	"Y",
	"W",
] as const satisfies readonly EnglishConsonantSymbolId[];

const MONOPHTHONG_ORDER = [
	"I",
	"IX",
	"UX",
	"U",
	"E",
	"AX",
	"AH",
	"O",
	"AE",
	"A",
	"ER",
] as const satisfies readonly EnglishMonophthongSymbolId[];

const DIPHTHONG_ORDER = [
	"EI",
	"OU",
	"AI",
	"AU",
	"OI",
] as const satisfies readonly EnglishDiphthongSymbolId[];

function toKey<T extends EnglishPhonemeSymbolId>(id: T, ipaMap: Record<T, string>): SoundKey {
	// Every English phoneme carries examples; a test guards the assumption.
	const spelling = EnglishPhonemeSpellingPatterns[id];
	return {
		id,
		ipa: ipaMap[id],
		arpabet: PhonemeArpabetLabel[id],
		label: phonemeLabels[id],
		nicknames: NICKNAMES[id] ?? [],
		examples: (spelling?.examples ?? []).slice(0, MAX_EXAMPLES).map((example) => example.word),
	};
}

export const CONSONANT_KEYS: readonly SoundKey[] = CONSONANT_ORDER.map((id) =>
	toKey(id, ConsonantIpaMap),
);

export const VOWEL_KEYS: readonly SoundKey[] = [
	...MONOPHTHONG_ORDER.map((id) => toKey(id, MonophthongIpaMap)),
	...DIPHTHONG_ORDER.map((id) => toKey(id, DiphthongIpaMap)),
];

export const PALETTE_KEYS: readonly SoundKey[] = [...CONSONANT_KEYS, ...VOWEL_KEYS];

const KEY_BY_ID = new Map(PALETTE_KEYS.map((key) => [key.id, key]));

/** Palette keys are plain strings once they reach the store and the scorer. */
export function findSound(id: string): SoundKey | undefined {
	return KEY_BY_ID.get(id as EnglishPhonemeSymbolId);
}

/**
 * Accessible name for a bare glyph: "schwa, /ə/". A screen reader cannot be
 * trusted to pronounce an IPA character, so words come first (#140) — and they
 * are plain words, not "voiceless bilabial plosive". The articulatory label
 * stays where it can be read at leisure: the dropdown row.
 */
export function describeSound(sound: SoundKey): string {
	const name = sound.nicknames[0] ?? `as in ${sound.examples[0]}`;
	return `${name}, /${sound.ipa}/`;
}

/**
 * Higher wins. Exact hits beat prefixes, prefixes beat a bare substring, so
 * "sh" lands on /ʃ/ rather than on everything spelled with an s and an h.
 *
 * A nickname outranks ARPABET because the typing path is aimed at beginners:
 * "uh" is what a learner calls schwa, and only incidentally the ARPABET label
 * for /ʊ/. That is the one collision between the two notations.
 */
const SCORE = {
	ipa: 100,
	id: 90,
	nickname: 88,
	arpabet: 85,
	example: 75,
	nicknamePrefix: 60,
	examplePrefix: 55,
	notationPrefix: 50,
	labelWordPrefix: 40,
	substring: 10,
} as const;

interface IndexedSound {
	sound: SoundKey;
	order: number;
	id: string;
	arpabet: string;
	labelWords: readonly string[];
	haystack: string;
}

const SEARCH_INDEX: readonly IndexedSound[] = PALETTE_KEYS.map((sound, order) => {
	const labelWords = sound.label.toLowerCase().split(/[\s-]+/);
	return {
		sound,
		order,
		id: sound.id.toLowerCase(),
		arpabet: sound.arpabet.toLowerCase(),
		labelWords,
		haystack: [
			sound.ipa,
			sound.id,
			sound.arpabet,
			sound.label,
			...sound.nicknames,
			...sound.examples,
		]
			.join(" ")
			.toLowerCase(),
	};
});

/**
 * The strongest way this sound matches, not the sum of every way. Summing lets
 * a pile of weak hits outrank one exact one — "a" would find /w/ (in "away",
 * an "approximant") before /ɑ/, whose ID is literally the query.
 */
function scoreSound(entry: IndexedSound, query: string): number {
	const { sound } = entry;
	let best = 0;
	const consider = (score: number) => {
		if (score > best) best = score;
	};

	if (sound.ipa === query) consider(SCORE.ipa);
	if (entry.id === query) consider(SCORE.id);
	if (entry.arpabet === query) consider(SCORE.arpabet);

	for (const nickname of sound.nicknames) {
		if (nickname === query) consider(SCORE.nickname);
		else if (nickname.startsWith(query)) consider(SCORE.nicknamePrefix);
	}

	for (const example of sound.examples) {
		if (example === query) consider(SCORE.example);
		else if (example.startsWith(query)) consider(SCORE.examplePrefix);
	}

	if (entry.id.startsWith(query) || entry.arpabet.startsWith(query)) consider(SCORE.notationPrefix);
	if (entry.labelWords.some((word) => word.startsWith(query))) consider(SCORE.labelWordPrefix);
	if (entry.haystack.includes(query)) consider(SCORE.substring);

	return best;
}

/**
 * Ranks the palette against one query across every notation a learner might
 * reach for: IPA, phoneme ID, ARPABET, articulatory label, nickname, example
 * word. An empty query matches nothing — the palette shows undimmed instead.
 */
export function searchSounds(query: string): SoundKey[] {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return [];

	const scored: { entry: IndexedSound; score: number }[] = [];
	for (const entry of SEARCH_INDEX) {
		const score = scoreSound(entry, normalized);
		if (score > 0) scored.push({ entry, score });
	}

	// Palette order breaks ties so the dropdown never reshuffles equal matches.
	scored.sort((a, b) => b.score - a.score || a.entry.order - b.entry.order);
	return scored.map(({ entry }) => entry.sound);
}
