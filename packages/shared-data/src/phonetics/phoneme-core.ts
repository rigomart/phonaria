// Base types
type BasePhonemeCore<
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
type ConsonantPhonemeEntry = BasePhonemeCore<ConsonantPhonemeIdPattern>;

export const consonantPhonemesCore = [
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
] as const satisfies readonly ConsonantPhonemeEntry[];

export type ConsonantPhonemeCore = (typeof consonantPhonemesCore)[number];
export type ConsonantPhonemeId = ConsonantPhonemeCore["id"];
export type ConsonantPhonemeIpa = ConsonantPhonemeCore["ipa"];
export type ConsonantPhonemeArpa = ConsonantPhonemeCore["arpa"];

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
type MonophthongPhonemeEntry = BasePhonemeCore<MonophthongPhonemeIdPattern>;

export const monophthongPhonemesCore = [
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
] as const satisfies readonly MonophthongPhonemeEntry[];

export type MonophthongPhonemeCore = (typeof monophthongPhonemesCore)[number];
export type MonophthongPhonemeId = MonophthongPhonemeCore["id"];
export type MonophthongPhonemeIpa = MonophthongPhonemeCore["ipa"];
export type MonophthongPhonemeArpa = MonophthongPhonemeCore["arpa"];

// Vowels - Diphthongs

//? Keep an eye on the definition of these types. They can hold a disproportionate amount of combinations.
//? They are fine here for their purpose, but don't try to export them as they are.
type DiphthongPhonemeIdPattern =
	`${VowelHeight}-${VowelBackness}-${VowelRoundness}-to-${VowelHeight}-${VowelBackness}-${VowelRoundness}`;
type DiphthongPhonemeEntry = BasePhonemeCore<DiphthongPhonemeIdPattern>;

export const diphthongPhonemesCore = [
	{ id: "close-mid-front-unrounded-to-near-close-near-front-unrounded", ipa: "eɪ", arpa: "EY" },
	{ id: "close-mid-back-rounded-to-near-close-near-back-rounded", ipa: "oʊ", arpa: "OW" },
	{ id: "open-front-unrounded-to-near-close-near-front-unrounded", ipa: "aɪ", arpa: "AY" },
	{ id: "open-front-unrounded-to-near-close-near-back-rounded", ipa: "aʊ", arpa: "AW" },
	{ id: "open-mid-back-rounded-to-near-close-near-front-unrounded", ipa: "ɔɪ", arpa: "OY" },
] as const satisfies readonly DiphthongPhonemeEntry[];

export type DiphthongPhonemeCore = (typeof diphthongPhonemesCore)[number];
export type DiphthongPhonemeId = DiphthongPhonemeCore["id"];
export type DiphthongPhonemeIpa = DiphthongPhonemeCore["ipa"];
export type DiphthongPhonemeArpa = DiphthongPhonemeCore["arpa"];

// Vowels - Rhotic

type RhoticPhonemeIdPattern = `${VowelHeight}-${VowelBackness}-rhotic-${VowelTenseness}`;
type RhoticPhonemeEntry = BasePhonemeCore<RhoticPhonemeIdPattern>;

export const rhoticPhonemesCore = [
	{ id: "mid-central-rhotic-tense", ipa: "ɝ", arpa: "ER" },
	{ id: "mid-central-rhotic-lax", ipa: "ɚ", arpa: "ER" },
] as const satisfies readonly RhoticPhonemeEntry[];

export type RhoticPhonemeCore = (typeof rhoticPhonemesCore)[number];
export type RhoticPhonemeId = RhoticPhonemeCore["id"];
export type RhoticPhonemeIpa = RhoticPhonemeCore["ipa"];
export type RhoticPhonemeArpa = RhoticPhonemeCore["arpa"];

// Vowels - All

type VowelPhonemeIdPattern =
	| MonophthongPhonemeIdPattern
	| DiphthongPhonemeIdPattern
	| RhoticPhonemeIdPattern;
type VowelPhonemeEntry = BasePhonemeCore<VowelPhonemeIdPattern>;

export const vowelPhonemesCore = [
	...monophthongPhonemesCore,
	...diphthongPhonemesCore,
	...rhoticPhonemesCore,
] as const satisfies readonly VowelPhonemeEntry[];

export type VowelPhonemeCore = (typeof vowelPhonemesCore)[number];
export type VowelPhonemeId = VowelPhonemeCore["id"];
export type VowelPhonemeIpa = VowelPhonemeCore["ipa"];
export type VowelPhonemeArpa = VowelPhonemeCore["arpa"];

// All
export const allPhonemesCore = [...consonantPhonemesCore, ...vowelPhonemesCore] as const;

export type PhonemeCore = (typeof allPhonemesCore)[number];
export type PhonemeId = PhonemeCore["id"];
export type PhonemeIpa = PhonemeCore["ipa"];
export type PhonemeArpa = PhonemeCore["arpa"];

const phonemeCoreById = new Map<PhonemeId, PhonemeCore>(allPhonemesCore.map((p) => [p.id, p]));

export function getPhonemeByIdCore(id: PhonemeId): PhonemeCore | undefined {
	return phonemeCoreById.get(id);
}

export function getPhonemeByIpaCore(ipa: string): PhonemeCore | undefined {
	return allPhonemesCore.find((p) => p.ipa === ipa);
}

export function getPhonemeByArpaCore(arpa: string): PhonemeCore | undefined {
	return allPhonemesCore.find((p) => p.arpa === arpa);
}
