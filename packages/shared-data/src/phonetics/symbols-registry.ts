// Base types
type PhonemeSymbolEntry<
	Ipa extends string = string,
	Arpa extends string = string,
	CmuArpa extends readonly string[] = readonly string[],
> = {
	ipa: Ipa;
	arpa: Arpa;
	cmuArpa: CmuArpa;
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
type ConsonantSymbolEntry = PhonemeSymbolEntry;

export const consonantPhonemeSymbols = {
	"voiceless-bilabial-stop": { ipa: "p", arpa: "P", cmuArpa: ["P"] },
	"voiced-bilabial-stop": { ipa: "b", arpa: "B", cmuArpa: ["B"] },
	"voiceless-alveolar-stop": { ipa: "t", arpa: "T", cmuArpa: ["T"] },
	"voiced-alveolar-stop": { ipa: "d", arpa: "D", cmuArpa: ["D"] },
	"voiced-velar-stop": { ipa: "ɡ", arpa: "G", cmuArpa: ["G"] },
	"voiceless-velar-stop": { ipa: "k", arpa: "K", cmuArpa: ["K"] },
	"voiced-dental-fricative": { ipa: "ð", arpa: "DH", cmuArpa: ["DH"] },
	"voiceless-dental-fricative": { ipa: "θ", arpa: "TH", cmuArpa: ["TH"] },
	"voiceless-labiodental-fricative": { ipa: "f", arpa: "F", cmuArpa: ["F"] },
	"voiced-labiodental-fricative": { ipa: "v", arpa: "V", cmuArpa: ["V"] },
	"voiceless-glottal-fricative": { ipa: "h", arpa: "HH", cmuArpa: ["HH"] },
	"voiceless-alveolar-fricative": { ipa: "s", arpa: "S", cmuArpa: ["S"] },
	"voiceless-postalveolar-fricative": { ipa: "ʃ", arpa: "SH", cmuArpa: ["SH"] },
	"voiced-alveolar-fricative": { ipa: "z", arpa: "Z", cmuArpa: ["Z"] },
	"voiced-postalveolar-fricative": { ipa: "ʒ", arpa: "ZH", cmuArpa: ["ZH"] },
	"voiced-postalveolar-affricate": { ipa: "dʒ", arpa: "JH", cmuArpa: ["JH"] },
	"voiceless-postalveolar-affricate": { ipa: "tʃ", arpa: "CH", cmuArpa: ["CH"] },
	"voiced-bilabial-nasal": { ipa: "m", arpa: "M", cmuArpa: ["M"] },
	"voiced-alveolar-nasal": { ipa: "n", arpa: "N", cmuArpa: ["N"] },
	"voiced-velar-nasal": { ipa: "ŋ", arpa: "NG", cmuArpa: ["NG"] },
	"voiced-alveolar-lateral-approximant": { ipa: "l", arpa: "L", cmuArpa: ["L"] },
	"voiced-postalveolar-approximant": { ipa: "ɹ", arpa: "R", cmuArpa: ["R"] },
	"voiced-palatal-approximant": { ipa: "j", arpa: "Y", cmuArpa: ["Y"] },
	"voiced-labial-velar-approximant": { ipa: "w", arpa: "W", cmuArpa: ["W"] },
} as const satisfies Partial<Record<ConsonantPhonemeIdPattern, ConsonantSymbolEntry>>;

export type ConsonantSymbolId = keyof typeof consonantPhonemeSymbols;
export type ConsonantSymbol = (typeof consonantPhonemeSymbols)[ConsonantSymbolId];
export type ConsonantSymbolIpa = ConsonantSymbol["ipa"];
export type ConsonantSymbolArpa = ConsonantSymbol["arpa"];
export type ConsonantSymbolCmuArpa = ConsonantSymbol["cmuArpa"][number];

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
type MonophthongSymbolEntry = PhonemeSymbolEntry;

export const monophthongPhonemeSymbols = {
	"close-front-unrounded": { ipa: "i", arpa: "IY", cmuArpa: ["IY0", "IY1", "IY2"] },
	"close-back-rounded": { ipa: "u", arpa: "UW", cmuArpa: ["UW0", "UW1", "UW2"] },
	"near-close-near-front-unrounded": {
		ipa: "ɪ",
		arpa: "IH",
		cmuArpa: ["IH0", "IH1", "IH2"],
	},
	"near-close-near-back-rounded": { ipa: "ʊ", arpa: "UH", cmuArpa: ["UH0", "UH1", "UH2"] },
	"mid-central-unrounded": { ipa: "ə", arpa: "AX", cmuArpa: ["AH0"] },
	"open-mid-front-unrounded": { ipa: "ɛ", arpa: "EH", cmuArpa: ["EH0", "EH1", "EH2"] },
	"open-mid-back-unrounded": { ipa: "ʌ", arpa: "AH", cmuArpa: ["AH1", "AH2"] },
	"open-mid-back-rounded": { ipa: "ɔ", arpa: "AO", cmuArpa: ["AO0", "AO1", "AO2"] },
	"near-open-front-unrounded": { ipa: "æ", arpa: "AE", cmuArpa: ["AE0", "AE1", "AE2"] },
	"open-back-unrounded": { ipa: "ɑ", arpa: "AA", cmuArpa: ["AA0", "AA1", "AA2"] },
} as const satisfies Partial<Record<MonophthongPhonemeIdPattern, MonophthongSymbolEntry>>;

export type MonophthongSymbolId = keyof typeof monophthongPhonemeSymbols;
export type MonophthongSymbol = (typeof monophthongPhonemeSymbols)[MonophthongSymbolId];
export type MonophthongSymbolIpa = MonophthongSymbol["ipa"];
export type MonophthongSymbolArpa = MonophthongSymbol["arpa"];
export type MonophthongSymbolCmuArpa = MonophthongSymbol["cmuArpa"][number];

// Vowels - Diphthongs

//? Keep an eye on the definition of these types. They can hold a disproportionate amount of combinations.
//? They are fine here for their purpose as guards, but don't try to export them as they are.
type DiphthongPhonemeIdPattern =
	`${VowelHeight}-${VowelBackness}-${VowelRoundness}-to-${VowelHeight}-${VowelBackness}-${VowelRoundness}`;
type DiphthongSymbolEntry = PhonemeSymbolEntry;

export const diphthongPhonemeSymbols = {
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		ipa: "eɪ",
		arpa: "EY",
		cmuArpa: ["EY0", "EY1", "EY2"],
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		ipa: "oʊ",
		arpa: "OW",
		cmuArpa: ["OW0", "OW1", "OW2"],
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		ipa: "aɪ",
		arpa: "AY",
		cmuArpa: ["AY0", "AY1", "AY2"],
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		ipa: "aʊ",
		arpa: "AW",
		cmuArpa: ["AW0", "AW1", "AW2"],
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		ipa: "ɔɪ",
		arpa: "OY",
		cmuArpa: ["OY0", "OY1", "OY2"],
	},
} as const satisfies Partial<Record<DiphthongPhonemeIdPattern, DiphthongSymbolEntry>>;

export type DiphthongSymbolId = keyof typeof diphthongPhonemeSymbols;
export type DiphthongSymbol = (typeof diphthongPhonemeSymbols)[DiphthongSymbolId];
export type DiphthongSymbolIpa = DiphthongSymbol["ipa"];
export type DiphthongSymbolArpa = DiphthongSymbol["arpa"];
export type DiphthongSymbolCmuArpa = DiphthongSymbol["cmuArpa"][number];

// Vowels - Rhotic

type RhoticPhonemeIdPattern = `${VowelHeight}-${VowelBackness}-rhotic-${VowelTenseness}`;
type RhoticSymbolEntry = PhonemeSymbolEntry;

export const rhoticPhonemeSymbols = {
	"mid-central-rhotic-tense": { ipa: "ɝ", arpa: "ER", cmuArpa: ["ER1", "ER2"] },
	"mid-central-rhotic-lax": { ipa: "ɚ", arpa: "ER", cmuArpa: ["ER0"] },
} as const satisfies Partial<Record<RhoticPhonemeIdPattern, RhoticSymbolEntry>>;

export type RhoticSymbolId = keyof typeof rhoticPhonemeSymbols;
export type RhoticSymbol = (typeof rhoticPhonemeSymbols)[RhoticSymbolId];
export type RhoticSymbolIpa = RhoticSymbol["ipa"];
export type RhoticSymbolArpa = RhoticSymbol["arpa"];
export type RhoticSymbolCmuArpa = RhoticSymbol["cmuArpa"][number];

// Vowels - All

type VowelPhonemeIdPattern =
	| MonophthongPhonemeIdPattern
	| DiphthongPhonemeIdPattern
	| RhoticPhonemeIdPattern;
type VowelSymbolEntry = PhonemeSymbolEntry;

export const vowelPhonemeSymbols = {
	...monophthongPhonemeSymbols,
	...diphthongPhonemeSymbols,
	...rhoticPhonemeSymbols,
} as const satisfies Partial<Record<VowelPhonemeIdPattern, VowelSymbolEntry>>;

export type VowelSymbolId = keyof typeof vowelPhonemeSymbols;
export type VowelSymbol = (typeof vowelPhonemeSymbols)[VowelSymbolId];
export type VowelSymbolIpa = VowelSymbol["ipa"];
export type VowelSymbolArpa = VowelSymbol["arpa"];
export type VowelSymbolCmuArpa = VowelSymbol["cmuArpa"][number];

// All
export const allPhonemeSymbols = {
	...consonantPhonemeSymbols,
	...vowelPhonemeSymbols,
} as const;

export type PhonemeSymbolId = keyof typeof allPhonemeSymbols;
export type PhonemeSymbol = (typeof allPhonemeSymbols)[PhonemeSymbolId];
export type PhonemeSymbolIpa = PhonemeSymbol["ipa"];
export type PhonemeSymbolArpa = PhonemeSymbol["arpa"];
export type PhonemeSymbolCmuArpa = PhonemeSymbol["cmuArpa"][number];
