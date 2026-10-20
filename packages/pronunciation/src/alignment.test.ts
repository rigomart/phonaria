import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { alignPhonemes } from "./alignment";

function align(expected: string, reported: (PhonemeSymbolId | null)[] | string) {
	const reportedIds =
		typeof reported === "string" ? (reported.split(" ") as PhonemeSymbolId[]) : reported;
	return alignPhonemes(expected.split(" ") as PhonemeSymbolId[], reportedIds);
}

describe("alignPhonemes", () => {
	it("lines up identical sequences one to one", () => {
		expect(align("SH IX P", "SH IX P")).toEqual([0, 1, 2]);
	});

	it("lines up a different vowel in the same place", () => {
		expect(align("K O T", "K A T")).toEqual([0, 1, 2]);
	});

	it("leaves an expected sound the scorer didn't report unaligned", () => {
		expect(align("O F T AX N", "O F AX N")).toEqual([0, 1, null, 2, 3]);
	});

	it("skips a reported sound that wasn't expected", () => {
		expect(align("O F AX N", "O F T AX N")).toEqual([0, 1, 3, 4]);
	});

	it("never lines up a vowel with a consonant", () => {
		expect(align("AX", "T")).toEqual([null]);
		expect(align("B I", "B T")).toEqual([0, null]);
	});

	it("lines up an r-colored vowel with a schwa followed by r", () => {
		expect(align("W O T ER", "W O T AX R")).toEqual([0, 1, 2, 3]);
	});

	it("lets a sound without an ID stand in for any expected sound", () => {
		expect(align("SH IX P", ["SH", null, "P"])).toEqual([0, 1, 2]);
	});

	it("leaves a reported sound unaligned when it could belong to either of two expected sounds", () => {
		// Azure reports probably's two b sounds as a single b.
		expect(align("P R A B AX B L I", "P R A B L I")).toEqual([0, 1, 2, null, null, null, 4, 5]);
	});

	it("still lines up a repeated sound when only one place fits", () => {
		expect(align("S IX S", "S IX")).toEqual([0, 1, null]);
		expect(align("B A B", "B A B")).toEqual([0, 1, 2]);
	});

	it("handles empty sequences", () => {
		expect(align("SH IX P", [])).toEqual([null, null, null]);
		expect(alignPhonemes([], ["SH"])).toEqual([]);
	});
});
