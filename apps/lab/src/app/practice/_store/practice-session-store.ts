/**
 * The in-memory practice session loop: build → pre-submit check → submit →
 * review. Reload or Back abandons the session, by design (#140).
 *
 * The pool loader and rng are optional trailing arguments so the loop is
 * testable without mocks, mirroring `generateSession(pool, slots, rng)`.
 */
import { create } from "zustand";
import { scoreWord, type WordScore } from "@/lib/practice/scoring";
import { generateSession, type SessionRng } from "@/lib/practice/session-generator";
import type { TopicDefinition } from "@/lib/practice/topics/types";
import { loadWordPoolForTopic, type PoolWord } from "@/lib/practice/word-pool";

export type PracticePhase = "idle" | "building" | "checking" | "review";

export type PoolStatus = "idle" | "loading" | "ready" | "error";

export interface PracticeRound {
	word: PoolWord;
	/** Phoneme IDs; empty means the learner left the word blank. */
	sequence: string[];
}

export type PoolLoader = (topic: TopicDefinition) => Promise<PoolWord[]>;

interface PracticeSessionState {
	topicId: string | null;
	phase: PracticePhase;
	poolStatus: PoolStatus;
	pool: PoolWord[] | null;
	rounds: PracticeRound[];
	currentIndex: number;
	scores: WordScore[] | null;
}

interface PracticeSessionActions {
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

	/** Drops the session but keeps the pool; `reset` also drops the pool. */
	abandon: () => void;
	reset: () => void;
}

type PracticeSessionStore = PracticeSessionState & PracticeSessionActions;

const initialSessionState = {
	phase: "idle",
	rounds: [],
	currentIndex: 0,
	scores: null,
} satisfies Partial<PracticeSessionState>;

const initialState = {
	...initialSessionState,
	topicId: null,
	poolStatus: "idle",
	pool: null,
} satisfies PracticeSessionState;

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
		// An error status falls through, so Retry is just another prefetch.
		if (isCurrentTopic && (poolStatus === "loading" || poolStatus === "ready")) return;

		set({ topicId: topic.id, poolStatus: "loading", pool: null });

		try {
			const pool = await loadPool(topic);
			// A newer topic took over mid-flight — drop the stale result.
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
		// Irreversible: reachable only from the check, and review has no way back.
		if (phase !== "checking") return;

		const scores = rounds.map((round) => scoreWord(round.sequence, [...round.word.variants]));
		set({ phase: "review", scores });
	},

	abandon: () => set({ ...initialSessionState }),

	reset: () => set({ ...initialState }),
}));

export function selectBlankCount(rounds: readonly PracticeRound[]): number {
	return rounds.filter((round) => round.sequence.length === 0).length;
}

export function selectWordsCorrect(scores: readonly Pick<WordScore, "correct">[]): number {
	return scores.filter((score) => score.correct).length;
}

type SoundAccuracyInput = Pick<WordScore, "matched" | "learnerLength" | "referenceLength">;

/**
 * Pooled across the session, never averaged per word — so skipping never
 * beats attempting. Null when there is nothing to score.
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

/** Filters the topic-blind scorer's per-sound counts down to what it teaches. */
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
