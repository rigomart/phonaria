import { describe, expect, it } from "vitest";
import { syllabify } from "./syllabifier";

describe("syllabify", () => {
	it("returns empty array for empty input", () => {
		expect(syllabify([])).toEqual([]);
	});

	it("syllabifies a CVC word (cat: K AE1 T)", () => {
		const result = syllabify(["K", "AE1", "T"]);
		expect(result).toHaveLength(1);
		expect(result[0].stress).toBe("primary");
		expect(result[0].phonemes).toHaveLength(3);
		expect(result[0].phonemes[0].phonemeId).toBe("K");
		expect(result[0].phonemes[1].phonemeId).toBe("AE");
		expect(result[0].phonemes[2].phonemeId).toBe("T");
	});

	it("syllabifies a multi-syllable word (hello: H AX0 L OU1)", () => {
		const result = syllabify(["H", "AX0", "L", "OU1"]);
		expect(result).toHaveLength(2);
		expect(result[0].stress).toBe("none");
		expect(result[1].stress).toBe("primary");
		// L should go to onset of second syllable (Maximum Onset Principle)
		expect(result[0].phonemes).toHaveLength(2); // H AX0
		expect(result[1].phonemes).toHaveLength(2); // L OU1
	});

	it("handles consonant clusters between syllables (extra: E1 K S T R AX0)", () => {
		const result = syllabify(["E1", "K", "S", "T", "R", "AX0"]);
		expect(result).toHaveLength(2);
		expect(result[0].stress).toBe("primary");
		expect(result[1].stress).toBe("none");
		// S T R is a valid onset, so K goes to coda, S T R to onset
		expect(result[0].phonemes).toHaveLength(2); // E1 K
		expect(result[1].phonemes).toHaveLength(4); // S T R AX0
	});

	it("handles words with no vowels", () => {
		const result = syllabify(["H", "M"]);
		expect(result).toHaveLength(1);
		expect(result[0].stress).toBe("none");
		expect(result[0].phonemes).toHaveLength(2);
	});

	it("handles secondary stress (about: AX2 B AU1 T)", () => {
		const result = syllabify(["AX2", "B", "AU1", "T"]);
		expect(result).toHaveLength(2);
		expect(result[0].stress).toBe("secondary");
		expect(result[1].stress).toBe("primary");
	});

	it("maps phoneme IDs to IPA symbols", () => {
		const result = syllabify(["K", "AE1", "T"]);
		const phonemes = result[0].phonemes;
		expect("ipa" in phonemes[0] && phonemes[0].ipa).toBe("k");
		expect("ipa" in phonemes[1] && phonemes[1].ipa).toBe("æ");
		expect("ipa" in phonemes[2] && phonemes[2].ipa).toBe("t");
	});
});
