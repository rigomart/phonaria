export * from "./phoneme-core";

export type PhonemeVoicing = "voiced" | "voiceless";
export type PhonemePlace =
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
export type PhonemeManner = "stop" | "fricative" | "affricate" | "nasal" | "approximant";

export type VowelHeight =
	| "high"
	| "near-high"
	| "high-mid"
	| "mid"
	| "low-mid"
	| "near-low"
	| "low";
export type VowelFrontness = "front" | "near-front" | "central" | "near-back" | "back";
export type VowelRoundness = "rounded" | "unrounded";
export type VowelTenseness = "tense" | "lax";

export type ConsonantPhoneme = {
	id: string;
	category: "consonant";
	ipa: string;
	arpa: string;
	features: {
		voicing: PhonemeVoicing;
		place: PhonemePlace;
		manner: PhonemeManner;
	};
};

export type VowelPhoneme = {
	id: string;
	category: "vowel";
	type: "monophthong" | "diphthong" | "rhotic";
	ipa: string;
	arpa: string;
	features: {
		height: VowelHeight;
		frontness: VowelFrontness;
		roundness: VowelRoundness;
		tenseness: VowelTenseness;
		rhotic?: boolean;
	};
	glideTarget?: string;
};

export type Phoneme = ConsonantPhoneme | VowelPhoneme;
export type PhonemeId = string;

export const consonantPhonemes: ConsonantPhoneme[] = [
	{
		id: "voiceless-bilabial-stop",
		category: "consonant",
		ipa: "p",
		arpa: "P",
		features: { voicing: "voiceless", place: "bilabial", manner: "stop" },
	},
	{
		id: "voiced-bilabial-stop",
		category: "consonant",
		ipa: "b",
		arpa: "B",
		features: { voicing: "voiced", place: "bilabial", manner: "stop" },
	},
	{
		id: "voiceless-alveolar-stop",
		category: "consonant",
		ipa: "t",
		arpa: "T",
		features: { voicing: "voiceless", place: "alveolar", manner: "stop" },
	},
	{
		id: "voiced-alveolar-stop",
		category: "consonant",
		ipa: "d",
		arpa: "D",
		features: { voicing: "voiced", place: "alveolar", manner: "stop" },
	},
	{
		id: "voiced-velar-stop",
		category: "consonant",
		ipa: "ɡ",
		arpa: "G",
		features: { voicing: "voiced", place: "velar", manner: "stop" },
	},
	{
		id: "voiceless-velar-stop",
		category: "consonant",
		ipa: "k",
		arpa: "K",
		features: { voicing: "voiceless", place: "velar", manner: "stop" },
	},
	{
		id: "voiced-dental-fricative",
		category: "consonant",
		ipa: "ð",
		arpa: "DH",
		features: { voicing: "voiced", place: "dental", manner: "fricative" },
	},
	{
		id: "voiceless-dental-fricative",
		category: "consonant",
		ipa: "θ",
		arpa: "TH",
		features: { voicing: "voiceless", place: "dental", manner: "fricative" },
	},
	{
		id: "voiceless-labiodental-fricative",
		category: "consonant",
		ipa: "f",
		arpa: "F",
		features: { voicing: "voiceless", place: "labiodental", manner: "fricative" },
	},
	{
		id: "voiced-labiodental-fricative",
		category: "consonant",
		ipa: "v",
		arpa: "V",
		features: { voicing: "voiced", place: "labiodental", manner: "fricative" },
	},
	{
		id: "voiceless-glottal-fricative",
		category: "consonant",
		ipa: "h",
		arpa: "HH",
		features: { voicing: "voiceless", place: "glottal", manner: "fricative" },
	},
	{
		id: "voiceless-alveolar-fricative",
		category: "consonant",
		ipa: "s",
		arpa: "S",
		features: { voicing: "voiceless", place: "alveolar", manner: "fricative" },
	},
	{
		id: "voiceless-postalveolar-fricative",
		category: "consonant",
		ipa: "ʃ",
		arpa: "SH",
		features: { voicing: "voiceless", place: "postalveolar", manner: "fricative" },
	},
	{
		id: "voiced-alveolar-fricative",
		category: "consonant",
		ipa: "z",
		arpa: "Z",
		features: { voicing: "voiced", place: "alveolar", manner: "fricative" },
	},
	{
		id: "voiced-postalveolar-fricative",
		category: "consonant",
		ipa: "ʒ",
		arpa: "ZH",
		features: { voicing: "voiced", place: "postalveolar", manner: "fricative" },
	},
	{
		id: "voiced-postalveolar-affricate",
		category: "consonant",
		ipa: "dʒ",
		arpa: "JH",
		features: { voicing: "voiced", place: "postalveolar", manner: "affricate" },
	},
	{
		id: "voiceless-postalveolar-affricate",
		category: "consonant",
		ipa: "tʃ",
		arpa: "CH",
		features: { voicing: "voiceless", place: "postalveolar", manner: "affricate" },
	},
	{
		id: "voiced-bilabial-nasal",
		category: "consonant",
		ipa: "m",
		arpa: "M",
		features: { voicing: "voiced", place: "bilabial", manner: "nasal" },
	},
	{
		id: "voiced-alveolar-nasal",
		category: "consonant",
		ipa: "n",
		arpa: "N",
		features: { voicing: "voiced", place: "alveolar", manner: "nasal" },
	},
	{
		id: "voiced-velar-nasal",
		category: "consonant",
		ipa: "ŋ",
		arpa: "NG",
		features: { voicing: "voiced", place: "velar", manner: "nasal" },
	},
	{
		id: "voiced-alveolar-lateral-approximant",
		category: "consonant",
		ipa: "l",
		arpa: "L",
		features: { voicing: "voiced", place: "alveolar-lateral", manner: "approximant" },
	},
	{
		id: "voiced-postalveolar-approximant",
		category: "consonant",
		ipa: "ɹ",
		arpa: "R",
		features: { voicing: "voiced", place: "postalveolar", manner: "approximant" },
	},
	{
		id: "voiced-palatal-approximant",
		category: "consonant",
		ipa: "j",
		arpa: "Y",
		features: { voicing: "voiced", place: "palatal", manner: "approximant" },
	},
	{
		id: "voiced-labial-velar-approximant",
		category: "consonant",
		ipa: "w",
		arpa: "W",
		features: { voicing: "voiced", place: "labial-velar", manner: "approximant" },
	},
];

export const vowelPhonemes: VowelPhoneme[] = [
	{
		id: "high-front-tense-unrounded",
		category: "vowel",
		type: "monophthong",
		ipa: "i",
		arpa: "IY",
		features: { height: "high", frontness: "front", roundness: "unrounded", tenseness: "tense" },
	},
	{
		id: "near-high-near-front-lax-unrounded",
		category: "vowel",
		type: "monophthong",
		ipa: "ɪ",
		arpa: "IH",
		features: {
			height: "near-high",
			frontness: "near-front",
			roundness: "unrounded",
			tenseness: "lax",
		},
	},
	{
		id: "low-mid-front-lax-unrounded",
		category: "vowel",
		type: "monophthong",
		ipa: "ɛ",
		arpa: "EH",
		features: { height: "low-mid", frontness: "front", roundness: "unrounded", tenseness: "lax" },
	},
	{
		id: "near-low-front-lax-unrounded",
		category: "vowel",
		type: "monophthong",
		ipa: "æ",
		arpa: "AE",
		features: { height: "near-low", frontness: "front", roundness: "unrounded", tenseness: "lax" },
	},
	{
		id: "mid-central-lax-unrounded",
		category: "vowel",
		type: "monophthong",
		ipa: "ə",
		arpa: "AH",
		features: { height: "mid", frontness: "central", roundness: "unrounded", tenseness: "lax" },
	},
	{
		id: "low-mid-central-lax-unrounded",
		category: "vowel",
		type: "monophthong",
		ipa: "ʌ",
		arpa: "AH",
		features: { height: "low-mid", frontness: "central", roundness: "unrounded", tenseness: "lax" },
	},
	{
		id: "low-back-lax-unrounded",
		category: "vowel",
		type: "monophthong",
		ipa: "ɑ",
		arpa: "AA",
		features: { height: "low", frontness: "back", roundness: "unrounded", tenseness: "lax" },
	},
	{
		id: "low-mid-back-tense-rounded",
		category: "vowel",
		type: "monophthong",
		ipa: "ɔ",
		arpa: "AO",
		features: { height: "low-mid", frontness: "back", roundness: "rounded", tenseness: "tense" },
	},
	{
		id: "near-high-near-back-lax-rounded",
		category: "vowel",
		type: "monophthong",
		ipa: "ʊ",
		arpa: "UH",
		features: {
			height: "near-high",
			frontness: "near-back",
			roundness: "rounded",
			tenseness: "lax",
		},
	},
	{
		id: "high-back-tense-rounded",
		category: "vowel",
		type: "monophthong",
		ipa: "u",
		arpa: "UW",
		features: { height: "high", frontness: "back", roundness: "rounded", tenseness: "tense" },
	},
	{
		id: "mid-central-tense-rhotic",
		category: "vowel",
		type: "rhotic",
		ipa: "ɝ",
		arpa: "ER",
		features: {
			height: "mid",
			frontness: "central",
			roundness: "unrounded",
			tenseness: "tense",
			rhotic: true,
		},
	},
	{
		id: "mid-central-lax-rhotic",
		category: "vowel",
		type: "rhotic",
		ipa: "ɚ",
		arpa: "ER",
		features: {
			height: "mid",
			frontness: "central",
			roundness: "unrounded",
			tenseness: "lax",
			rhotic: true,
		},
	},
	{
		id: "high-mid-front-diphthong",
		category: "vowel",
		type: "diphthong",
		ipa: "eɪ",
		arpa: "EY",
		features: {
			height: "high-mid",
			frontness: "front",
			roundness: "unrounded",
			tenseness: "tense",
		},
		glideTarget: "ɪ",
	},
	{
		id: "low-central-to-high-front-diphthong",
		category: "vowel",
		type: "diphthong",
		ipa: "aɪ",
		arpa: "AY",
		features: { height: "low", frontness: "central", roundness: "unrounded", tenseness: "tense" },
		glideTarget: "ɪ",
	},
	{
		id: "low-mid-back-to-high-front-diphthong",
		category: "vowel",
		type: "diphthong",
		ipa: "ɔɪ",
		arpa: "OY",
		features: { height: "low-mid", frontness: "back", roundness: "rounded", tenseness: "tense" },
		glideTarget: "ɪ",
	},
	{
		id: "low-central-to-high-back-diphthong",
		category: "vowel",
		type: "diphthong",
		ipa: "aʊ",
		arpa: "AW",
		features: { height: "low", frontness: "central", roundness: "unrounded", tenseness: "tense" },
		glideTarget: "ʊ",
	},
	{
		id: "high-mid-back-diphthong",
		category: "vowel",
		type: "diphthong",
		ipa: "oʊ",
		arpa: "OW",
		features: { height: "high-mid", frontness: "back", roundness: "rounded", tenseness: "tense" },
		glideTarget: "ʊ",
	},
];

export const allPhonemes: Phoneme[] = [...consonantPhonemes, ...vowelPhonemes];

export function getPhonemeById(id: PhonemeId): Phoneme | undefined {
	return allPhonemes.find((p) => p.id === id);
}

export function getPhonemeByIpa(ipa: string): Phoneme | undefined {
	return allPhonemes.find((p) => p.ipa === ipa);
}

export function getPhonemeByArpa(arpa: string): Phoneme | undefined {
	return allPhonemes.find((p) => p.arpa === arpa);
}

export function isConsonant(phoneme: Phoneme): phoneme is ConsonantPhoneme {
	return phoneme.category === "consonant";
}

export function isVowel(phoneme: Phoneme): phoneme is VowelPhoneme {
	return phoneme.category === "vowel";
}
