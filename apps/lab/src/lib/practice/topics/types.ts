import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import type { AlignmentOp } from "../scoring";

/**
 * Inclusive syllable-count band for one session slot.
 * `max: null` means unbounded (e.g. "4+ syllables").
 */
export interface SyllableBand {
	min: number;
	max: number | null;
}

/** One scored word, reduced to what lesson selection needs. */
export interface LessonWordResult {
	word: string;
	/** The learner left the word blank; excluded from op-keyed patterns. */
	blank: boolean;
	/** Alignment against the reference the word was judged on, in word order. */
	ops: readonly AlignmentOp[];
}

/** One triggered teaching note, ready to render in the reveal's disclosure. */
export interface LessonNote {
	id: string;
	title: string;
	body: string;
	/** Session words that triggered the pattern, in session order. */
	words: readonly string[];
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
		/** Reveal stat-tile label after "N of M", e.g. "schwas placed". */
		topicStatLabel: string;
		/** Reveal disclosure heading, e.g. "About those schwas". */
		lessonsHeading: string;
	};
	/**
	 * Mistake-keyed lesson selection over the session's scored words: fixed
	 * catalog order, all triggered notes, each op keyed to exactly one pattern,
	 * blank words excluded from the op-keyed patterns.
	 */
	selectLessons: (results: readonly LessonWordResult[]) => LessonNote[];
}
