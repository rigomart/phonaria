import { describe, expect, it, vi } from "vitest";
import { tokenizeTextWithSpans } from "@/lib/g2p/text-processing";
import type { JevRequest } from "@/lib/jev/client";
import {
	buildExcerpt,
	chooseSpellingInContext,
	NONE_OPTION,
	planSpellingContext,
	readSpellingContextAnswers,
	SpellingContextValidationError,
} from "./spelling-context-service";

function choice(word: string, confidence: number) {
	return { type: "choice", choice: word, confidence, probabilities: { [word]: confidence } };
}

describe("planSpellingContext", () => {
	it("asks one question per miss, with every candidate and a none option", () => {
		const plan = planSpellingContext({
			text: "I wnat to learn English.",
			misses: [{ tokenIndex: 1, candidates: ["what", "want", "nat"] }],
		});

		expect(plan?.excerpt).toBe("I wnat to learn English.");
		expect(Object.keys(plan?.questions ?? {})).toEqual(["miss_1"]);
		const question = plan?.questions.miss_1;
		expect(question?.type).toBe("choice");
		expect(question?.instructions).toContain('"wnat"');
		expect(Object.keys(question?.criteria ?? {})).toEqual(["what", "want", "nat", NONE_OPTION]);
	});

	it("never lets a candidate collide with the none option", () => {
		const plan = planSpellingContext({
			text: "nome",
			misses: [{ tokenIndex: 0, candidates: ["none", "name"] }],
		});

		expect(Object.keys(plan?.questions.miss_0?.criteria ?? {})).toEqual([
			"none",
			"name",
			NONE_OPTION,
		]);
	});

	it("reads the token from the text and drops candidates more than one slip away", () => {
		const plan = planSpellingContext({
			text: "I wnat it",
			misses: [{ tokenIndex: 1, candidates: ["want", "WHAT", "anything goes", "wanted"] }],
		});

		expect(plan?.asked).toEqual([{ tokenIndex: 1, token: "wnat", candidates: ["want", "what"] }]);
	});

	it("skips misses whose index is not a token or whose candidates all fail", () => {
		const plan = planSpellingContext({
			text: "I wnat it",
			misses: [
				{ tokenIndex: 9, candidates: ["want"] },
				{ tokenIndex: 2, candidates: ["banana"] },
			],
		});

		expect(plan).toBeNull();
	});

	it("caps the excerpt at whole words around the miss", () => {
		const text = `${"alpha ".repeat(30)}I wnat to go ${"omega ".repeat(30)}`.trim();
		const plan = planSpellingContext(
			{ text, misses: [{ tokenIndex: 31, candidates: ["want"] }] },
			40,
		);

		const excerpt = plan?.excerpt ?? "";
		expect(excerpt.length).toBeLessThanOrEqual(40);
		expect(excerpt).toContain("I wnat to go");
		expect(excerpt.startsWith("alpha") || excerpt.startsWith("I")).toBe(true);
		expect(excerpt.endsWith("omega") || excerpt.endsWith("go")).toBe(true);
	});
});

describe("buildExcerpt", () => {
	const text = "one two three wnat five six seven eight nine tne eleven";
	const spans = tokenizeTextWithSpans(text);

	it("sends the whole text when it fits", () => {
		expect(buildExcerpt(text, spans, [3], 300)).toEqual({
			excerpt: text,
			coveredIndexes: [3],
		});
	});

	it("drops misses that cannot share a window with the first", () => {
		const window = buildExcerpt(text, spans, [3, 9], 20);

		expect(window?.coveredIndexes).toEqual([3]);
		expect(window?.excerpt).toContain("wnat");
		expect(window?.excerpt.length).toBeLessThanOrEqual(20);
	});

	it("keeps closing punctuation when it fits", () => {
		const question = "Did you recieve my email? Thanks a lot for everything";
		const window = buildExcerpt(question, tokenizeTextWithSpans(question), [2], 26);

		expect(window?.excerpt).toBe("Did you recieve my email?");
	});
});

describe("readSpellingContextAnswers", () => {
	const plan = planSpellingContext({
		text: "I wnat a bg cake",
		misses: [
			{ tokenIndex: 1, candidates: ["what", "want"] },
			{ tokenIndex: 3, candidates: ["big", "bag"] },
		],
	});
	if (!plan) throw new Error("plan expected");

	it("offers confident picks and stays silent on none or low confidence", () => {
		expect(
			readSpellingContextAnswers(plan, {
				miss_1: choice("want", 0.93),
				miss_3: choice("big", 0.5),
			}),
		).toEqual([
			{ tokenIndex: 1, word: "want" },
			{ tokenIndex: 3, word: null },
		]);
		expect(readSpellingContextAnswers(plan, { miss_1: choice(NONE_OPTION, 0.99) })).toEqual([
			{ tokenIndex: 1, word: null },
		]);
	});

	it("treats a choice outside the options as silence", () => {
		expect(readSpellingContextAnswers(plan, { miss_1: choice("wanted", 0.99) })).toEqual([
			{ tokenIndex: 1, word: null },
		]);
	});

	it("leaves unreadable answers out so the rule decides them", () => {
		expect(readSpellingContextAnswers(plan, { miss_1: { choice: 3 }, miss_3: "big" })).toEqual([]);
	});
});

describe("chooseSpellingInContext", () => {
	it("asks Jev once with the excerpt as state and returns its picks", async () => {
		const askJev = vi.fn(async (_request: JevRequest) => ({ miss_1: choice("want", 0.97) }));

		const result = await chooseSpellingInContext(
			{
				text: "I wnat to learn English.",
				misses: [{ tokenIndex: 1, candidates: ["what", "want"] }],
			},
			{ askJev },
		);

		expect(result).toEqual({ status: "answered", picks: [{ tokenIndex: 1, word: "want" }] });
		expect(askJev).toHaveBeenCalledTimes(1);
		expect(askJev.mock.calls[0]?.[0].state).toEqual({ sentence: "I wnat to learn English." });
	});

	it("does not call Jev when nothing survives verification", async () => {
		const askJev = vi.fn();

		const result = await chooseSpellingInContext(
			{ text: "I wnat it", misses: [{ tokenIndex: 1, candidates: ["banana"] }] },
			{ askJev },
		);

		expect(result).toEqual({ status: "answered", picks: [] });
		expect(askJev).not.toHaveBeenCalled();
	});

	it("rejects malformed input before calling Jev", async () => {
		const askJev = vi.fn();

		await expect(
			chooseSpellingInContext({ text: "", misses: [] }, { askJev }),
		).rejects.toBeInstanceOf(SpellingContextValidationError);
		await expect(
			chooseSpellingInContext(
				{
					text: "x",
					misses: [{ tokenIndex: 0, candidates: Array.from({ length: 101 }, (_, i) => `w${i}`) }],
				},
				{ askJev },
			),
		).rejects.toBeInstanceOf(SpellingContextValidationError);
		expect(askJev).not.toHaveBeenCalled();
	});

	it("lets a Jev failure propagate to the Worker adapter", async () => {
		const askJev = vi.fn(async () => {
			throw new Error("Jev responded 502");
		});

		await expect(
			chooseSpellingInContext(
				{ text: "I wnat it", misses: [{ tokenIndex: 1, candidates: ["want"] }] },
				{ askJev },
			),
		).rejects.toThrow("Jev responded 502");
	});
});
