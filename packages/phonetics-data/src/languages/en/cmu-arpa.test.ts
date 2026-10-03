import { describe, expect, it } from "vitest";
import { phonemeVariantToCmuArpa } from "./cmu-arpa";

describe("phonemeVariantToCmuArpa", () => {
	it.each([
		["S I1 T", "S IY1 T"],
		["H AX0 L OU1", "HH AH0 L OW1"],
		["J U2 ER0", "JH UW2 ER0"],
		["  SH IX1  P ", "SH IH1 P"],
	])("converts %s without changing its sounds or stress", (input, expected) => {
		expect(phonemeVariantToCmuArpa(input)).toBe(expected);
	});
	it.each([
		"",
		"S UNKNOWN T",
		"S I T",
		"AX1",
		"AH0",
		"P1",
		"EE1",
	])("rejects an invalid or unrepresentable pronunciation: %s", (input) => {
		expect(() => phonemeVariantToCmuArpa(input)).toThrow();
	});
});
