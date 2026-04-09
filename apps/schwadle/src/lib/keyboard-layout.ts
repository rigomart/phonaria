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

export type KeyboardPhoneme = {
	id: EnglishPhonemeSymbolId;
	ipa: string;
	arpabet: string;
};

const CONSONANT_ORDER: EnglishConsonantSymbolId[] = [
	// Plosives
	"P",
	"B",
	"T",
	"D",
	"K",
	"G",
	// Fricatives
	"F",
	"V",
	"TH",
	"DH",
	"S",
	"Z",
	"SH",
	"ZH",
	"H",
	// Affricates
	"CH",
	"J",
	// Nasals
	"M",
	"N",
	"NG",
	// Approximants
	"L",
	"R",
	"Y",
	"W",
];

const MONOPHTHONG_ORDER: EnglishMonophthongSymbolId[] = [
	// High
	"I",
	"IX",
	"UX",
	"U",
	// Mid
	"E",
	"AX",
	"AH",
	"O",
	// Low
	"AE",
	"A",
	"ER",
];

const DIPHTHONG_ORDER: EnglishDiphthongSymbolId[] = ["EI", "OU", "AI", "AU", "OI"];

function mapToKeyboardPhoneme<T extends EnglishPhonemeSymbolId>(
	id: T,
	registry: Record<T, string>,
): KeyboardPhoneme {
	return {
		id,
		ipa: registry[id],
		arpabet: PhonemeArpabetLabel[id],
	};
}

export const CONSONANT_KEYBOARD: KeyboardPhoneme[] = CONSONANT_ORDER.map((id) =>
	mapToKeyboardPhoneme(id, ConsonantIpaMap),
);

export const MONOPHTHONG_KEYBOARD: KeyboardPhoneme[] = MONOPHTHONG_ORDER.map((id) =>
	mapToKeyboardPhoneme(id, MonophthongIpaMap),
);

export const DIPHTHONG_KEYBOARD: KeyboardPhoneme[] = DIPHTHONG_ORDER.map((id) =>
	mapToKeyboardPhoneme(id, DiphthongIpaMap),
);

export const VOWEL_KEYBOARD: KeyboardPhoneme[] = [...MONOPHTHONG_KEYBOARD, ...DIPHTHONG_KEYBOARD];

export const ALL_PHONEMES: KeyboardPhoneme[] = [...CONSONANT_KEYBOARD, ...VOWEL_KEYBOARD];
