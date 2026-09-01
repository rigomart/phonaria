/**
 * The 40-key English sound palette. `searchSounds` returns one ranked list that
 * drives both the dropdown and the palette's dimming, so the two can never
 * disagree about what a query matched (#140). Keys are ordered for reading, not
 * by inventory; a test asserts they stay the same set.
 */
import {
	ConsonantIpaMap,
	DiphthongIpaMap,
	type EnglishConsonantSymbolId,
	type EnglishDiphthongSymbolId,
	type EnglishMonophthongSymbolId,
	EnglishPhonemeSpellingPatterns,
	type EnglishPhonemeSymbolId,
	formatPhonemeLabel,
	MonophthongIpaMap,
	PhonemeArpabetLabel,
} from "@phonaria/phonetics-data";

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
 * Names no notation carries: letter names, lexical sets, "schwa". Example
 * *words* belong to `EnglishPhonemeSpellingPatterns` — a second copy would drift.
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
		label: formatPhonemeLabel("en-us", id),
		// Search lowercases the query, and these words come from a package whose
		// type promises nothing about case.
		nicknames: NICKNAMES[id]?.map(toSearchable) ?? [],
		examples: (spelling?.examples ?? [])
			.slice(0, MAX_EXAMPLES)
			.map((example) => toSearchable(example.word)),
	};
}

function toSearchable(word: string): string {
	return word.toLowerCase();
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
 * Accessible name for a bare glyph: "schwa, ə". A screen reader cannot be
 * trusted to pronounce IPA, so plain words come first — not the articulatory
 * label, which stays in the dropdown row (#140). No /slashes/ around the IPA:
 * VoiceOver reads them as "slash" on every key (#158). The bare symbol stays
 * to disambiguate shared example words ("as in sun" is both s and n).
 */
export function describeSound(sound: SoundKey): string {
	const name = sound.nicknames[0] ?? `as in ${sound.examples[0]}`;
	return `${name}, ${sound.ipa}`;
}

/**
 * Higher wins: exact beats prefix beats substring, so "sh" lands on /ʃ/ rather
 * than everything spelled with an s and an h. Nickname outranks ARPABET for the
 * one case they collide — "uh" is schwa to a learner, /ʊ/ to ARPABET.
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
 * The strongest way this sound matches, not the sum: summing let a pile of weak
 * hits outrank one exact one — "a" found /w/ before /ɑ/.
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
 * Ranks the palette across every notation a learner might reach for. An empty
 * query matches nothing — the palette shows undimmed instead.
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
