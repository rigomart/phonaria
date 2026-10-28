import {
	getPhonemeCategory,
	type PhonemeSymbolId,
	tokenizePronunciation,
	tryExtractBasePhonemeId,
} from "@phonaria/phonetics-data";
import type { CuratedWordData } from "@phonaria/phonetics-data/data/en/curated-1k";
import { validatePracticeEntries } from "@phonaria/phonetics-data/languages/en/practice";
import { loadTier2 } from "../phoneme-lookup/shared";
import type { TopicDefinition } from "./topics/types";

/**
 * Editorial blocklist for words that read badly in play (abbreviations,
 * initialisms, loanword fragments). Grows as bad words are spotted.
 */
const EditorialBlocklist: ReadonlySet<string> = new Set([
	"etc",
	"bmw",
	"aaa",
	"le",
	"feb",
	"aug",
	"w",
]);

/**
 * Shared word-suitability filter inherited by every topic: alphabetic
 * characters only, at least 3 letters, not blocklisted.
 */
export function isSuitableWord(word: string): boolean {
	return /^[a-z]+$/.test(word) && word.length >= 3 && !EditorialBlocklist.has(word);
}

export type FrequencyTier = "top-1k" | "top-5k" | "top-10k";

export function frequencyTierForRank(rank: number): FrequencyTier {
	if (rank < 1_000) return "top-1k";
	if (rank < 5_000) return "top-5k";
	return "top-10k";
}

/** Position of one topic-sound occurrence among a word's syllables. */
export type TopicSoundPosition = "initial" | "medial" | "final";

export interface PoolWord {
	word: string;
	/** Raw CMU variants (phoneme IDs with stress digits), in CMU order. */
	variants: readonly string[];
	/** 0-based frequency rank in the tier-2 data (which is frequency-ordered). */
	rank: number;
	frequencyTier: FrequencyTier;
	/** Facets below are computed from the first CMU variant. */
	syllableCount: number;
	topicSoundCount: number;
	/** One entry per topic-sound occurrence, in order of appearance. */
	topicSoundPositions: readonly TopicSoundPosition[];
}

/**
 * Returns eligible words in dictionary frequency order, restricted to curated entries when supplied.
 * Throws for duplicate, missing, changed, ambiguous or ineligible curated entries.
 * Facets use the first pronunciation and count topic sounds among vowel nuclei only.
 */
export function deriveWordPool(data: CuratedWordData, topic: TopicDefinition): PoolWord[] {
	const pinned = topic.curatedEntries
		? new Map(topic.curatedEntries.map(({ word, variant }) => [word, variant]))
		: undefined;
	if (topic.curatedEntries) {
		validatePracticeEntries(topic.curatedEntries, data.words);
		for (const { word, variant } of topic.curatedEntries) {
			if (!isSuitableWord(word) || !topic.isEligibleWord([variant]))
				throw new Error(`Pinned Practice word is not eligible for ${topic.id}: "${word}"`);
		}
	}
	const topicSounds = new Set<PhonemeSymbolId>(topic.topicSounds);
	const pool: PoolWord[] = [];

	let rank = -1;
	for (const [word, dictionaryVariants] of Object.entries(data.words)) {
		rank += 1;
		if (pinned && !pinned.has(word)) continue;
		const variant = pinned?.get(word);
		const variants = variant ? [variant] : dictionaryVariants;
		if (!isSuitableWord(word) || !topic.isEligibleWord(variants)) continue;

		// Vowel nuclei of the first variant: one per syllable, in order.
		const nuclei: PhonemeSymbolId[] = [];
		for (const token of tokenizePronunciation(variants[0])) {
			const baseId = tryExtractBasePhonemeId(token);
			if (baseId && getPhonemeCategory(baseId) === "vowel") nuclei.push(baseId);
		}

		const topicSoundPositions: TopicSoundPosition[] = [];
		nuclei.forEach((nucleus, index) => {
			if (!topicSounds.has(nucleus)) return;
			if (index === 0) topicSoundPositions.push("initial");
			else if (index === nuclei.length - 1) topicSoundPositions.push("final");
			else topicSoundPositions.push("medial");
		});

		pool.push({
			word,
			variants,
			rank,
			frequencyTier: frequencyTierForRank(rank),
			syllableCount: nuclei.length,
			topicSoundCount: topicSoundPositions.length,
			topicSoundPositions,
		});
	}

	return pool;
}

/** Loads tier-2 data through the phoneme-lookup façade and derives the pool. */
export async function loadWordPoolForTopic(topic: TopicDefinition): Promise<PoolWord[]> {
	return deriveWordPool(await loadTier2(), topic);
}
