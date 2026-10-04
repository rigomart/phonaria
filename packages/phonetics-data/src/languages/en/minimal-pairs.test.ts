import { describe, expect, it } from "vitest";
import { findSubstitution, getSinglePronunciation, toBasePhonemeIds } from "./minimal-pairs";

describe("toBasePhonemeIds", () => {
	it("strips stress digits", () => {
		expect(toBasePhonemeIds("S I1 T")).toEqual(["S", "I", "T"]);
	});
	it("rejects an unknown sound rather than shortening a pronunciation", () => {
		expect(() => toBasePhonemeIds("S UNKNOWN T")).toThrow();
	});
	it("accepts repeated spaces, tabs, and surrounding whitespace", () => {
		expect(toBasePhonemeIds("  S\tI1  T\n")).toEqual(["S", "I", "T"]);
	});
	it.each(["", " \t\n"])("rejects an empty pronunciation: %j", (input) => {
		expect(() => toBasePhonemeIds(input)).toThrow();
	});
	it("extracts base IDs without enforcing pronunciation stress rules", () => {
		expect(toBasePhonemeIds("P1 AX1 I EE")).toEqual(["P", "AX", "I", "EE"]);
	});
});

describe("getSinglePronunciation", () => {
	it("accepts one pronunciation and duplicate variants", () => {
		expect(getSinglePronunciation(["S I1 T"])).toEqual(["S", "I", "T"]);
		expect(getSinglePronunciation(["S I1 T", "S I1 T"])).toEqual(["S", "I", "T"]);
	});
	it("checks every variant, including a disagreement after matching variants", () => {
		expect(getSinglePronunciation(["S I1 T", "S I2 T", "S IX1 T"])).toBeNull();
		expect(getSinglePronunciation(["S I1 T", "S I1 T S"])).toBeNull();
	});
	it("accepts variants that differ only in stress", () => {
		expect(getSinglePronunciation(["AX0 N D", "AX1 N D"])).toEqual(["AX", "N", "D"]);
	});

	it("rejects variants that differ in sounds", () => {
		expect(getSinglePronunciation(["AX0 N D", "AE1 N D"])).toBeNull();
	});

	it("rejects an empty variant list", () => {
		expect(getSinglePronunciation([])).toBeNull();
	});
});

describe("findSubstitution", () => {
	it.each([
		[["P", "AE", "T"], ["B", "AE", "T"], { index: 0, from: "P", to: "B" }],
		[["S", "I", "T"], ["S", "I", "D"], { index: 2, from: "T", to: "D" }],
		[["I"], ["IX"], { index: 0, from: "I", to: "IX" }],
	] as const)("finds boundary substitutions in %j → %j", (from, to, expected) => {
		expect(findSubstitution(from, to)).toEqual(expected);
	});
	it("preserves the direction of a substitution", () => {
		expect(findSubstitution(["S", "IX", "T"], ["S", "I", "T"])).toEqual({
			index: 1,
			from: "IX",
			to: "I",
		});
	});
	it("does not invent a substitution for empty pronunciations", () => {
		expect(findSubstitution([], [])).toBeNull();
		expect(findSubstitution([], ["P"])).toBeNull();
	});
	it("finds the single substituted sound", () => {
		expect(findSubstitution(["S", "I", "T"], ["S", "IX", "T"])).toEqual({
			index: 1,
			from: "I",
			to: "IX",
		});
	});

	it("rejects identical, multi-difference, and different-length pronunciations", () => {
		expect(findSubstitution(["S", "I", "T"], ["S", "I", "T"])).toBeNull();
		expect(findSubstitution(["S", "I", "T"], ["Z", "IX", "T"])).toBeNull();
		expect(findSubstitution(["S", "I", "T"], ["S", "I", "T", "S"])).toBeNull();
	});
});
