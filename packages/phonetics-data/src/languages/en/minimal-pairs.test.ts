import { describe, expect, it } from "vitest";
import { findSubstitution, getSinglePronunciation, toBasePhonemeIds } from "./minimal-pairs";

describe("toBasePhonemeIds", () => {
	it("strips stress digits", () => {
		expect(toBasePhonemeIds("S I1 T")).toEqual(["S", "I", "T"]);
	});
});

describe("getSinglePronunciation", () => {
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
