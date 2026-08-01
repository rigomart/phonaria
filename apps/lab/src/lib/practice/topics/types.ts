import type { PhonemeSymbolId } from "@phonaria/phonetics-data";

/**
 * Inclusive syllable-count band for one session slot.
 * `max: null` means unbounded (e.g. "4+ syllables").
 */
export interface SyllableBand {
	min: number;
	max: number | null;
}

/** Placeholder until the lesson catalog lands (#140, implementation step 9). */
export interface LessonPattern {
	id: string;
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
	display: {
		kicker: string;
		heading: string;
		description: string;
		startLabel: string;
	};
	lessonCatalog: readonly LessonPattern[];
}
