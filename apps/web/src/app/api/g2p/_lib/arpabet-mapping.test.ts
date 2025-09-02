import { describe, expect, it } from "vitest";
import { ARPABET_TO_IPA } from "../_constants/arpabet-to-ipa";
import { convertArpabetToIPA } from "./arpabet-mapping";

describe("ARPAbet to IPA Mapping", () => {
	describe("ARPABET_TO_IPA mapping", () => {
		it("contains all required vowel mappings", () => {
			// Test a few key vowel mappings to ensure they exist
			expect(ARPABET_TO_IPA.AA).toBe("ɑ");
			expect(ARPABET_TO_IPA.AE).toBe("æ");
			expect(ARPABET_TO_IPA.AH).toBe("ʌ");
			expect(ARPABET_TO_IPA.AH0).toBe("ə"); // schwa for unstressed
			expect(ARPABET_TO_IPA.IY).toBe("i");
			expect(ARPABET_TO_IPA.UW).toBe("u");
		});

		it("contains all required consonant mappings", () => {
			// Test key consonant mappings
			expect(ARPABET_TO_IPA.B).toBe("b");
			expect(ARPABET_TO_IPA.CH).toBe("tʃ");
			expect(ARPABET_TO_IPA.DH).toBe("ð");
			expect(ARPABET_TO_IPA.TH).toBe("θ");
			expect(ARPABET_TO_IPA.NG).toBe("ŋ");
			expect(ARPABET_TO_IPA.R).toBe("ɹ"); // American r
			expect(ARPABET_TO_IPA.ZH).toBe("ʒ");
		});

		it("handles stress variants correctly", () => {
			// Same base phoneme with different stress markers
			expect(ARPABET_TO_IPA.AA0).toBe("ɑ");
			expect(ARPABET_TO_IPA.AA1).toBe("ɑ");
			expect(ARPABET_TO_IPA.AA2).toBe("ɑ");

			// AH0 should be schwa
			expect(ARPABET_TO_IPA.AH0).toBe("ə");
			expect(ARPABET_TO_IPA.AH1).toBe("ʌ");

			// ER stress variants
			expect(ARPABET_TO_IPA.ER0).toBe("ɚ");
			expect(ARPABET_TO_IPA.ER1).toBe("ɝ");
		});
	});

	describe("convertArpabetToIPA", () => {
		it("converts simple words correctly", () => {
			// CAT: K AE1 T
			expect(convertArpabetToIPA(["K", "AE1", "T"])).toEqual(["k", "ˈ", "æ", "t"]);

			// HELLO: HH AH0 L OW1
			expect(convertArpabetToIPA(["HH", "AH0", "L", "OW1"])).toEqual(["h", "ə", "l", "ˈ", "oʊ"]);

			// WATER: W AO1 T ER0
			expect(convertArpabetToIPA(["W", "AO1", "T", "ER0"])).toEqual(["w", "ˈ", "ɔ", "t", "ɚ"]);
		});

		it("handles primary stress correctly", () => {
			// Primary stress (1) adds ˈ before the phoneme
			expect(convertArpabetToIPA(["AE1"])).toEqual(["ˈ", "æ"]);
			expect(convertArpabetToIPA(["IY1"])).toEqual(["ˈ", "i"]);
		});

		it("handles secondary stress correctly", () => {
			// Secondary stress (2) adds ˌ before the phoneme
			expect(convertArpabetToIPA(["AE2"])).toEqual(["ˌ", "æ"]);
			expect(convertArpabetToIPA(["OW2"])).toEqual(["ˌ", "oʊ"]);
		});

		it("handles unstressed vowels correctly", () => {
			// No stress marker (0) or no number - no stress symbol added
			expect(convertArpabetToIPA(["AE0"])).toEqual(["æ"]);
			expect(convertArpabetToIPA(["AE"])).toEqual(["æ"]);

			// AH0 specifically becomes schwa
			expect(convertArpabetToIPA(["AH0"])).toEqual(["ə"]);
		});

		it("handles consonants without stress markers", () => {
			// Consonants never have stress markers in output
			expect(convertArpabetToIPA(["B", "CH", "D"])).toEqual(["b", "tʃ", "d"]);
			expect(convertArpabetToIPA(["TH", "DH", "NG"])).toEqual(["θ", "ð", "ŋ"]);
		});

		it("handles complex words with multiple stresses", () => {
			// COMMUNICATION: K AH0 M Y UW2 N AH0 K EY1 SH AH0 N
			const input = ["K", "AH0", "M", "Y", "UW2", "N", "AH0", "K", "EY1", "SH", "AH0", "N"];
			const expected = ["k", "ə", "m", "j", "ˌ", "u", "n", "ə", "k", "ˈ", "eɪ", "ʃ", "ə", "n"];
			expect(convertArpabetToIPA(input)).toEqual(expected);
		});

		it("handles unknown ARPAbet symbols gracefully", () => {
			// Should pass through unknown symbols unchanged
			expect(convertArpabetToIPA(["UNKNOWN", "AE1", "FAKE2"])).toEqual([
				"UNKNOWN",
				"ˈ",
				"æ",
				"ˌ",
				"FAKE2",
			]);
		});

		it("handles empty input", () => {
			expect(convertArpabetToIPA([])).toEqual([]);
		});

		it("maintains correct order with mixed stress patterns", () => {
			// Test that stress markers come before their vowels
			const input = ["P", "AH0", "L", "IY1", "S"];
			const expected = ["p", "ə", "l", "ˈ", "i", "s"];
			expect(convertArpabetToIPA(input)).toEqual(expected);
		});
	});
});
