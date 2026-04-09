import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { ALL_PHONEMES, type KeyboardPhoneme } from "./keyboard-layout";
import { phonemeLabels } from "./phoneme-labels";

/** Common names and aliases for phonemes that learners might search for. */
const COMMON_NAMES: Partial<Record<EnglishPhonemeSymbolId, string[]>> = {
	AX: ["schwa"],
	TH: ["theta", "think"],
	DH: ["eth", "this", "that"],
	AE: ["ash", "trap", "short a", "cat"],
	NG: ["eng", "ring", "sing"],
	SH: ["esh", "ship"],
	ZH: ["ezh", "measure", "vision"],
	CH: ["chin", "church"],
	J: ["judge", "gin"],
	ER: ["r-colored", "bird", "nurse"],
	AH: ["strut", "wedge", "caret", "cup", "cut"],
	IX: ["kit", "bit", "sit"],
	UX: ["foot", "put", "book"],
	I: ["fleece", "bee", "see"],
	U: ["goose", "boot", "two"],
	E: ["dress", "bed", "said"],
	O: ["thought", "law", "caught"],
	A: ["lot", "palm", "father", "hot"],
	EI: ["face", "day", "say"],
	OU: ["goat", "go", "no"],
	AI: ["price", "my", "buy"],
	AU: ["mouth", "now", "out"],
	OI: ["choice", "boy", "coin"],
	P: ["pat", "pip"],
	B: ["bat", "bib"],
	T: ["tap", "tat"],
	D: ["dab", "did"],
	K: ["cat", "kick"],
	G: ["gap", "gig"],
	F: ["fat", "fin"],
	V: ["vat", "van"],
	S: ["sat", "sip"],
	Z: ["zap", "zoo"],
	H: ["hat", "him"],
	M: ["mat", "mum"],
	N: ["nap", "nun"],
	L: ["lap", "lull"],
	R: ["rap", "run"],
	Y: ["yak", "yes"],
	W: ["wag", "wet"],
};

export type SearchablePhoneme = KeyboardPhoneme & {
	label: string;
	commonNames: string[];
	/** All searchable terms as a single lowercased string for fast matching. */
	searchString: string;
};

/** Pre-built search index for all English phonemes. */
export const PHONEME_SEARCH_INDEX: SearchablePhoneme[] = ALL_PHONEMES.map((phoneme) => {
	const label = phonemeLabels[phoneme.id] ?? "";
	const commonNames = COMMON_NAMES[phoneme.id] ?? [];

	const searchTerms = [
		phoneme.ipa,
		phoneme.id.toLowerCase(),
		phoneme.arpabet.toLowerCase(),
		label.toLowerCase(),
		...commonNames.map((n) => n.toLowerCase()),
	];

	return {
		...phoneme,
		label,
		commonNames,
		searchString: searchTerms.join(" "),
	};
});

/**
 * Search phonemes by query. Matches against IPA symbol, ID, ARPABET,
 * articulatory label, and common names. Returns matches ranked by relevance.
 */
export function searchPhonemes(query: string): SearchablePhoneme[] {
	const q = query.trim().toLowerCase();
	if (q.length === 0) return [];

	type Scored = { phoneme: SearchablePhoneme; score: number };
	const results: Scored[] = [];

	for (const phoneme of PHONEME_SEARCH_INDEX) {
		let score = 0;

		// Exact IPA match (highest priority)
		if (phoneme.ipa === q) {
			score += 100;
		}

		// Exact ID match
		if (phoneme.id.toLowerCase() === q) {
			score += 90;
		}

		// Exact ARPABET match
		if (phoneme.arpabet.toLowerCase() === q) {
			score += 85;
		}

		// Exact common name match
		if (phoneme.commonNames.some((n) => n.toLowerCase() === q)) {
			score += 80;
		}

		// Common name starts with query
		if (phoneme.commonNames.some((n) => n.toLowerCase().startsWith(q))) {
			score += 60;
		}

		// Label word starts with query
		const labelWords = phoneme.label.toLowerCase().split(/\s+/);
		if (labelWords.some((w) => w.startsWith(q))) {
			score += 40;
		}

		// General substring match
		if (score === 0 && phoneme.searchString.includes(q)) {
			score += 10;
		}

		if (score > 0) {
			results.push({ phoneme, score });
		}
	}

	results.sort((a, b) => b.score - a.score);
	return results.map((r) => r.phoneme);
}
