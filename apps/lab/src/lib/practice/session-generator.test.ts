import { describe, expect, it } from "vitest";
import { generateSession } from "./session-generator";
import type { SyllableBand } from "./topics/types";
import type { PoolWord, TopicSoundPosition } from "./word-pool";

function makeWord(
	word: string,
	syllableCount: number,
	topicSoundPositions: TopicSoundPosition[] = ["initial"],
): PoolWord {
	return {
		word,
		variants: ["AX0 B AU1 T"],
		rank: 0,
		frequencyTier: "top-1k",
		syllableCount,
		topicSoundCount: topicSoundPositions.length,
		topicSoundPositions,
	};
}

/** Deterministic LCG so tests can assert exact reproducibility. */
function seededRng(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 2 ** 32;
	};
}

/** Returns queued values in order, then a constant 0.5 when exhausted. */
function queuedRng(values: number[]): () => number {
	let i = 0;
	return () => (i < values.length ? values[i++] : 0.5);
}

const FIVE_SLOTS: SyllableBand[] = [
	{ min: 2, max: 2 },
	{ min: 2, max: 3 },
	{ min: 3, max: 3 },
	{ min: 3, max: 4 },
	{ min: 4, max: null },
];

function makeBroadPool(): PoolWord[] {
	const pool: PoolWord[] = [];
	const positions: TopicSoundPosition[][] = [["initial"], ["medial"], ["final"]];
	for (let syllables = 2; syllables <= 5; syllables++) {
		for (let i = 0; i < 15; i++) {
			pool.push(makeWord(`w${syllables}s${i}`, syllables, positions[i % positions.length]));
		}
	}
	return pool;
}

describe("generateSession", () => {
	it("is deterministic under an injected RNG", () => {
		const pool = makeBroadPool();
		const first = generateSession(pool, FIVE_SLOTS, seededRng(42));
		const second = generateSession(pool, FIVE_SLOTS, seededRng(42));
		expect(first.map((w) => w.word)).toEqual(second.map((w) => w.word));
	});

	it("fills each slot from its syllable band and never repeats a word", () => {
		const pool = makeBroadPool();
		for (let seed = 0; seed < 100; seed++) {
			const session = generateSession(pool, FIVE_SLOTS, seededRng(seed));
			expect(session).toHaveLength(5);
			expect(new Set(session.map((w) => w.word)).size).toBe(5);
			session.forEach((word, slot) => {
				const band = FIVE_SLOTS[slot];
				expect(word.syllableCount).toBeGreaterThanOrEqual(band.min);
				if (band.max !== null) {
					expect(word.syllableCount).toBeLessThanOrEqual(band.max);
				}
			});
		}
	});

	it("dedupes across overlapping bands even when a band has a single fresh word", () => {
		// Slot 2's band overlaps slot 1's; only two 2-syllable words exist, so
		// slot 2 must take whichever word slot 1 left behind.
		const pool = [makeWord("alpha", 2), makeWord("beta", 2)];
		const slots: SyllableBand[] = [
			{ min: 2, max: 2 },
			{ min: 2, max: 2 },
		];
		for (let seed = 0; seed < 20; seed++) {
			const session = generateSession(pool, slots, seededRng(seed));
			expect(new Set(session.map((w) => w.word)).size).toBe(2);
		}
	});

	it("prefers topic-sound variety unseen in the session", () => {
		const pool = [
			makeWord("aaa-initial", 2, ["initial"]),
			makeWord("bbb-final", 2, ["final"]),
			makeWord("ccc-initial", 2, ["initial"]),
		];
		const slots: SyllableBand[] = [
			{ min: 2, max: 2 },
			{ min: 2, max: 2 },
		];
		// Slot 1: draw index 0 → aaa-initial (fresh variety, accepted).
		// Slot 2: draw index 1 → ccc-initial (variety already seen) → redraw
		// index 0 → bbb-final (fresh variety, accepted).
		const session = generateSession(pool, slots, queuedRng([0, 0.99, 0]));
		expect(session.map((w) => w.word)).toEqual(["aaa-initial", "bbb-final"]);
	});

	it("treats variety as a tie-breaker, never a quota", () => {
		// Every candidate shares the same variety facets; the slot must still
		// fill rather than starve hunting for variety.
		const pool = [
			makeWord("aaa", 2, ["initial"]),
			makeWord("bbb", 2, ["initial"]),
			makeWord("ccc", 2, ["initial"]),
		];
		const slots: SyllableBand[] = [
			{ min: 2, max: 2 },
			{ min: 2, max: 2 },
		];
		const session = generateSession(pool, slots, seededRng(7));
		expect(session).toHaveLength(2);
		expect(new Set(session.map((w) => w.word)).size).toBe(2);
	});

	it("throws when a slot's band has no candidates", () => {
		const pool = [makeWord("alpha", 2)];
		expect(() => generateSession(pool, [{ min: 4, max: null }], seededRng(1))).toThrow(
			/no eligible words/i,
		);
	});
});
