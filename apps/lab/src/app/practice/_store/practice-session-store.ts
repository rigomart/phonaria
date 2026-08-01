/**
 * The in-memory practice session loop: build → pre-submit check → submit →
 * review. Everything lives in this store for the lifetime of the page —
 * reload or Back abandons the session, by design (#140, #144).
 *
 * Dependencies (pool loader, rng) are injected as optional trailing arguments
 * so the whole loop is testable without mocks, mirroring the engine's
 * `generateSession(pool, slots, rng)` seam.
 */
import { create } from "zustand";
import { scoreWord, type WordScore } from "@/lib/practice/scoring";
import { generateSession, type SessionRng } from "@/lib/practice/session-generator";
import type { TopicDefinition } from "@/lib/practice/topics/types";
import { loadWordPoolForTopic, type PoolWord } from "@/lib/practice/word-pool";

/** Where the learner is in the session loop. */
export type PracticePhase = "idle" | "building" | "checking" | "review";

/** Loading state of the topic's word pool, which gates Start. */
export type PoolStatus = "idle" | "loading" | "ready" | "error";

export interface PracticeRound {
	word: PoolWord;
	/** The learner's sound sequence in phoneme-ID space; empty means blank. */
	sequence: string[];
}

export type PoolLoader = (topic: TopicDefinition) => Promise<PoolWord[]>;

interface PracticeSessionStore {
	topicId: string | null;
	phase: PracticePhase;
	poolStatus: PoolStatus;
	pool: PoolWord[] | null;
	rounds: PracticeRound[];
	currentIndex: number;
	/** Set once on submit; null until the session is revealed. */
	scores: WordScore[] | null;

	prefetchPool: (topic: TopicDefinition, loadPool?: PoolLoader) => Promise<void>;
	startSession: (topic: TopicDefinition, rng?: SessionRng) => void;

	appendSound: (sound: string) => void;
	removeSoundAt: (index: number) => void;
	clearSequence: () => void;

	goToRound: (index: number) => void;
	nextRound: () => void;
	prevRound: () => void;

	openCheck: () => void;
	keepEditing: () => void;
	editRound: (index: number) => void;
	submit: () => void;

	/** Drops the session but keeps the loaded pool, so returning is instant. */
	abandon: () => void;
	/** Full teardown, including the pool. */
	reset: () => void;
}

const initialSessionState = {
	phase: "idle",
	rounds: [],
	currentIndex: 0,
	scores: null,
} satisfies Pick<PracticeSessionStore, "phase" | "rounds" | "currentIndex" | "scores">;

const initialState = {
	...initialSessionState,
	topicId: null,
	poolStatus: "idle",
	pool: null,
} satisfies Omit<
	PracticeSessionStore,
	| "prefetchPool"
	| "startSession"
	| "appendSound"
	| "removeSoundAt"
	| "clearSequence"
	| "goToRound"
	| "nextRound"
	| "prevRound"
	| "openCheck"
	| "keepEditing"
	| "editRound"
	| "submit"
	| "abandon"
	| "reset"
>;

/** Replaces the current round's sequence, if the session is editable. */
function withCurrentSequence(
	state: PracticeSessionStore,
	next: (sequence: string[]) => string[],
): Partial<PracticeSessionStore> | null {
	if (state.phase !== "building") return null;
	const round = state.rounds[state.currentIndex];
	if (!round) return null;

	const rounds = state.rounds.slice();
	rounds[state.currentIndex] = { ...round, sequence: next(round.sequence) };
	return { rounds };
}

export const usePracticeSessionStore = create<PracticeSessionStore>((set, get) => ({
	...initialState,

	prefetchPool: async (topic, loadPool = loadWordPoolForTopic) => {
		const { topicId, poolStatus } = get();
		const isCurrentTopic = topicId === topic.id;
		// Already loaded or in flight for this topic — nothing to do. An error
		// status deliberately falls through, so Retry is just another prefetch.
		if (isCurrentTopic && (poolStatus === "loading" || poolStatus === "ready")) return;

		set({ topicId: topic.id, poolStatus: "loading", pool: null });

		try {
			const pool = await loadPool(topic);
			// A newer topic took over while this was in flight — drop the result.
			if (get().topicId !== topic.id) return;
			set({ pool, poolStatus: "ready" });
		} catch {
			if (get().topicId !== topic.id) return;
			set({ pool: null, poolStatus: "error" });
		}
	},

	startSession: (topic, rng = Math.random) => {
		const { pool, poolStatus } = get();
		// Start is the sole loading gate: no pool, no session.
		if (poolStatus !== "ready" || !pool) return;

		const words = generateSession(pool, topic.slotSpec, rng);
		set({
			...initialSessionState,
			phase: "building",
			rounds: words.map((word) => ({ word, sequence: [] })),
		});
	},

	appendSound: (sound) => {
		const patch = withCurrentSequence(get(), (sequence) => [...sequence, sound]);
		if (patch) set(patch);
	},

	removeSoundAt: (index) => {
		const patch = withCurrentSequence(get(), (sequence) =>
			index >= 0 && index < sequence.length
				? sequence.filter((_, position) => position !== index)
				: sequence,
		);
		if (patch) set(patch);
	},

	clearSequence: () => {
		const patch = withCurrentSequence(get(), () => []);
		if (patch) set(patch);
	},

	goToRound: (index) => {
		const { phase, rounds } = get();
		if (phase !== "building") return;
		if (index < 0 || index >= rounds.length) return;
		set({ currentIndex: index });
	},

	nextRound: () => {
		const { phase, rounds, currentIndex } = get();
		if (phase !== "building") return;
		set({ currentIndex: Math.min(currentIndex + 1, rounds.length - 1) });
	},

	prevRound: () => {
		const { phase, currentIndex } = get();
		if (phase !== "building") return;
		set({ currentIndex: Math.max(currentIndex - 1, 0) });
	},

	openCheck: () => {
		if (get().phase !== "building") return;
		set({ phase: "checking" });
	},

	keepEditing: () => {
		if (get().phase !== "checking") return;
		set({ phase: "building" });
	},

	editRound: (index) => {
		const { phase, rounds } = get();
		if (phase !== "checking") return;
		if (index < 0 || index >= rounds.length) return;
		set({ phase: "building", currentIndex: index });
	},

	submit: () => {
		const { phase, rounds } = get();
		// Submit is irreversible: it is reachable only from the pre-submit check,
		// and review has no way back into building.
		if (phase !== "checking") return;

		const scores = rounds.map((round) => scoreWord(round.sequence, [...round.word.variants]));
		set({ phase: "review", scores });
	},

	abandon: () => set({ ...initialSessionState }),

	reset: () => set({ ...initialState }),
}));

/** Rounds the learner left empty — surfaced by the pre-submit check. */
export function selectBlankCount(rounds: readonly PracticeRound[]): number {
	return rounds.filter((round) => round.sequence.length === 0).length;
}

/** The primary score: whole words matched exactly against an accepted variant. */
export function selectWordsCorrect(scores: readonly Pick<WordScore, "correct">[]): number {
	return scores.filter((score) => score.correct).length;
}

type SoundAccuracyInput = Pick<WordScore, "matched" | "learnerLength" | "referenceLength">;

/**
 * Secondary score, pooled across the whole session rather than averaged per
 * word — so a long word carries more weight than a short one, and skipping
 * never beats attempting. Null when there is nothing to score.
 */
export function selectSoundAccuracy(scores: readonly SoundAccuracyInput[]): number | null {
	const denominator = scores.reduce(
		(total, score) => total + Math.max(score.learnerLength, score.referenceLength),
		0,
	);
	if (denominator === 0) return null;

	const matched = scores.reduce((total, score) => total + score.matched, 0);
	return matched / denominator;
}

/**
 * The topic figure ("4 of 7 schwas placed"). The scorer stays topic-blind and
 * reports every sound; the topic decides which ones it teaches.
 */
export function selectTopicSoundTally(
	scores: readonly Pick<WordScore, "tallies">[],
	topicSounds: readonly string[],
): { matched: number; total: number } {
	return scores.reduce(
		(running, score) => {
			for (const sound of topicSounds) {
				const tally = score.tallies[sound];
				if (!tally) continue;
				running.matched += tally.matched;
				running.total += tally.total;
			}
			return running;
		},
		{ matched: 0, total: 0 },
	);
}
