import { beforeAll, describe, expect, it } from "vitest";
import { DEFAULT_SUGGESTION_WEIGHTS } from "../src/lib/transcription/spelling-suggestion";
import {
	loadReviewData,
	ONE_EDIT_BASELINE,
	pickUnderPolicy,
	type ReviewData,
	type ReviewOutcome,
	runReview,
	SHIPPED_POLICY,
} from "./review-spelling-cases";
import { CORPUS_CASES } from "./spelling-corpus";

/** The unit tests pin the rule; this pins the outcome against the real repository data. */
describe("spelling suggestion corpus", () => {
	let data: ReviewData;
	let outcomes: ReviewOutcome[];
	const byToken = new Map<string, ReviewOutcome>();

	beforeAll(async () => {
		data = await loadReviewData();
		outcomes = runReview(data);
		for (const outcome of outcomes) byToken.set(outcome.token, outcome);
	});

	it("loads the full pronunciation dictionary and the curated ranks", () => {
		expect(data.pronunciationWords.size).toBeGreaterThan(100_000);
		expect(data.vocabulary.rank("the")).toBe(0);
		expect(data.vocabulary.rank("aardvark")).toBeNull();
	});

	it("keeps the curated list the size the no-evidence rank assumes", () => {
		// Growing the list past `NO_FREQUENCY_EVIDENCE_RANK` would rank unknown words
		// ahead of words the list actually ranks.
		let ranked = 0;
		for (const word of data.pronunciationWords) {
			if (data.vocabulary.rank(word) !== null) ranked += 1;
		}
		expect(ranked).toBe(10_000);
	});

	it("sweeps the same policy the app ships", () => {
		// The sweeps call `pickPlausibleNeighbour` directly, so there is no second implementation
		// to drift. This pins the remaining seam: that assembling the pool per token and running
		// it through the whole-text entry point agree.
		expect(SHIPPED_POLICY).toBe(DEFAULT_SUGGESTION_WEIGHTS);

		const drift: string[] = [];
		for (const outcome of outcomes) {
			if (outcome.dictionaryHit) continue;
			const perToken = pickUnderPolicy(outcome.token, data, SHIPPED_POLICY);
			if (perToken !== outcome.got) {
				drift.push(`${outcome.token}: whole text ${outcome.got}, per token ${perToken}`);
			}
		}

		expect(drift).toEqual([]);
	});

	it("reproduces the one-edit baseline by withholding the second edit", () => {
		// The baseline must differ from the shipped policy only in reading one slip and
		// discounting nothing, so the recorded before-column means what it says.
		expect(ONE_EDIT_BASELINE.maxEdits).toBe(1);
		expect(ONE_EDIT_BASELINE.leadRatio).toBe(DEFAULT_SUGGESTION_WEIGHTS.leadRatio);
		expect(ONE_EDIT_BASELINE.weakPattern).toBe(1);
		expect(ONE_EDIT_BASELINE.twoEdit).toBe(1);
	});

	it("offers nothing a learner would have to undo on the tuning split", () => {
		const wrong = outcomes.filter(
			(outcome) => outcome.split === "tuning" && outcome.verdict === "wrong",
		);
		expect(wrong.map((outcome) => `${outcome.token} → ${outcome.got}`)).toEqual([]);
	});

	it("recovers the two-slip corrections this change exists for", () => {
		expect(byToken.get("acomodate")?.got).toBe("accommodate");
		expect(byToken.get("reccomend")?.got).toBe("recommend");
	});

	it("reads definatly as definitely rather than as the nearer defiantly", () => {
		const outcome = byToken.get("definatly");
		// `defiantly` is the one-edit rival the old policy offered, and it is still a candidate.
		expect(outcome?.serverCandidates).toContain("defiantly");
		expect(outcome?.got).toBe("definitely");
	});

	it("still rejects the unsupported offers #247 set out to stop", () => {
		expect(byToken.get("reciv")?.serverCandidates).toContain("recio");
		expect(byToken.get("reciv")?.got).toBeNull();
		expect(byToken.get("langwidge")?.serverCandidates).toContain("langridge");
		expect(byToken.get("langwidge")?.got).toBeNull();
	});

	it("keeps the corrections the feature exists for", () => {
		expect(byToken.get("recieve")?.got).toBe("receive");
		expect(byToken.get("teh")?.got).toBe("the");
		expect(byToken.get("dont")?.got).toBe("don't");
		expect(byToken.get("receve")?.got).toBe("receive");
		expect(byToken.get("recceive")?.got).toBe("receive");
		expect(byToken.get("aardvrk")?.got).toBe("aardvark");
	});

	it("loses none of the corrections the one-edit policy made", () => {
		const lost = outcomes
			.filter((outcome) => outcome.baselineVerdict === "correct" && outcome.verdict !== "correct")
			.map((outcome) => `${outcome.token}: ${outcome.baseline} → ${outcome.got}`);
		expect(lost).toEqual([]);
	});

	it("says nothing at all on input with no word behind it", () => {
		const noisy = outcomes.filter(
			(outcome) => outcome.category === "intentional unknown" && outcome.got !== null,
		);
		expect(noisy.map((outcome) => `${outcome.token} → ${outcome.got}`)).toEqual([]);
	});

	it("leaves words the pronunciation dictionary already knows alone", () => {
		for (const { token, category } of CORPUS_CASES) {
			if (category !== "dictionary hit") continue;
			const outcome = byToken.get(token);
			expect(outcome?.dictionaryHit, `${token} should be a dictionary hit`).toBe(true);
			expect(outcome?.verdict).toBe("not offered");
		}
	});

	it("records every case that never reaches suggestion", () => {
		// CMUDict knows a fair few misspellings and names. A case that turns out to be a
		// dictionary hit is scored as `not offered`, so it can never flatter the policy.
		const hits = outcomes
			.filter((outcome) => outcome.dictionaryHit)
			.map((outcome) => outcome.token);
		expect(hits).toEqual([
			"fone",
			"nite",
			"alot",
			"thier",
			"goverment",
			"wich",
			"calender",
			"grammer",
			"seige",
			"hendricksen",
			"obrien",
		]);
	});

	it("names a correction the pronunciation dictionary can actually spell", () => {
		const unspellable: string[] = [];
		for (const { token, acceptable } of CORPUS_CASES) {
			for (const word of acceptable) {
				if (!data.pronunciationWords.has(word)) unspellable.push(`${token} → ${word}`);
			}
		}
		expect(unspellable).toEqual([]);
	});

	it("holds every case exactly once, in lower case", () => {
		const tokens = CORPUS_CASES.map((entry) => entry.token);
		expect(tokens.filter((token) => token !== token.toLowerCase())).toEqual([]);
		expect(new Set(tokens).size).toBe(tokens.length);
	});

	it("records the holdout outcome", () => {
		// Written before the thresholds were chosen and read only after. Kept as an assertion so
		// a later change to the policy has to restate what it does to cases it was not fitted to.
		const holdout = outcomes.filter((outcome) => outcome.split === "holdout");
		const of = (verdict: string) =>
			holdout.filter((outcome) => outcome.verdict === verdict).map((outcome) => outcome.token);

		expect(of("wrong")).toEqual(["marquetta"]);
		expect(of("missed")).toEqual(["rember", "probly", "succesfull", "brocolli"]);
		// The one wrong offer is one the one-edit baseline made too, so it is not a new cost.
		expect(byToken.get("marquetta")?.baseline).toBe("marquette");
	});

	it("keeps every unknown-word fixture genuinely unknown", () => {
		const fixtures = CORPUS_CASES.filter(
			(entry) => entry.category === "intentional unknown" || entry.category === "two slips",
		);
		for (const { token } of fixtures) {
			expect(data.pronunciationWords.has(token), `${token} should miss the dictionary`).toBe(false);
		}
	});
});
