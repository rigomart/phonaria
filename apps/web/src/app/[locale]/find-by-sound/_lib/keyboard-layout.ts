import {
	ConsonantIpaRegistry,
	type ConsonantSymbolId,
	DiphthongIpaRegistry,
	MonophthongIpaRegistry,
	PhonemeArpabetLabel,
	type PhonemeSymbolId,
} from "@phonaria/phonetics-data";

// Infer types from registries
type MonophthongSymbolId = keyof typeof MonophthongIpaRegistry;
type DiphthongSymbolId = keyof typeof DiphthongIpaRegistry;

export type KeyboardPhoneme = {
	id: PhonemeSymbolId;
	ipa: string;
	arpabet: string;
};

// Consonants organized by manner of articulation for compact display
// Order: plosives, fricatives, affricates, nasals, approximants

const CONSONANT_ORDER: ConsonantSymbolId[] = [
	// Plosives (6)
	"P",
	"B",
	"T",
	"D",
	"K",
	"G",
	// Fricatives (9)
	"F",
	"V",
	"TH",
	"DH",
	"S",
	"Z",
	"SH",
	"ZH",
	"H",
	// Affricates (2)
	"CH",
	"J",
	// Nasals (3)
	"M",
	"N",
	"NG",
	// Approximants (4)
	"L",
	"R",
	"Y",
	"W",
];

// Monophthongs organized by height for compact display
const MONOPHTHONG_ORDER: MonophthongSymbolId[] = [
	// High (4)
	"I",
	"IX",
	"UX",
	"U",
	// Mid (4)
	"E",
	"AX",
	"AH",
	"O",
	// Low (3)
	"AE",
	"A",
	"ER",
];

// Diphthongs in a single row
const DIPHTHONG_ORDER: DiphthongSymbolId[] = ["EI", "OU", "AI", "AU", "OI"];

function mapToKeyboardPhoneme<T extends PhonemeSymbolId>(
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
	mapToKeyboardPhoneme(id, ConsonantIpaRegistry),
);

export const MONOPHTHONG_KEYBOARD: KeyboardPhoneme[] = MONOPHTHONG_ORDER.map((id) =>
	mapToKeyboardPhoneme(id, MonophthongIpaRegistry),
);

export const DIPHTHONG_KEYBOARD: KeyboardPhoneme[] = DIPHTHONG_ORDER.map((id) =>
	mapToKeyboardPhoneme(id, DiphthongIpaRegistry),
);

export const VOWEL_KEYBOARD: KeyboardPhoneme[] = [...MONOPHTHONG_KEYBOARD, ...DIPHTHONG_KEYBOARD];

export const ALL_PHONEMES: KeyboardPhoneme[] = [...CONSONANT_KEYBOARD, ...VOWEL_KEYBOARD];
