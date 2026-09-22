import { describe, expect, it } from "vitest";
import { isValidOnset, VALID_ONSETS } from "./phonotactics";

describe("VALID_ONSETS", () => {
	it("contains single consonants", () => {
		expect(VALID_ONSETS.has("P")).toBe(true);
		expect(VALID_ONSETS.has("B")).toBe(true);
		expect(VALID_ONSETS.has("S")).toBe(true);
	});

	it("does not contain NG (not a valid onset)", () => {
		expect(VALID_ONSETS.has("NG")).toBe(false);
	});

	it("contains two-consonant clusters", () => {
		expect(VALID_ONSETS.has("P L")).toBe(true);
		expect(VALID_ONSETS.has("S T")).toBe(true);
		expect(VALID_ONSETS.has("K R")).toBe(true);
	});

	it("does not contain invalid clusters", () => {
		expect(VALID_ONSETS.has("T S")).toBe(false);
	});

	it("contains three-consonant clusters", () => {
		expect(VALID_ONSETS.has("S T R")).toBe(true);
		expect(VALID_ONSETS.has("S P L")).toBe(true);
	});
});

describe("isValidOnset", () => {
	it("returns true for single valid consonants", () => {
		expect(isValidOnset(["P"])).toBe(true);
		expect(isValidOnset(["S"])).toBe(true);
	});

	it("returns false for NG", () => {
		expect(isValidOnset(["NG"])).toBe(false);
	});

	it("returns true for valid clusters like S T R", () => {
		expect(isValidOnset(["S", "T", "R"])).toBe(true);
	});

	it("returns false for invalid clusters like T S", () => {
		expect(isValidOnset(["T", "S"])).toBe(false);
	});

	it("returns false for empty array", () => {
		expect(isValidOnset([])).toBe(false);
	});
});
