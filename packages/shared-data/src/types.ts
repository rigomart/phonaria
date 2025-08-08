export interface ExampleWord {
	word: string;
	phonemic: string;
}

export interface ConsonantArticulation {
	place:
		| "bilabial"
		| "labiodental"
		| "dental"
		| "alveolar"
		| "postalveolar"
		| "palatal"
		| "velar"
		| "glottal";
	manner: "stop" | "fricative" | "affricate" | "nasal" | "liquid" | "glide";
	voicing: "voiced" | "voiceless";
	illustrationUrl?: string;
}

export interface VowelArticulation {
	height: "high" | "near-high" | "high-mid" | "mid" | "low-mid" | "near-low" | "low";
	frontness: "front" | "near-front" | "central" | "near-back" | "back";
	roundness: "rounded" | "unrounded";
	tenseness: "tense" | "lax";
	rhoticity?: "rhotic" | "non-rhotic";
	illustrationUrl?: string;
}

export interface ConsonantAllophone {
	variant: string;
	description: string;
	examples: ExampleWord[];
	context?: string;
	illustrationUrl?: string;
}

export interface VowelAllophone {
	variant: string;
	description: string;
	examples: ExampleWord[];
	context?: string;
}

export interface ConsonantPhoneme {
	symbol: string;
	category: "consonant";
	type: "stop" | "fricative" | "affricate" | "nasal" | "liquid" | "glide";
	articulation: ConsonantArticulation;
	examples: ExampleWord[];
	description: string;
	guide: string;
	allophones?: ConsonantAllophone[];
}

export interface VowelPhoneme {
	symbol: string;
	category: "vowel";
	type: "monophthong" | "diphthong" | "rhotic";
	articulation: VowelArticulation;
	examples: ExampleWord[];
	description: string;
	guide: string;
	allophones?: VowelAllophone[];
}

export type IpaPhoneme = ConsonantPhoneme | VowelPhoneme;

export interface PhonemesData {
	consonants: ConsonantPhoneme[];
	vowels: VowelPhoneme[];
}
