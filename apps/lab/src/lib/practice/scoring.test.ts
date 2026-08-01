import { describe, expect, it } from "vitest";
import { alignSequences, normalizeAcceptedVariants, normalizeVariant, scoreWord } from "./scoring";

describe("normalizeVariant", () => {
	it("strips stress digits, yielding palette-space phoneme IDs", () => {
		expect(normalizeVariant("T AX0 M EI1 T OU2")).toEqual(["T", "AX", "M", "EI", "T", "OU"]);
	});

	it("leaves consonant tokens unchanged", () => {
		expect(normalizeVariant("DH AX0")).toEqual(["DH", "AX"]);
	});

	it("ignores extra whitespace", () => {
		expect(normalizeVariant(" DH  AX0 ")).toEqual(["DH", "AX"]);
	});

	it("throws on tokens that are not known phoneme IDs", () => {
		expect(() => normalizeVariant("DH QQ0")).toThrow();
	});
});

describe("normalizeAcceptedVariants", () => {
	it("keeps phonemically distinct variants in CMU order", () => {
		expect(normalizeAcceptedVariants(["DH AX0", "DH AH1", "DH I0"])).toEqual([
			["DH", "AX"],
			["DH", "AH"],
			["DH", "I"],
		]);
	});

	it("dedupes variants that collapse once stress is stripped", () => {
		expect(normalizeAcceptedVariants(["R OU1 D", "R OU2 D"])).toEqual([["R", "OU", "D"]]);
	});

	it("keeps the first occurrence when deduping", () => {
		const variants = normalizeAcceptedVariants(["B AE1 D", "B AE2 D", "B I1 D"]);
		expect(variants).toEqual([
			["B", "AE", "D"],
			["B", "I", "D"],
		]);
	});
});

describe("alignSequences", () => {
	it("returns all matches for identical sequences", () => {
		expect(alignSequences(["S", "OU", "F", "AX"], ["S", "OU", "F", "AX"])).toEqual([
			{ kind: "match", sound: "S" },
			{ kind: "match", sound: "OU" },
			{ kind: "match", sound: "F" },
			{ kind: "match", sound: "AX" },
		]);
	});

	it("reports a substitution for a single differing sound", () => {
		expect(alignSequences(["S", "AH", "F", "AX"], ["S", "OU", "F", "AX"])).toEqual([
			{ kind: "match", sound: "S" },
			{ kind: "substitution", target: "OU", source: "AH" },
			{ kind: "match", sound: "F" },
			{ kind: "match", sound: "AX" },
		]);
	});

	it("reports an omission when the learner skips a reference sound", () => {
		expect(alignSequences(["S", "F", "AX"], ["S", "OU", "F", "AX"])).toEqual([
			{ kind: "match", sound: "S" },
			{ kind: "omission", target: "OU" },
			{ kind: "match", sound: "F" },
			{ kind: "match", sound: "AX" },
		]);
	});

	it("reports an insertion when the learner adds an extra sound", () => {
		expect(alignSequences(["S", "T", "OU", "F", "AX"], ["S", "OU", "F", "AX"])).toEqual([
			{ kind: "match", sound: "S" },
			{ kind: "insertion", source: "T" },
			{ kind: "match", sound: "OU" },
			{ kind: "match", sound: "F" },
			{ kind: "match", sound: "AX" },
		]);
	});

	it("prefers substitution over omission when costs tie", () => {
		// learner [A] vs reference [B, C]: omission+substitution both cost 2 either
		// way; the fixed backtrace pairs the learner sound with the LAST reference
		// sound (substitution checked before omission walking from the end).
		expect(alignSequences(["A"], ["B", "C"])).toEqual([
			{ kind: "omission", target: "B" },
			{ kind: "substitution", target: "C", source: "A" },
		]);
	});

	it("renders a swap as two substitutions, never omission plus insertion", () => {
		expect(alignSequences(["A", "B"], ["B", "A"])).toEqual([
			{ kind: "substitution", target: "B", source: "A" },
			{ kind: "substitution", target: "A", source: "B" },
		]);
	});

	it("resolves ambiguous matches deterministically from the end of the word", () => {
		// learner [A] vs reference [A, X, A]: the single A could match either
		// reference A at equal cost; the fixed backtrace pairs it with the last.
		expect(alignSequences(["A"], ["A", "X", "A"])).toEqual([
			{ kind: "omission", target: "A" },
			{ kind: "omission", target: "X" },
			{ kind: "match", sound: "A" },
		]);
	});

	it("is deterministic: identical inputs always produce identical ops", () => {
		const first = alignSequences(["K", "AX", "T"], ["K", "AE", "T", "S"]);
		const second = alignSequences(["K", "AX", "T"], ["K", "AE", "T", "S"]);
		expect(first).toEqual(second);
	});
});

describe("scoreWord", () => {
	it("marks a word correct on strict equality with the only variant", () => {
		const score = scoreWord(["S", "OU", "F", "AX"], ["S OU1 F AX0"]);
		expect(score.correct).toBe(true);
		expect(score.reference).toEqual(["S", "OU", "F", "AX"]);
		expect(score.referenceIndex).toBe(0);
		expect(score.hasAlternates).toBe(false);
		expect(score.matched).toBe(4);
		expect(score.learnerLength).toBe(4);
		expect(score.referenceLength).toBe(4);
	});

	it("accepts any CMU variant, not just the first", () => {
		const score = scoreWord(["DH", "AH"], ["DH AX0", "DH AH1", "DH I0"]);
		expect(score.correct).toBe(true);
		expect(score.referenceIndex).toBe(1);
		expect(score.reference).toEqual(["DH", "AH"]);
		expect(score.hasAlternates).toBe(true);
	});

	it("never scores AX/AH near-misses as correct", () => {
		const score = scoreWord(["S", "OU", "F", "AH"], ["S OU1 F AX0"]);
		expect(score.correct).toBe(false);
		expect(score.ops).toContainEqual({ kind: "substitution", target: "AX", source: "AH" });
	});

	it("never scores AX/IX near-misses as correct", () => {
		const score = scoreWord(["S", "OU", "F", "IX"], ["S OU1 F AX0"]);
		expect(score.correct).toBe(false);
		expect(score.ops).toContainEqual({ kind: "substitution", target: "AX", source: "IX" });
	});

	it("judges wrong answers against the closest variant", () => {
		// learner is one edit from the second variant, two from the first
		const score = scoreWord(
			["T", "AX", "M", "A", "T", "AX"],
			["T AX0 M EI1 T OU2", "T AX0 M A1 T OU2"],
		);
		expect(score.correct).toBe(false);
		expect(score.referenceIndex).toBe(1);
		expect(score.reference).toEqual(["T", "AX", "M", "A", "T", "OU"]);
	});

	it("breaks closest-variant ties by CMU order", () => {
		// learner is exactly one substitution from each variant
		const score = scoreWord(["B", "EH", "D"], ["B AE1 D", "B I1 D"]);
		expect(score.correct).toBe(false);
		expect(score.referenceIndex).toBe(0);
		expect(score.reference).toEqual(["B", "AE", "D"]);
	});

	it("selects the closest variant after stress-strip deduping", () => {
		// first two variants collapse into one; learner matches the collapsed form
		const score = scoreWord(["R", "OU", "D"], ["R OU1 D", "R OU2 D", "R AA1 D"]);
		expect(score.correct).toBe(true);
		expect(score.referenceIndex).toBe(0);
		expect(score.hasAlternates).toBe(true);
	});

	it("scores a blank answer as 0 matched over the full reference length", () => {
		const score = scoreWord([], ["S OU1 F AX0"]);
		expect(score.correct).toBe(false);
		expect(score.matched).toBe(0);
		expect(score.learnerLength).toBe(0);
		expect(score.referenceLength).toBe(4);
		expect(score.ops).toEqual([
			{ kind: "omission", target: "S" },
			{ kind: "omission", target: "OU" },
			{ kind: "omission", target: "F" },
			{ kind: "omission", target: "AX" },
		]);
	});

	it("resolves blank-answer variant ties by CMU order", () => {
		const score = scoreWord([], ["DH AX0", "DH AH1", "DH I0"]);
		expect(score.referenceIndex).toBe(0);
		expect(score.reference).toEqual(["DH", "AX"]);
	});

	it("tallies matched and total per reference sound", () => {
		// reference T AX M EI T OU; learner misses EI and one T
		const score = scoreWord(["T", "AX", "M", "OU"], ["T AX0 M EI1 T OU2"]);
		expect(score.tallies).toEqual({
			T: { matched: 1, total: 2 },
			AX: { matched: 1, total: 1 },
			M: { matched: 1, total: 1 },
			EI: { matched: 0, total: 1 },
			OU: { matched: 1, total: 1 },
		});
	});

	it("tallies a fully correct word as all matched", () => {
		const score = scoreWord(["DH", "AX"], ["DH AX0"]);
		expect(score.tallies).toEqual({
			DH: { matched: 1, total: 1 },
			AX: { matched: 1, total: 1 },
		});
	});

	it("counts insertions in learner length but not in tallies", () => {
		const score = scoreWord(["S", "T", "OU", "F", "AX"], ["S OU1 F AX0"]);
		expect(score.matched).toBe(4);
		expect(score.learnerLength).toBe(5);
		expect(score.referenceLength).toBe(4);
		expect(score.tallies).toEqual({
			S: { matched: 1, total: 1 },
			OU: { matched: 1, total: 1 },
			F: { matched: 1, total: 1 },
			AX: { matched: 1, total: 1 },
		});
	});

	it("returns raw counts only — no derived percentages or copy", () => {
		const score = scoreWord(["DH", "AX"], ["DH AX0"]);
		expect(Object.keys(score).sort()).toEqual([
			"correct",
			"hasAlternates",
			"learnerLength",
			"matched",
			"ops",
			"reference",
			"referenceIndex",
			"referenceLength",
			"tallies",
		]);
	});

	it("throws when no accepted pronunciations are given", () => {
		expect(() => scoreWord(["DH", "AX"], [])).toThrow();
	});
});
