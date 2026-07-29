/**
 * PROTOTYPE ONLY — throwaway. Hardcoded session + phoneme palette for the
 * round-building interaction prototype. No session generator, no CMU lookup,
 * no answer checking: this file exists so the variants have something to render.
 */

import {
	ConsonantIpaMap,
	DiphthongIpaMap,
	type EnglishConsonantSymbolId,
	type EnglishDiphthongSymbolId,
	type EnglishMonophthongSymbolId,
	type EnglishPhonemeSymbolId,
	MonophthongIpaMap,
	PhonemeArpabetLabel,
} from "@phonaria/phonetics-data";
import { phonemeLabels } from "@/lib/phoneme-labels";

/** A stand-in for one generated schwa session: five words, syllable-banded. */
export const PROTOTYPE_SESSION: { word: string; syllables: number }[] = [
	{ word: "about", syllables: 2 },
	{ word: "problem", syllables: 2 },
	{ word: "banana", syllables: 3 },
	{ word: "president", syllables: 3 },
	{ word: "information", syllables: 4 },
];

export const ROUND_COUNT = PROTOTYPE_SESSION.length;

export interface PaletteKey {
	id: EnglishPhonemeSymbolId;
	ipa: string;
	arpabet: string;
	label: string;
}

const CONSONANT_ORDER: EnglishConsonantSymbolId[] = [
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
];

const MONOPHTHONG_ORDER: EnglishMonophthongSymbolId[] = [
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
];

const DIPHTHONG_ORDER: EnglishDiphthongSymbolId[] = ["EI", "OU", "AI", "AU", "OI"];

function toKey<T extends EnglishPhonemeSymbolId>(id: T, ipaMap: Record<T, string>): PaletteKey {
	return { id, ipa: ipaMap[id], arpabet: PhonemeArpabetLabel[id], label: phonemeLabels[id] ?? "" };
}

export const CONSONANT_KEYS = CONSONANT_ORDER.map((id) => toKey(id, ConsonantIpaMap));
export const MONOPHTHONG_KEYS = MONOPHTHONG_ORDER.map((id) => toKey(id, MonophthongIpaMap));
export const DIPHTHONG_KEYS = DIPHTHONG_ORDER.map((id) => toKey(id, DiphthongIpaMap));
export const VOWEL_KEYS = [...MONOPHTHONG_KEYS, ...DIPHTHONG_KEYS];
export const ALL_KEYS = [...CONSONANT_KEYS, ...VOWEL_KEYS];

const KEY_BY_ID = new Map(ALL_KEYS.map((key) => [key.id, key]));

export function getPaletteKey(id: EnglishPhonemeSymbolId): PaletteKey {
	const key = KEY_BY_ID.get(id);
	if (!key) throw new Error(`Unknown palette key: ${id}`);
	return key;
}

/**
 * Learner-facing aliases. A beginner searches "schwa" or "the sound in cat",
 * not "AX" — whether that is enough to find a sound is part of what this
 * prototype is asking.
 */
const ALIASES: Partial<Record<EnglishPhonemeSymbolId, string[]>> = {
	AX: ["schwa", "uh", "about", "sofa"],
	AH: ["strut", "cup", "cut"],
	AE: ["ash", "trap", "cat"],
	A: ["lot", "father", "hot"],
	E: ["dress", "bed", "said"],
	ER: ["bird", "nurse", "r-colored"],
	I: ["fleece", "bee", "see"],
	IX: ["kit", "bit", "sit"],
	O: ["thought", "law", "caught"],
	U: ["goose", "boot", "two"],
	UX: ["foot", "put", "book"],
	EI: ["face", "day", "say"],
	OU: ["goat", "go", "no"],
	AI: ["price", "my", "buy"],
	AU: ["mouth", "now", "out"],
	OI: ["choice", "boy", "coin"],
	TH: ["theta", "think", "thin"],
	DH: ["eth", "this", "that"],
	SH: ["esh", "ship", "shoe"],
	ZH: ["measure", "vision"],
	CH: ["chin", "church"],
	J: ["judge", "gin"],
	NG: ["eng", "ring", "sing"],
	Y: ["yes", "yak"],
	W: ["wet", "wag"],
};

export interface SearchableKey extends PaletteKey {
	aliases: string[];
	haystack: string;
}

export const SEARCH_INDEX: SearchableKey[] = ALL_KEYS.map((key) => {
	const aliases = ALIASES[key.id] ?? [];
	return {
		...key,
		aliases,
		haystack: [key.ipa, key.id, key.arpabet, key.label, ...aliases].join(" ").toLowerCase(),
	};
});

export function searchKeys(query: string): SearchableKey[] {
	const q = query.trim().toLowerCase();
	if (!q) return [];

	const scored: { key: SearchableKey; score: number }[] = [];

	for (const key of SEARCH_INDEX) {
		let score = 0;
		if (key.ipa === q) score += 100;
		if (key.id.toLowerCase() === q) score += 90;
		if (key.arpabet.toLowerCase() === q) score += 85;
		if (key.aliases.some((alias) => alias === q)) score += 80;
		if (key.aliases.some((alias) => alias.startsWith(q))) score += 60;
		if (
			key.label
				.toLowerCase()
				.split(/\s+/)
				.some((word) => word.startsWith(q))
		)
			score += 40;
		if (score === 0 && key.haystack.includes(q)) score += 10;
		if (score > 0) scored.push({ key, score });
	}

	scored.sort((a, b) => b.score - a.score);
	return scored.map((entry) => entry.key);
}

export function matchesQuery(key: SearchableKey, query: string): boolean {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	return key.haystack.includes(q);
}
