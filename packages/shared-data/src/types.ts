export interface ExampleWord {
	word: string;
	phonemic: string;
}

export type MinimalPairCategory = "vowel" | "consonant";

export interface MinimalPairWordEntry {
	word: string;
	phonemic: string;
	graphemeHint?: string;
	audioUrl?: string;
	mouthHint?: string;
	pronunciationTip?: string;
	contextSentence?: string;
}

export interface MinimalPairExample {
	id: string;
	words: [MinimalPairWordEntry, MinimalPairWordEntry];
	contrastLabel: string;
	description?: string;
	practiceNote?: string;
}

export interface MinimalPairArticulationHighlight {
	phoneme: string;
	headline: string;
	details: string;
	illustrationUrl?: string;
}

export interface MinimalPairSet {
	id: string;
	slug: string;
	title: string;
	category: MinimalPairCategory;
	focusPhonemes: [string, string];
	summary: string;
	description?: string;
	tags: string[];
	difficulty: "foundational" | "intermediate" | "advanced";
	l1Notes?: string;
	articulationHighlights: MinimalPairArticulationHighlight[];
	pairs: MinimalPairExample[];
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
	audioUrl?: string;
	examples: ExampleWord[];
	description: string;
	guide: string;
	allophones?: ConsonantAllophone[];
}

export interface VowelPhoneme {
	symbol: string;
	category: "vowel";
	type: "monophthong" | "diphthong" | "rhotic";
	glideTarget?: string; // Only for diphthongs - explicit target vowel
	articulation: VowelArticulation;
	audioUrl?: string;
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

export interface ArticulationPlaceInfo {
	key: ConsonantArticulation["place"];
	label: string;
	short: string;
	description: string;
	how: string[];
	articulators: string[];
	diagram?: string;
	order: number;
}

export interface ArticulationMannerInfo {
	key: ConsonantArticulation["manner"];
	label: string;
	short: string;
	description: string;
	how: string[];
	airflow?: string;
	order: number;
}
