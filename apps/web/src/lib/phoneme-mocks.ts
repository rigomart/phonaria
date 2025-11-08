/**
 * TODO: Temporary mock data for phoneme types and utilities
 * Replace with proper implementation from shared-data once new phonetics system is ready
 */

// Mock types
export type IpaPhoneme = ConsonantPhoneme | VowelPhoneme;

export interface ConsonantPhoneme {
	symbol: string;
	category: "consonant";
	type: "stop" | "fricative" | "affricate" | "nasal" | "liquid" | "glide";
	articulation: {
		place: string;
		manner: string;
		voicing: "voiced" | "voiceless";
	};
	examples: Array<{ word: string; phonemic: string }>;
	description: string;
	guide: string;
}

export interface VowelArticulation {
	height: string;
	frontness: string;
	roundness: string;
	tenseness: string;
	rhoticity?: string;
}

export interface VowelPhoneme {
	symbol: string;
	category: "vowel";
	type: "monophthong" | "diphthong" | "rhotic";
	glideTarget?: string;
	articulation: VowelArticulation;
	examples: Array<{ word: string; phonemic: string }>;
	description: string;
	guide: string;
}

export interface CategoryInfo {
	key: string;
	label: string;
	description: string;
	order: number;
}

// Mock data
export const consonants: ConsonantPhoneme[] = [];
export const vowels: VowelPhoneme[] = [];

// Mock utilities
export const phonariaUtils = {
	slugifyWord: (word: string): string => {
		return word
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
	},
	getExampleAudioUrl: (word: string): string => {
		const slug = word
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
		return `/audio/examples/${slug}.mp3`;
	},
	toPhonemic: (word: string): string => {
		// Mock implementation - return as-is
		return word;
	},
};

export function getOrderedCategories(category?: string): CategoryInfo[] {
	return [];
}

export function convertArpabetToIPA(arpaPhonemes: string[]): string[] {
	// Simplified mock - return as-is
	return arpaPhonemes;
}

export function normalizeCmuWord(input: string): string {
	const base = input.includes("(") ? input.replace(/\(\d+\)$/, "") : input;
	return base.toUpperCase();
}
