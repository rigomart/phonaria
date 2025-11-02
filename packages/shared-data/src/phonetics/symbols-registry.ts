// Base types
type PhonemeSymbolEntry<
	Id extends string,
	Ipa extends string = string,
	Arpa extends string = string,
> = {
	id: Id;
	ipa: Ipa;
	arpa: Arpa;
};

// Consonants

export type ConsonantVoicing = "voiced" | "voiceless";
export type ConsonantPlace =
	| "bilabial"
	| "alveolar"
	| "velar"
	| "labial-velar"
	| "palatal"
	| "labiodental"
	| "glottal"
	| "postalveolar"
	| "dental"
	| "alveolar-lateral";
export type ConsonantManner = "stop" | "fricative" | "affricate" | "nasal" | "approximant";

type ConsonantPhonemeIdPattern = `${ConsonantVoicing}-${ConsonantPlace}-${ConsonantManner}`;
type ConsonantSymbolEntry = PhonemeSymbolEntry<ConsonantPhonemeIdPattern>;

export const consonantPhonemeSymbols = [
	{ id: "voiceless-bilabial-stop", ipa: "p", arpa: "P" },
	{ id: "voiced-bilabial-stop", ipa: "b", arpa: "B" },
	{ id: "voiceless-alveolar-stop", ipa: "t", arpa: "T" },
	{ id: "voiced-alveolar-stop", ipa: "d", arpa: "D" },
	{ id: "voiced-velar-stop", ipa: "ɡ", arpa: "G" },
	{ id: "voiceless-velar-stop", ipa: "k", arpa: "K" },
	{ id: "voiced-dental-fricative", ipa: "ð", arpa: "DH" },
	{ id: "voiceless-dental-fricative", ipa: "θ", arpa: "TH" },
	{ id: "voiceless-labiodental-fricative", ipa: "f", arpa: "F" },
	{ id: "voiced-labiodental-fricative", ipa: "v", arpa: "V" },
	{ id: "voiceless-glottal-fricative", ipa: "h", arpa: "HH" },
	{ id: "voiceless-alveolar-fricative", ipa: "s", arpa: "S" },
	{ id: "voiceless-postalveolar-fricative", ipa: "ʃ", arpa: "SH" },
	{ id: "voiced-alveolar-fricative", ipa: "z", arpa: "Z" },
	{ id: "voiced-postalveolar-fricative", ipa: "ʒ", arpa: "ZH" },
	{ id: "voiced-postalveolar-affricate", ipa: "dʒ", arpa: "JH" },
	{ id: "voiceless-postalveolar-affricate", ipa: "tʃ", arpa: "CH" },
	{ id: "voiced-bilabial-nasal", ipa: "m", arpa: "M" },
	{ id: "voiced-alveolar-nasal", ipa: "n", arpa: "N" },
	{ id: "voiced-velar-nasal", ipa: "ŋ", arpa: "NG" },
	{ id: "voiced-alveolar-lateral-approximant", ipa: "l", arpa: "L" },
	{ id: "voiced-postalveolar-approximant", ipa: "ɹ", arpa: "R" },
	{ id: "voiced-palatal-approximant", ipa: "j", arpa: "Y" },
	{ id: "voiced-labial-velar-approximant", ipa: "w", arpa: "W" },
] as const satisfies readonly ConsonantSymbolEntry[];

export type ConsonantSymbol = (typeof consonantPhonemeSymbols)[number];
export type ConsonantSymbolId = ConsonantSymbol["id"];
export type ConsonantSymbolIpa = ConsonantSymbol["ipa"];
export type ConsonantSymbolArpa = ConsonantSymbol["arpa"];

// Vowels

export type VowelHeight =
	| "close"
	| "near-close"
	| "close-mid"
	| "mid"
	| "open-mid"
	| "near-open"
	| "open";
export type VowelBackness = "front" | "near-front" | "central" | "near-back" | "back";
export type VowelRoundness = "rounded" | "unrounded";
export type VowelTenseness = "tense" | "lax";

// Vowels - Monophthongs

type MonophthongPhonemeIdPattern = `${VowelHeight}-${VowelBackness}-${VowelRoundness}`;
type MonophthongSymbolEntry = PhonemeSymbolEntry<MonophthongPhonemeIdPattern>;

export const monophthongPhonemeSymbols = [
	{ id: "close-front-unrounded", ipa: "i", arpa: "IY" },
	{ id: "close-back-rounded", ipa: "u", arpa: "UW" },
	{ id: "near-close-near-front-unrounded", ipa: "ɪ", arpa: "IH" },
	{ id: "near-close-near-back-rounded", ipa: "ʊ", arpa: "UH" },
	{ id: "mid-central-unrounded", ipa: "ə", arpa: "AX" },
	{ id: "open-mid-front-unrounded", ipa: "ɛ", arpa: "EH" },
	{ id: "open-mid-back-unrounded", ipa: "ʌ", arpa: "AH" },
	{ id: "open-mid-back-rounded", ipa: "ɔ", arpa: "AO" },
	{ id: "near-open-front-unrounded", ipa: "æ", arpa: "AE" },
	{ id: "open-back-unrounded", ipa: "ɑ", arpa: "AA" },
] as const satisfies readonly MonophthongSymbolEntry[];

export type MonophthongSymbol = (typeof monophthongPhonemeSymbols)[number];
export type MonophthongSymbolId = MonophthongSymbol["id"];
export type MonophthongSymbolIpa = MonophthongSymbol["ipa"];
export type MonophthongSymbolArpa = MonophthongSymbol["arpa"];

// Vowels - Diphthongs

//? Keep an eye on the definition of these types. They can hold a disproportionate amount of combinations.
//? They are fine here for their purpose as guards, but don't try to export them as they are.
type DiphthongPhonemeIdPattern =
	`${VowelHeight}-${VowelBackness}-${VowelRoundness}-to-${VowelHeight}-${VowelBackness}-${VowelRoundness}`;
type DiphthongSymbolEntry = PhonemeSymbolEntry<DiphthongPhonemeIdPattern>;

export const diphthongPhonemeSymbols = [
	{ id: "close-mid-front-unrounded-to-near-close-near-front-unrounded", ipa: "eɪ", arpa: "EY" },
	{ id: "close-mid-back-rounded-to-near-close-near-back-rounded", ipa: "oʊ", arpa: "OW" },
	{ id: "open-front-unrounded-to-near-close-near-front-unrounded", ipa: "aɪ", arpa: "AY" },
	{ id: "open-front-unrounded-to-near-close-near-back-rounded", ipa: "aʊ", arpa: "AW" },
	{ id: "open-mid-back-rounded-to-near-close-near-front-unrounded", ipa: "ɔɪ", arpa: "OY" },
] as const satisfies readonly DiphthongSymbolEntry[];

export type DiphthongSymbol = (typeof diphthongPhonemeSymbols)[number];
export type DiphthongSymbolId = DiphthongSymbol["id"];
export type DiphthongSymbolIpa = DiphthongSymbol["ipa"];
export type DiphthongSymbolArpa = DiphthongSymbol["arpa"];

// Vowels - Rhotic

type RhoticPhonemeIdPattern = `${VowelHeight}-${VowelBackness}-rhotic-${VowelTenseness}`;
type RhoticSymbolEntry = PhonemeSymbolEntry<RhoticPhonemeIdPattern>;

export const rhoticPhonemeSymbols = [
	{ id: "mid-central-rhotic-tense", ipa: "ɝ", arpa: "ER" },
	{ id: "mid-central-rhotic-lax", ipa: "ɚ", arpa: "ER" },
] as const satisfies readonly RhoticSymbolEntry[];

export type RhoticSymbol = (typeof rhoticPhonemeSymbols)[number];
export type RhoticSymbolId = RhoticSymbol["id"];
export type RhoticSymbolIpa = RhoticSymbol["ipa"];
export type RhoticSymbolArpa = RhoticSymbol["arpa"];

// Vowels - All

type VowelPhonemeIdPattern =
	| MonophthongPhonemeIdPattern
	| DiphthongPhonemeIdPattern
	| RhoticPhonemeIdPattern;
type VowelSymbolEntry = PhonemeSymbolEntry<VowelPhonemeIdPattern>;

export const vowelPhonemeSymbols = [
	...monophthongPhonemeSymbols,
	...diphthongPhonemeSymbols,
	...rhoticPhonemeSymbols,
] as const satisfies readonly VowelSymbolEntry[];

export type VowelSymbol = (typeof vowelPhonemeSymbols)[number];
export type VowelSymbolId = VowelSymbol["id"];
export type VowelSymbolIpa = VowelSymbol["ipa"];
export type VowelSymbolArpa = VowelSymbol["arpa"];

// All
export const allPhonemeSymbols = [...consonantPhonemeSymbols, ...vowelPhonemeSymbols] as const;

export type PhonemeSymbol = (typeof allPhonemeSymbols)[number];
export type PhonemeSymbolId = PhonemeSymbol["id"];
export type PhonemeSymbolIpa = PhonemeSymbol["ipa"];
export type PhonemeSymbolArpa = PhonemeSymbol["arpa"];

export const phonemeSymbolById = new Map<PhonemeSymbolId, PhonemeSymbol>(
	allPhonemeSymbols.map((p) => [p.id, p]),
);

export const phonemeSymbolByArpa = new Map<PhonemeSymbolArpa, PhonemeSymbol>(
	allPhonemeSymbols.map((p) => [p.arpa, p]),
);
