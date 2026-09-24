import { describe, expect, it } from "vitest";
import { cmuToSyllables, lookupTier1 } from "./shared";

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
});

describe("cmuToSyllables", () => {
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
