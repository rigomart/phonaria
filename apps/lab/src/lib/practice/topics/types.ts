import type { PhonemeSymbolId } from "@phonaria/phonetics-data";

/**
 * Inclusive syllable-count band for one session slot.
 * `max: null` means unbounded (e.g. "4+ syllables").
 */
export interface SyllableBand {
	min: number;
	max: number | null;
}

/**
 * Everything the Practice engine needs to run one topic. The topic registry
 * (`topics/index.ts`) is the only wiring point: adding a topic means one
 * folder exporting a TopicDefinition plus one registry entry.
 */
export interface TopicDefinition {
	/** Registry key, also the route slug under /practice/[topic]. */
	id: string;
	/** Sounds the topic teaches; word-pool facets are computed against these. */
	topicSounds: readonly PhonemeSymbolId[];
	/**
	 * Topic-specific eligibility over a word's CMU variants. Composed with the
	 * engine-owned word-suitability filter — it never re-implements it.
	 */
	isEligibleWord: (variants: readonly string[]) => boolean;
	/** Ordered per-slot syllable bands for a session. */
	slotSpec: readonly SyllableBand[];
	/**
	 * The only prose a topic owns: activity copy lives in `PracticeActivity`,
	 * and the sound detail a card shows is derived from `topicSounds`.
	 */
	display: {
		name: string;
		/** One line on what this topic teaches, in a learner's words. */
		blurb: string;
		/** Reveal stat-tile label after "N of M", e.g. "schwas matched". */
		topicStatLabel: string;
	};
}
