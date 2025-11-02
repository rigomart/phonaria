// Base types
type PhonemeSymbolEntry<
	Id extends string,
	Ipa extends string = string,
	Arpa extends string = string,
	CmuArpa extends readonly string[] = readonly string[],
> = {
	id: Id;
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
type ConsonantSymbolEntry = PhonemeSymbolEntry<ConsonantPhonemeIdPattern>;

export const consonantPhonemeSymbols = [
	{ id: "voiceless-bilabial-stop", ipa: "p", arpa: "P", cmuArpa: ["P"] },
	{ id: "voiced-bilabial-stop", ipa: "b", arpa: "B", cmuArpa: ["B"] },
	{ id: "voiceless-alveolar-stop", ipa: "t", arpa: "T", cmuArpa: ["T"] },
	{ id: "voiced-alveolar-stop", ipa: "d", arpa: "D", cmuArpa: ["D"] },
	{ id: "voiced-velar-stop", ipa: "ɡ", arpa: "G", cmuArpa: ["G"] },
	{ id: "voiceless-velar-stop", ipa: "k", arpa: "K", cmuArpa: ["K"] },
	{ id: "voiced-dental-fricative", ipa: "ð", arpa: "DH", cmuArpa: ["DH"] },
	{ id: "voiceless-dental-fricative", ipa: "θ", arpa: "TH", cmuArpa: ["TH"] },
	{ id: "voiceless-labiodental-fricative", ipa: "f", arpa: "F", cmuArpa: ["F"] },
	{ id: "voiced-labiodental-fricative", ipa: "v", arpa: "V", cmuArpa: ["V"] },
	{ id: "voiceless-glottal-fricative", ipa: "h", arpa: "HH", cmuArpa: ["HH"] },
	{ id: "voiceless-alveolar-fricative", ipa: "s", arpa: "S", cmuArpa: ["S"] },
	{ id: "voiceless-postalveolar-fricative", ipa: "ʃ", arpa: "SH", cmuArpa: ["SH"] },
	{ id: "voiced-alveolar-fricative", ipa: "z", arpa: "Z", cmuArpa: ["Z"] },
	{ id: "voiced-postalveolar-fricative", ipa: "ʒ", arpa: "ZH", cmuArpa: ["ZH"] },
	{ id: "voiced-postalveolar-affricate", ipa: "dʒ", arpa: "JH", cmuArpa: ["JH"] },
	{ id: "voiceless-postalveolar-affricate", ipa: "tʃ", arpa: "CH", cmuArpa: ["CH"] },
	{ id: "voiced-bilabial-nasal", ipa: "m", arpa: "M", cmuArpa: ["M"] },
	{ id: "voiced-alveolar-nasal", ipa: "n", arpa: "N", cmuArpa: ["N"] },
	{ id: "voiced-velar-nasal", ipa: "ŋ", arpa: "NG", cmuArpa: ["NG"] },
	{ id: "voiced-alveolar-lateral-approximant", ipa: "l", arpa: "L", cmuArpa: ["L"] },
	{ id: "voiced-postalveolar-approximant", ipa: "ɹ", arpa: "R", cmuArpa: ["R"] },
	{ id: "voiced-palatal-approximant", ipa: "j", arpa: "Y", cmuArpa: ["Y"] },
	{ id: "voiced-labial-velar-approximant", ipa: "w", arpa: "W", cmuArpa: ["W"] },
] as const satisfies readonly ConsonantSymbolEntry[];

export type ConsonantSymbol = (typeof consonantPhonemeSymbols)[number];
export type ConsonantSymbolId = ConsonantSymbol["id"];
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
type MonophthongSymbolEntry = PhonemeSymbolEntry<MonophthongPhonemeIdPattern>;

export const monophthongPhonemeSymbols = [
	{ id: "close-front-unrounded", ipa: "i", arpa: "IY", cmuArpa: ["IY0", "IY1", "IY2"] },
	{ id: "close-back-rounded", ipa: "u", arpa: "UW", cmuArpa: ["UW0", "UW1", "UW2"] },
	{ id: "near-close-near-front-unrounded", ipa: "ɪ", arpa: "IH", cmuArpa: ["IH0", "IH1", "IH2"] },
	{ id: "near-close-near-back-rounded", ipa: "ʊ", arpa: "UH", cmuArpa: ["UH0", "UH1", "UH2"] },
	{ id: "mid-central-unrounded", ipa: "ə", arpa: "AX", cmuArpa: ["AH0"] },
	{ id: "open-mid-front-unrounded", ipa: "ɛ", arpa: "EH", cmuArpa: ["EH0", "EH1", "EH2"] },
	{ id: "open-mid-back-unrounded", ipa: "ʌ", arpa: "AH", cmuArpa: ["AH1", "AH2"] },
	{ id: "open-mid-back-rounded", ipa: "ɔ", arpa: "AO", cmuArpa: ["AO0", "AO1", "AO2"] },
	{ id: "near-open-front-unrounded", ipa: "æ", arpa: "AE", cmuArpa: ["AE0", "AE1", "AE2"] },
	{ id: "open-back-unrounded", ipa: "ɑ", arpa: "AA", cmuArpa: ["AA0", "AA1", "AA2"] },
] as const satisfies readonly MonophthongSymbolEntry[];

export type MonophthongSymbol = (typeof monophthongPhonemeSymbols)[number];
export type MonophthongSymbolId = MonophthongSymbol["id"];
export type MonophthongSymbolIpa = MonophthongSymbol["ipa"];
export type MonophthongSymbolArpa = MonophthongSymbol["arpa"];
export type MonophthongSymbolCmuArpa = MonophthongSymbol["cmuArpa"][number];

// Vowels - Diphthongs

//? Keep an eye on the definition of these types. They can hold a disproportionate amount of combinations.
//? They are fine here for their purpose as guards, but don't try to export them as they are.
type DiphthongPhonemeIdPattern =
	`${VowelHeight}-${VowelBackness}-${VowelRoundness}-to-${VowelHeight}-${VowelBackness}-${VowelRoundness}`;
type DiphthongSymbolEntry = PhonemeSymbolEntry<DiphthongPhonemeIdPattern>;

export const diphthongPhonemeSymbols = [
	{
		id: "close-mid-front-unrounded-to-near-close-near-front-unrounded",
		ipa: "eɪ",
		arpa: "EY",
		cmuArpa: ["EY0", "EY1", "EY2"],
	},
	{
		id: "close-mid-back-rounded-to-near-close-near-back-rounded",
		ipa: "oʊ",
		arpa: "OW",
		cmuArpa: ["OW0", "OW1", "OW2"],
	},
	{
		id: "open-front-unrounded-to-near-close-near-front-unrounded",
		ipa: "aɪ",
		arpa: "AY",
		cmuArpa: ["AY0", "AY1", "AY2"],
	},
	{
		id: "open-front-unrounded-to-near-close-near-back-rounded",
		ipa: "aʊ",
		arpa: "AW",
		cmuArpa: ["AW0", "AW1", "AW2"],
	},
	{
		id: "open-mid-back-rounded-to-near-close-near-front-unrounded",
		ipa: "ɔɪ",
		arpa: "OY",
		cmuArpa: ["OY0", "OY1", "OY2"],
	},
] as const satisfies readonly DiphthongSymbolEntry[];

export type DiphthongSymbol = (typeof diphthongPhonemeSymbols)[number];
export type DiphthongSymbolId = DiphthongSymbol["id"];
export type DiphthongSymbolIpa = DiphthongSymbol["ipa"];
export type DiphthongSymbolArpa = DiphthongSymbol["arpa"];
export type DiphthongSymbolCmuArpa = DiphthongSymbol["cmuArpa"][number];

// Vowels - Rhotic

type RhoticPhonemeIdPattern = `${VowelHeight}-${VowelBackness}-rhotic-${VowelTenseness}`;
type RhoticSymbolEntry = PhonemeSymbolEntry<RhoticPhonemeIdPattern>;

export const rhoticPhonemeSymbols = [
	{ id: "mid-central-rhotic-tense", ipa: "ɝ", arpa: "ER", cmuArpa: ["ER1", "ER2"] },
	{ id: "mid-central-rhotic-lax", ipa: "ɚ", arpa: "ER", cmuArpa: ["ER0"] },
] as const satisfies readonly RhoticSymbolEntry[];

export type RhoticSymbol = (typeof rhoticPhonemeSymbols)[number];
export type RhoticSymbolId = RhoticSymbol["id"];
export type RhoticSymbolIpa = RhoticSymbol["ipa"];
export type RhoticSymbolArpa = RhoticSymbol["arpa"];
export type RhoticSymbolCmuArpa = RhoticSymbol["cmuArpa"][number];

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
export type VowelSymbolCmuArpa = VowelSymbol["cmuArpa"][number];

// All
export const allPhonemeSymbols = [...consonantPhonemeSymbols, ...vowelPhonemeSymbols] as const;

export type PhonemeSymbol = (typeof allPhonemeSymbols)[number];
export type PhonemeSymbolId = PhonemeSymbol["id"];
export type PhonemeSymbolIpa = PhonemeSymbol["ipa"];
export type PhonemeSymbolArpa = PhonemeSymbol["arpa"];
export type PhonemeSymbolCmuArpa = PhonemeSymbol["cmuArpa"][number];

export const phonemeSymbolById = new Map<PhonemeSymbolId, PhonemeSymbol>(
	allPhonemeSymbols.map((p) => [p.id, p]),
);

export const phonemeSymbolByArpa = new Map<PhonemeSymbolArpa, PhonemeSymbol>(
	allPhonemeSymbols.map((p) => [p.arpa, p]),
);

export const phonemeSymbolByCmuArpa = new Map<PhonemeSymbolCmuArpa, PhonemeSymbol>(
	allPhonemeSymbols.flatMap((symbol) => symbol.cmuArpa.map((cmu) => [cmu, symbol] as const)),
);

/**
 * Extracts the stress digit from a CMU ARPABET phoneme
 * @param cmuArpa - CMU ARPABET phoneme (e.g., "IY1", "TH", "ER0")
 * @returns Stress level (0 = unstressed, 1 = primary, 2 = secondary) or null for consonants
 *
 * @example
 * getStress("IY1") // 1
 * getStress("ER0") // 0
 * getStress("TH")  // null
 */
export function getStress(cmuArpa: PhonemeSymbolCmuArpa): number | null {
	const match = cmuArpa.match(/([012])$/);
	return match ? Number.parseInt(match[1]) : null;
}
