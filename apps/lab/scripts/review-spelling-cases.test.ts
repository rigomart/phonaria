import { beforeAll, describe, expect, it } from "vitest";
import {
	loadReviewData,
	REVIEW_CASES,
	type ReviewData,
	type ReviewOutcome,
	runReview,
} from "./review-spelling-cases";

/** The unit tests pin the rule; this pins the outcome against the real repository data. */
describe("spelling suggestion case review", () => {
	let data: ReviewData;
	let outcomes: ReviewOutcome[];
	const bySlug = new Map<string, ReviewOutcome>();

	beforeAll(async () => {
		data = await loadReviewData();
		outcomes = runReview(data);
		for (const outcome of outcomes) bySlug.set(outcome.token, outcome);
	});

	it("loads the full pronunciation dictionary and the curated ranks", () => {
		expect(data.pronunciationWords.size).toBeGreaterThan(100_000);
		expect(data.frequency.rank("the")).toBe(0);
		expect(data.frequency.rank("aardvark")).toBeNull();
	});

	it("keeps the curated list the size the no-evidence rank assumes", () => {
		// Growing the list past `NO_FREQUENCY_EVIDENCE_RANK` would rank unknown words
		// ahead of words the list actually ranks.
		let ranked = 0;
		for (const word of data.pronunciationWords) {
			if (data.frequency.rank(word) !== null) ranked += 1;
		}
		expect(ranked).toBe(10_000);
	});

	it("offers nothing a learner would have to undo", () => {
		const wrong = outcomes.filter((outcome) => outcome.verdict === "wrong");
		expect(wrong.map((outcome) => `${outcome.token} → ${outcome.got}`)).toEqual([]);
	});

	it("rejects the unsupported offers the previous policy made", () => {
		// Each was the sole candidate, which the old rule took as reason enough.
		expect(bySlug.get("reciv")?.candidates).toContain("recio");
		expect(bySlug.get("reciv")?.got).toBeNull();
		expect(bySlug.get("langwidge")?.candidates).toContain("langridge");
		expect(bySlug.get("langwidge")?.got).toBeNull();
	});

	it("keeps the corrections the feature exists for", () => {
		expect(bySlug.get("recieve")?.got).toBe("receive");
		expect(bySlug.get("teh")?.got).toBe("the");
		expect(bySlug.get("dont")?.got).toBe("don't");
		expect(bySlug.get("receve")?.got).toBe("receive");
		expect(bySlug.get("recceive")?.got).toBe("receive");
		expect(bySlug.get("aardvrk")?.got).toBe("aardvark");
	});

	it("leaves words the pronunciation dictionary already knows alone", () => {
		for (const token of ["fone", "nite", "alot", "thier"]) {
			const outcome = bySlug.get(token);
			expect(outcome?.dictionaryHit, `${token} should be a dictionary hit`).toBe(true);
			expect(outcome?.verdict).toBe("not offered");
		}
	});

	it("keeps every unknown-word fixture genuinely unknown", () => {
		const fixtures = REVIEW_CASES.filter((entry) => entry.group !== "dictionary hit");
		for (const { token } of fixtures) {
			expect(data.pronunciationWords.has(token), `${token} should miss the dictionary`).toBe(false);
		}
	});

	it("records the corrections this policy does not reach", () => {
		// Not losses from the plausibility rule — the previous policy missed both too.
		// Each has two candidates of comparable rank, so no lead can be established:
		// `address` (1279) against `dress` (1776), `what` (45) against `want` (95). See #248.
		const missed = outcomes
			.filter((outcome) => outcome.verdict === "missed")
			.map((outcome) => outcome.token);
		expect(missed).toEqual(["adress", "wnat"]);
	});
});
