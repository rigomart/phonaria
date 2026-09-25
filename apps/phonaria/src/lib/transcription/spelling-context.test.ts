import { describe, expect, it } from "vitest";
import {
	buildSpellingContextRequest,
	MAX_SPELLING_CONTEXT_CANDIDATES,
	MAX_SPELLING_CONTEXT_MISSES,
	spellingContextInputSchema,
	spellingContextPicksByToken,
} from "./spelling-context";

describe("buildSpellingContextRequest", () => {
	it("asks only about misses that have candidates", () => {
		expect(
			buildSpellingContextRequest("I wnat sanjeev", [
				{ tokenIndex: 1, candidates: ["want", "what"] },
				{ tokenIndex: 2, candidates: [] },
			]),
		).toEqual({
			text: "I wnat sanjeev",
			misses: [{ tokenIndex: 1, candidates: ["want", "what"] }],
		});
	});

	it("returns null when there is nothing to choose between", () => {
		expect(buildSpellingContextRequest("sanjeev", [{ tokenIndex: 0, candidates: [] }])).toBeNull();
		expect(buildSpellingContextRequest("hello", [])).toBeNull();
	});

	it("stays inside the server's limits so one oversized miss cannot void the request", () => {
		const oversized = Array.from(
			{ length: MAX_SPELLING_CONTEXT_CANDIDATES + 1 },
			(_, i) => `w${i}`,
		);
		const misses = [
			{ tokenIndex: 0, candidates: oversized },
			...Array.from({ length: MAX_SPELLING_CONTEXT_MISSES + 2 }, (_, i) => ({
				tokenIndex: i + 1,
				candidates: ["want"],
			})),
		];

		const request = buildSpellingContextRequest("x ".repeat(12), misses);

		expect(request?.misses).toHaveLength(MAX_SPELLING_CONTEXT_MISSES);
		expect(request?.misses[0]?.tokenIndex).toBe(1);
		expect(spellingContextInputSchema.safeParse(request).success).toBe(true);
	});
});

describe("spellingContextPicksByToken", () => {
	it("maps answered picks, keeping silence as null", () => {
		const picks = spellingContextPicksByToken({
			status: "answered",
			picks: [
				{ tokenIndex: 1, word: "want" },
				{ tokenIndex: 3, word: null },
			],
		});

		expect([...picks]).toEqual([
			[1, "want"],
			[3, null],
		]);
	});

	it("is empty when the service was unavailable or failed", () => {
		expect(spellingContextPicksByToken({ status: "unavailable" }).size).toBe(0);
		expect(spellingContextPicksByToken(null).size).toBe(0);
	});
});
