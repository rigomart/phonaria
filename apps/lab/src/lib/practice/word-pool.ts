/**
 * Practice word pool: derived at runtime from the tier-2 phoneme-lookup
 * façade, never curated. The engine owns the shared word-suitability filter;
 * topics contribute only their own eligibility predicate (#140).
 */
import {
	getPhonemeCategory,
	type PhonemeSymbolId,
	tryExtractBasePhonemeId,
} from "@phonaria/phonetics-data";
import type { CuratedWordData } from "@phonaria/phonetics-data/data/en/curated-1k";
import { loadTier2 } from "../phoneme-lookup/shared";
import type { TopicDefinition } from "./topics/types";

/**
 * Editorial blocklist for words that read badly in play (abbreviations,
 * initialisms, loanword fragments). Grows as bad words are spotted.
 */
export const EditorialBlocklist: ReadonlySet<string> = new Set([
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
 * Derives the topic's word pool from tier-2 data: shared suitability filter,
 * then the topic's own predicate, then runtime facets against its topic
 * sounds. Pure and synchronous; callers load the data via the tier-2 façade.
 *
 * Facets come from the first CMU variant (consistent with the reveal's
 * "CMU's first listing"), and topic-sound occurrences are counted among
 * vowel nuclei only — a topic teaching a consonant sound will need this
 * extended before its facets mean anything.
 */
export function deriveWordPool(data: CuratedWordData, topic: TopicDefinition): PoolWord[] {
	const topicSounds = new Set<PhonemeSymbolId>(topic.topicSounds);
	const pool: PoolWord[] = [];

	let rank = -1;
	for (const [word, variants] of Object.entries(data.words)) {
		rank += 1;
		if (!isSuitableWord(word) || !topic.isEligibleWord(variants)) continue;

		// Vowel nuclei of the first variant: one per syllable, in order.
		const nuclei: PhonemeSymbolId[] = [];
		for (const token of variants[0].split(" ")) {
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
