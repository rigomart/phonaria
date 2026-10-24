import { EnglishCuratedTop1k } from "@phonaria/phonetics-data/data/en/curated-1k";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { describe, expect, it } from "vitest";
import { cmuToSyllables, lookupTier1, lookupTier2 } from "./shared";

describe("lookupTier1", () => {
	it("returns variants for a known word", () => {
		const result = lookupTier1("the");
		expect(result).not.toBeNull();
		expect(Array.isArray(result)).toBe(true);
		expect(result?.length).toBeGreaterThan(0);
	});

	it("returns null for an unknown word", () => {
		const result = lookupTier1("supercalifragilisticexpialidocious");
		expect(result).toBeNull();
	});

	it("is case-sensitive (expects lowercase)", () => {
		const result = lookupTier1("THE");
		expect(result).toBeNull();
	});

	it("puts an /ɔ/ form ahead of its /ɑ/ form", () => {
		expect(lookupTier1("on")).toEqual(["O1 N", "A1 N"]);
		expect(lookupTier1("the")).toEqual(EnglishCuratedTop1k.words.the);
	});
});

describe("lookupTier2", () => {
	it.each([
		["caught", ["K O1 T", "K A1 T"]],
		["bought", ["B O1 T", "B A1 T"]],
	])("shows %s with /ɔ/ first", (word, variants) => {
		expect(lookupTier2(EnglishCuratedTop10k, word)).toEqual(variants);
	});
});

describe("cmuToSyllables", () => {
	it("normalizes pronunciation whitespace without removing sounds", () => {
		expect(cmuToSyllables("  H\tAX0\nL  OU1 ")).toEqual(cmuToSyllables("H AX0 L OU1"));
	});
	it("produces syllabified structure from CMU string", () => {
		const result = cmuToSyllables("DH AX0");
		expect(result).toHaveLength(1);
		expect(result[0].phonemes).toHaveLength(2);
		expect(result[0].phonemes[0].phonemeId).toBe("DH");
	});

	it("handles multi-syllable CMU string", () => {
		const result = cmuToSyllables("AX0 B AU1 T");
		expect(result).toHaveLength(2);
	});
});
