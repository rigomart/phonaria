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
	"voiceless-bilabial-plosive",
	"voiced-bilabial-plosive",
	"voiceless-alveolar-plosive",
	"voiced-alveolar-plosive",
	"voiceless-velar-plosive",
	"voiced-velar-plosive",
	// Fricatives (9)
	"voiceless-labiodental-fricative",
	"voiced-labiodental-fricative",
	"voiceless-dental-fricative",
	"voiced-dental-fricative",
	"voiceless-alveolar-fricative",
	"voiced-alveolar-fricative",
	"voiceless-postalveolar-fricative",
	"voiced-postalveolar-fricative",
	"voiceless-glottal-fricative",
	// Affricates (2)
	"voiceless-postalveolar-affricate",
	"voiced-postalveolar-affricate",
	// Nasals (3)
	"voiced-bilabial-nasal",
	"voiced-alveolar-nasal",
	"voiced-velar-nasal",
	// Approximants (4)
	"voiced-alveolar-lateral-approximant",
	"voiced-postalveolar-approximant",
	"voiced-palatal-approximant",
	"voiced-labial-velar-approximant",
];

// Monophthongs organized by height for compact display
const MONOPHTHONG_ORDER: MonophthongSymbolId[] = [
	// High (4)
	"close-front-unrounded",
	"near-close-near-front-unrounded",
	"near-close-near-back-rounded",
	"close-back-rounded",
	// Mid (4)
	"open-mid-front-unrounded",
	"mid-central-unrounded",
	"open-mid-back-unrounded",
	"open-mid-back-rounded",
	// Low (3)
	"near-open-front-unrounded",
	"open-back-unrounded",
	"r-colored-open-mid-central",
];

// Diphthongs in a single row
const DIPHTHONG_ORDER: DiphthongSymbolId[] = [
	"close-mid-front-unrounded-to-near-close-near-front-unrounded",
	"close-mid-back-rounded-to-near-close-near-back-rounded",
	"open-front-unrounded-to-near-close-near-front-unrounded",
	"open-front-unrounded-to-near-close-near-back-rounded",
	"open-mid-back-rounded-to-near-close-near-front-unrounded",
];

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
