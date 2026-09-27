import { describe, expect, it } from "vitest";
import { loadTier2 } from "@/lib/phoneme-lookup/shared";
import { createTwoEditCandidateIndex, findTwoEditCandidates } from "./two-edit-candidates";

describe("findTwoEditCandidates", () => {
	it("returns exactly two-edit words in curated rank order", () => {
		expect(
			findTwoEditCandidates(
				"reciv",
				createTwoEditCandidateIndex(["recipe", "receive", "recive", "reciv", "rev"]),
			),
		).toEqual(["recipe", "receive", "rev"]);
	});

	it("skips short and non-letter tokens and caps results at ten", () => {
		const ranked = Array.from(
			{ length: 20 },
			(_, index) => `ab${String.fromCharCode(99 + index)}de`,
		);
		const index = createTwoEditCandidateIndex(ranked);
		expect(findTwoEditCandidates("abde", index)).toEqual([]);
		expect(findTwoEditCandidates("ab'de", index)).toEqual([]);
		expect(findTwoEditCandidates("abzxe", index)).toHaveLength(10);
	});

	it("finds the issue's long misspellings in the real curated list", async () => {
		const index = createTwoEditCandidateIndex(Object.keys((await loadTier2()).words));
		for (const [typed, intended] of [
			["definatly", "definitely"],
			["reciv", "receive"],
			["neccesary", "necessary"],
			["acomodate", "accommodate"],
			["tommorow", "tomorrow"],
			["exersize", "exercise"],
			["adres", "address"],
		] as const) {
			expect(findTwoEditCandidates(typed, index), typed).toContain(intended);
		}
	});
});
