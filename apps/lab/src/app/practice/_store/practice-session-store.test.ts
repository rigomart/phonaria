import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeVariant, type WordScore } from "@/lib/practice/scoring";
import type { TopicDefinition } from "@/lib/practice/topics/types";
import type { PoolWord } from "@/lib/practice/word-pool";
import {
	type PracticeRound,
	selectBlankCount,
	selectReviewRows,
	selectSoundAccuracy,
	selectTopicSoundTally,
	selectWordsCorrect,
	usePracticeSessionStore,
} from "./practice-session-store";

/** Deterministic LCG so tests can assert exact reproducibility. */
function seededRng(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 2 ** 32;
	};
}

function makeWord(
	word: string,
	variants: string[],
	syllableCount: number,
	topicSoundPositions: PoolWord["topicSoundPositions"],
): PoolWord {
	return {
		word,
		variants,
		rank: 0,
		frequencyTier: "top-1k",
		syllableCount,
		topicSoundCount: topicSoundPositions.length,
		topicSoundPositions,
	};
}

/**
 * Enough depth for every schwa slot band (2, 2–3, 3, 3–4, 4+ syllables) to
 * still have candidates after the earlier slots have drawn. Variants use
 * Phonaria phoneme IDs with stress digits, as stored.
 */
const testPool: PoolWord[] = [
	makeWord("sofa", ["S OU1 F AX0"], 2, ["final"]),
	makeWord("above", ["AX0 B AH1 V"], 2, ["initial"]),
	makeWord("banana", ["B AX0 N AE1 N AX0"], 3, ["initial", "final"]),
	makeWord("celebrate", ["S E1 L AX0 B R EI2 T"], 3, ["medial"]),
	makeWord("computer", ["K AX0 M P Y U1 T ER0"], 3, ["initial"]),
	makeWord("america", ["AX0 M E1 R IX0 K AX0"], 4, ["initial", "final"]),
	makeWord("comfortable", ["K AH1 M F ER0 T AX0 B AX0 L"], 4, ["medial", "final"]),
	makeWord("aluminium", ["AE2 L Y AX0 M IX1 N I0 AX0 M"], 5, ["medial", "final"]),
];

const testTopic: TopicDefinition = {
	id: "test-topic",
	topicSounds: ["AX"],
	isEligibleWord: () => true,
	slotSpec: [
		{ min: 2, max: 2 },
		{ min: 2, max: 3 },
		{ min: 3, max: 3 },
		{ min: 3, max: 4 },
		{ min: 4, max: null },
	],
	display: {
		kicker: "Practice",
		heading: "Test",
		description: "Test topic.",
		startLabel: "Start session",
		topicStatLabel: "sounds placed",
		lessonsHeading: "About those sounds",
	},
	selectLessons: () => [],
};

const loadOk = async () => testPool;
const loadFails = async (): Promise<PoolWord[]> => {
	throw new Error("chunk load failed");
};

/** Puts the store in a ready-to-play session with a deterministic draw. */
async function startTestSession(): Promise<void> {
	await usePracticeSessionStore.getState().prefetchPool(testTopic, loadOk);
	usePracticeSessionStore.getState().startSession(testTopic, seededRng(7));
}

afterEach(() => {
	usePracticeSessionStore.getState().reset();
});

describe("practice session store — pool loading", () => {
	it("starts idle with no pool and no session", () => {
		const state = usePracticeSessionStore.getState();
		expect(state.phase).toBe("idle");
		expect(state.poolStatus).toBe("idle");
		expect(state.pool).toBeNull();
		expect(state.rounds).toEqual([]);
		expect(state.scores).toBeNull();
	});

	it("prefetches the pool and reports it ready", async () => {
		await usePracticeSessionStore.getState().prefetchPool(testTopic, loadOk);
		const state = usePracticeSessionStore.getState();
		expect(state.poolStatus).toBe("ready");
		expect(state.pool).toEqual(testPool);
		expect(state.topicId).toBe("test-topic");
	});

	it("reports error status when the pool import fails", async () => {
		await usePracticeSessionStore.getState().prefetchPool(testTopic, loadFails);
		const state = usePracticeSessionStore.getState();
		expect(state.poolStatus).toBe("error");
		expect(state.pool).toBeNull();
	});

	it("recovers when a retry succeeds after a failed import", async () => {
		await usePracticeSessionStore.getState().prefetchPool(testTopic, loadFails);
		expect(usePracticeSessionStore.getState().poolStatus).toBe("error");

		await usePracticeSessionStore.getState().prefetchPool(testTopic, loadOk);
		expect(usePracticeSessionStore.getState().poolStatus).toBe("ready");
		expect(usePracticeSessionStore.getState().pool).toEqual(testPool);
	});

	it("does not reload a pool that is already ready", async () => {
		let calls = 0;
		const counted = async () => {
			calls += 1;
			return testPool;
		};

		await usePracticeSessionStore.getState().prefetchPool(testTopic, counted);
		await usePracticeSessionStore.getState().prefetchPool(testTopic, counted);
		expect(calls).toBe(1);
	});

	it("shares one in-flight load between concurrent prefetches", async () => {
		let calls = 0;
		const counted = async () => {
			calls += 1;
			return testPool;
		};

		const store = usePracticeSessionStore.getState();
		await Promise.all([
			store.prefetchPool(testTopic, counted),
			store.prefetchPool(testTopic, counted),
		]);
		expect(calls).toBe(1);
		expect(usePracticeSessionStore.getState().poolStatus).toBe("ready");
	});

	it("drops a stale pool load that resolves after the topic changed", async () => {
		let release: (words: PoolWord[]) => void = () => {};
		const slowLoad = () =>
			new Promise<PoolWord[]>((resolve) => {
				release = resolve;
			});

		const pending = usePracticeSessionStore.getState().prefetchPool(testTopic, slowLoad);
		await usePracticeSessionStore
			.getState()
			.prefetchPool({ ...testTopic, id: "other-topic" }, loadOk);
		release(testPool);
		await pending;

		const state = usePracticeSessionStore.getState();
		expect(state.topicId).toBe("other-topic");
		expect(state.poolStatus).toBe("ready");
	});

	/**
	 * The stale guard keys on the load, not the topic: on A → B → A the first
	 * load is stale even though `topicId` is back to A, so its late failure must
	 * not clobber the pool the second load already delivered.
	 */
	it("drops a stale rejection that lands after the same topic reloaded", async () => {
		let rejectFirst: (error: Error) => void = () => {};
		const hangsThenFails = () =>
			new Promise<PoolWord[]>((_, reject) => {
				rejectFirst = reject;
			});

		const store = usePracticeSessionStore.getState();
		const pending = store.prefetchPool(testTopic, hangsThenFails);
		await store.prefetchPool({ ...testTopic, id: "other-topic" }, loadOk);
		await store.prefetchPool(testTopic, loadOk);
		expect(usePracticeSessionStore.getState().poolStatus).toBe("ready");

		rejectFirst(new Error("late chunk failure"));
		await pending;

		const state = usePracticeSessionStore.getState();
		expect(state.poolStatus).toBe("ready");
		expect(state.pool).toEqual(testPool);
	});
});

describe("practice session store — starting a session", () => {
	it("does not start while the pool is still unloaded", () => {
		usePracticeSessionStore.getState().startSession(testTopic, seededRng(1));
		expect(usePracticeSessionStore.getState().phase).toBe("idle");
		expect(usePracticeSessionStore.getState().rounds).toEqual([]);
	});

	it("builds one blank round per slot on start", async () => {
		await startTestSession();
		const state = usePracticeSessionStore.getState();
		expect(state.phase).toBe("building");
		expect(state.rounds).toHaveLength(testTopic.slotSpec.length);
		expect(state.rounds.every((round) => round.sequence.length === 0)).toBe(true);
		expect(state.currentIndex).toBe(0);
	});

	it("never repeats a word within a session", async () => {
		await startTestSession();
		const words = usePracticeSessionStore.getState().rounds.map((round) => round.word.word);
		expect(new Set(words).size).toBe(words.length);
	});

	it("is deterministic for a given rng seed", async () => {
		await startTestSession();
		const first = usePracticeSessionStore.getState().rounds.map((round) => round.word.word);

		usePracticeSessionStore.getState().reset();
		await startTestSession();
		const second = usePracticeSessionStore.getState().rounds.map((round) => round.word.word);

		expect(second).toEqual(first);
	});

	it("surfaces a draw failure instead of throwing into the click handler", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		await usePracticeSessionStore.getState().prefetchPool(testTopic, loadOk);
		// No pool word has 9 syllables, so the band runs dry and the generator throws.
		usePracticeSessionStore
			.getState()
			.startSession({ ...testTopic, slotSpec: [{ min: 9, max: 9 }] }, seededRng(5));

		const state = usePracticeSessionStore.getState();
		expect(state.phase).toBe("idle");
		expect(state.rounds).toEqual([]);
		expect(state.sessionError).not.toBeNull();
		expect(consoleError).toHaveBeenCalled();
		consoleError.mockRestore();
	});

	it("clears a previous draw failure once a session starts", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		await usePracticeSessionStore.getState().prefetchPool(testTopic, loadOk);
		usePracticeSessionStore
			.getState()
			.startSession({ ...testTopic, slotSpec: [{ min: 9, max: 9 }] }, seededRng(5));
		expect(usePracticeSessionStore.getState().sessionError).not.toBeNull();

		usePracticeSessionStore.getState().startSession(testTopic, seededRng(7));

		const state = usePracticeSessionStore.getState();
		expect(state.phase).toBe("building");
		expect(state.sessionError).toBeNull();
		consoleError.mockRestore();
	});
});

describe("practice session store — building rounds", () => {
	it("appends sounds to the current round only", async () => {
		await startTestSession();
		const store = usePracticeSessionStore.getState();
		store.appendSound("S");
		store.appendSound("OU");

		const state = usePracticeSessionStore.getState();
		expect(state.rounds[0].sequence).toEqual(["S", "OU"]);
		expect(state.rounds[1].sequence).toEqual([]);
	});

	it("removes a sound by index", async () => {
		await startTestSession();
		const store = usePracticeSessionStore.getState();
		store.appendSound("S");
		store.appendSound("OU");
		store.appendSound("F");
		store.removeSoundAt(1);

		expect(usePracticeSessionStore.getState().rounds[0].sequence).toEqual(["S", "F"]);
	});

	it("ignores a remove at an out-of-range index", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().appendSound("S");
		usePracticeSessionStore.getState().removeSoundAt(5);
		expect(usePracticeSessionStore.getState().rounds[0].sequence).toEqual(["S"]);
	});

	it("publishes nothing for a no-op edit, so subscribers keep their rounds", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().appendSound("S");
		const withSound = usePracticeSessionStore.getState().rounds;

		// Out of range: nothing changes, so nothing is published.
		usePracticeSessionStore.getState().removeSoundAt(5);
		expect(usePracticeSessionStore.getState().rounds).toBe(withSound);

		// A real clear does publish.
		usePracticeSessionStore.getState().clearSequence();
		const cleared = usePracticeSessionStore.getState().rounds;
		expect(cleared).not.toBe(withSound);

		// Clearing an already-empty sequence does not.
		usePracticeSessionStore.getState().clearSequence();
		expect(usePracticeSessionStore.getState().rounds).toBe(cleared);
	});

	it("clears the current sequence", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().appendSound("S");
		usePracticeSessionStore.getState().clearSequence();
		expect(usePracticeSessionStore.getState().rounds[0].sequence).toEqual([]);
	});

	it("keeps each round's answer when navigating away and back", async () => {
		await startTestSession();
		const store = usePracticeSessionStore.getState();
		store.appendSound("S");
		store.nextRound();
		store.appendSound("AX");
		store.prevRound();

		const state = usePracticeSessionStore.getState();
		expect(state.currentIndex).toBe(0);
		expect(state.rounds[0].sequence).toEqual(["S"]);
		expect(state.rounds[1].sequence).toEqual(["AX"]);
	});

	it("jumps to a round by index", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().goToRound(3);
		expect(usePracticeSessionStore.getState().currentIndex).toBe(3);
	});

	it("ignores jumps outside the session", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().goToRound(99);
		usePracticeSessionStore.getState().goToRound(-1);
		expect(usePracticeSessionStore.getState().currentIndex).toBe(0);
	});

	it("clamps navigation at both ends", async () => {
		await startTestSession();
		const store = usePracticeSessionStore.getState();
		store.prevRound();
		expect(usePracticeSessionStore.getState().currentIndex).toBe(0);

		for (let i = 0; i < 10; i++) store.nextRound();
		expect(usePracticeSessionStore.getState().currentIndex).toBe(testTopic.slotSpec.length - 1);
	});
});

describe("practice session store — pre-submit check", () => {
	it("opens the check from building", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().openCheck();
		expect(usePracticeSessionStore.getState().phase).toBe("checking");
	});

	it("returns to building on keep editing", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().keepEditing();
		expect(usePracticeSessionStore.getState().phase).toBe("building");
	});

	it("jumps from the check straight to a round for editing", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().editRound(2);

		const state = usePracticeSessionStore.getState();
		expect(state.phase).toBe("building");
		expect(state.currentIndex).toBe(2);
	});

	it("rejects sound edits while the check is open", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().appendSound("S");
		expect(usePracticeSessionStore.getState().rounds[0].sequence).toEqual([]);
	});
});

describe("practice session store — submit and review", () => {
	it("does not submit directly from building", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().submit();
		expect(usePracticeSessionStore.getState().phase).toBe("building");
		expect(usePracticeSessionStore.getState().scores).toBeNull();
	});

	it("scores every round on submit", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().submit();

		const state = usePracticeSessionStore.getState();
		expect(state.phase).toBe("review");
		expect(state.scores).toHaveLength(testTopic.slotSpec.length);
	});

	it("allows blanks and scores them zero without special-casing", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().submit();

		const scores = usePracticeSessionStore.getState().scores ?? [];
		expect(scores.every((score) => score.correct === false)).toBe(true);
		expect(scores.every((score) => score.matched === 0)).toBe(true);
		expect(scores.every((score) => score.referenceLength > 0)).toBe(true);
	});

	it("marks a strictly-correct answer correct", async () => {
		await usePracticeSessionStore.getState().prefetchPool(testTopic, async () => [testPool[0]]);
		usePracticeSessionStore
			.getState()
			.startSession({ ...testTopic, slotSpec: [{ min: 2, max: 2 }] }, seededRng(3));

		const store = usePracticeSessionStore.getState();
		for (const sound of ["S", "OU", "F", "AX"]) store.appendSound(sound);
		store.openCheck();
		store.submit();

		const scores = usePracticeSessionStore.getState().scores ?? [];
		expect(scores[0].correct).toBe(true);
	});

	it("keeps the answers in the check when scoring fails", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		// "QQ"/"ZZ" are not phoneme IDs, so `scoreWord` throws normalizing them.
		const unscorable = makeWord("gibberish", ["QQ1 ZZ0"], 2, ["final"]);
		await usePracticeSessionStore.getState().prefetchPool(testTopic, async () => [unscorable]);
		usePracticeSessionStore
			.getState()
			.startSession({ ...testTopic, slotSpec: [{ min: 2, max: 2 }] }, seededRng(3));

		usePracticeSessionStore.getState().appendSound("S");
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().submit();

		const state = usePracticeSessionStore.getState();
		expect(state.phase).toBe("checking");
		expect(state.scores).toBeNull();
		expect(state.sessionError).not.toBeNull();
		expect(state.rounds[0].sequence).toEqual(["S"]);
		expect(consoleError).toHaveBeenCalled();
		consoleError.mockRestore();
	});

	it("clears a scoring failure when the learner goes back to editing", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		const unscorable = makeWord("gibberish", ["QQ1 ZZ0"], 2, ["final"]);
		await usePracticeSessionStore.getState().prefetchPool(testTopic, async () => [unscorable]);
		usePracticeSessionStore
			.getState()
			.startSession({ ...testTopic, slotSpec: [{ min: 2, max: 2 }] }, seededRng(3));
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().submit();

		usePracticeSessionStore.getState().keepEditing();
		expect(usePracticeSessionStore.getState().sessionError).toBeNull();
		consoleError.mockRestore();
	});

	it("makes submit irreversible — a second submit is a no-op", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().submit();
		const firstScores = usePracticeSessionStore.getState().scores;

		usePracticeSessionStore.getState().submit();
		expect(usePracticeSessionStore.getState().scores).toBe(firstScores);
		expect(usePracticeSessionStore.getState().phase).toBe("review");
	});

	it("freezes answers after submit", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().submit();

		const store = usePracticeSessionStore.getState();
		store.appendSound("S");
		store.removeSoundAt(0);
		store.clearSequence();
		store.goToRound(2);
		store.keepEditing();
		store.editRound(1);

		const state = usePracticeSessionStore.getState();
		expect(state.phase).toBe("review");
		expect(state.rounds[0].sequence).toEqual([]);
		expect(state.currentIndex).toBe(0);
	});
});

describe("practice session store — abandoning", () => {
	it("abandons the session back to the start screen", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().appendSound("S");
		usePracticeSessionStore.getState().abandon();

		const state = usePracticeSessionStore.getState();
		expect(state.phase).toBe("idle");
		expect(state.rounds).toEqual([]);
		expect(state.scores).toBeNull();
		expect(state.currentIndex).toBe(0);
	});

	it("keeps the loaded pool when abandoning, so returning does not refetch", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().abandon();

		const state = usePracticeSessionStore.getState();
		expect(state.poolStatus).toBe("ready");
		expect(state.pool).toEqual(testPool);
	});

	it("abandons from review too", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().submit();
		usePracticeSessionStore.getState().abandon();

		expect(usePracticeSessionStore.getState().phase).toBe("idle");
		expect(usePracticeSessionStore.getState().scores).toBeNull();
	});

	it("starts a fresh session after abandoning", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().appendSound("S");
		usePracticeSessionStore.getState().abandon();
		usePracticeSessionStore.getState().startSession(testTopic, seededRng(11));

		const state = usePracticeSessionStore.getState();
		expect(state.phase).toBe("building");
		expect(state.rounds.every((round) => round.sequence.length === 0)).toBe(true);
	});
});

describe("practice review selectors", () => {
	it("counts blank rounds", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().appendSound("S");
		const rounds = usePracticeSessionStore.getState().rounds;
		expect(selectBlankCount(rounds)).toBe(4);
	});

	it("counts words correct as the primary score", async () => {
		await startTestSession();
		// Answer only the first round correctly; the rest stay blank. Reading the
		// answer off the drawn word keeps this independent of the seed.
		const round = usePracticeSessionStore.getState().rounds[0];
		for (const sound of normalizeVariant(round.word.variants[0])) {
			usePracticeSessionStore.getState().appendSound(sound);
		}
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().submit();

		const scores = usePracticeSessionStore.getState().scores ?? [];
		expect(scores[0].correct).toBe(true);
		expect(selectWordsCorrect(scores)).toBe(1);
	});

	it("pairs each round with its score for review", async () => {
		await startTestSession();
		usePracticeSessionStore.getState().openCheck();
		usePracticeSessionStore.getState().submit();

		const { rounds, scores } = usePracticeSessionStore.getState();
		const rows = selectReviewRows(rounds, scores);
		expect(rows).toHaveLength(rounds.length);
		expect(rows.map((row) => row.round.word.word)).toEqual(rounds.map((r) => r.word.word));
		expect(rows[0].score).toBe(scores?.[0]);
	});

	it("returns no review rows before a submit", () => {
		expect(selectReviewRows([], null)).toEqual([]);
	});

	it("drops rounds with no matching score rather than indexing past the end", () => {
		const rounds = [
			{ word: testPool[0], sequence: [] },
			{ word: testPool[1], sequence: [] },
		] satisfies PracticeRound[];
		const scores = [{ correct: true } as WordScore];
		expect(selectReviewRows(rounds, scores)).toHaveLength(1);
	});

	it("pools sound accuracy across the session rather than averaging per word", () => {
		const scores = [
			{ matched: 3, learnerLength: 4, referenceLength: 4 },
			{ matched: 1, learnerLength: 2, referenceLength: 8 },
		];
		// Pooled: 4 matched over 12 reference sounds. A per-word average would
		// give (0.75 + 0.125) / 2 = 0.4375 instead.
		expect(selectSoundAccuracy(scores)).toBeCloseTo(4 / 12);
	});

	it("uses the longer of learner and reference length as each denominator", () => {
		const scores = [{ matched: 2, learnerLength: 6, referenceLength: 3 }];
		expect(selectSoundAccuracy(scores)).toBeCloseTo(2 / 6);
	});

	it("returns null sound accuracy when there is nothing to score", () => {
		expect(selectSoundAccuracy([])).toBeNull();
	});

	it("sums the topic sound tally across the session", () => {
		const scores: Pick<WordScore, "tallies">[] = [
			{ tallies: { AX: { matched: 2, total: 3 }, IX: { matched: 1, total: 1 } } },
			{ tallies: { AX: { matched: 2, total: 4 } } },
		];
		expect(selectTopicSoundTally(scores, ["AX"])).toEqual({ matched: 4, total: 7 });
	});

	it("ignores sounds outside the topic in the tally", () => {
		const scores: Pick<WordScore, "tallies">[] = [{ tallies: { IX: { matched: 1, total: 1 } } }];
		expect(selectTopicSoundTally(scores, ["AX"])).toEqual({ matched: 0, total: 0 });
	});
});
