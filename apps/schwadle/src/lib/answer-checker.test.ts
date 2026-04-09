import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { checkAnswer, cmuVariantToPhonemeIds } from "./answer-checker";

describe("cmuVariantToPhonemeIds", () => {
	it("converts a simple CMU variant", () => {
		expect(cmuVariantToPhonemeIds("K AE1 T")).toEqual(["K", "AE", "T"]);
	});

	it("handles schwa (AX) from stressed AH tokens", () => {
		// AH0 maps to AX, AH1 maps to AH
		expect(cmuVariantToPhonemeIds("S AH1 T AX0 L")).toEqual(["S", "AH", "T", "AX", "L"]);
	});

	it("handles diphthongs", () => {
		expect(cmuVariantToPhonemeIds("N AI1 T")).toEqual(["N", "AI", "T"]);
	});

	it("handles consonants without stress markers", () => {
		expect(cmuVariantToPhonemeIds("TH R U1")).toEqual(["TH", "R", "U"]);
	});
});

describe("checkAnswer", () => {
	it("returns correct for exact match", () => {
		const input: EnglishPhonemeSymbolId[] = ["K", "AE", "T"];
		const result = checkAnswer(input, ["K AE1 T"]);

		expect(result.isCorrect).toBe(true);
		expect(result.phonemeResults.every((r) => r.status === "correct")).toBe(true);
	});

	it("accepts any valid CMU variant", () => {
		// "cough" has two variants: K A1 F and K O1 F
		const input: EnglishPhonemeSymbolId[] = ["K", "O", "F"];
		const result = checkAnswer(input, ["K A1 F", "K O1 F"]);

		expect(result.isCorrect).toBe(true);
	});

	it("detects wrong phonemes", () => {
		// Player says "kat" instead of "kæt"
		const input: EnglishPhonemeSymbolId[] = ["K", "A", "T"];
		const result = checkAnswer(input, ["K AE1 T"]);

		expect(result.isCorrect).toBe(false);
		const statuses = result.phonemeResults.map((r) => r.status);
		expect(statuses).toContain("correct"); // K and T should be correct
	});

	it("detects missing phonemes", () => {
		// Player omits first phoneme
		const input: EnglishPhonemeSymbolId[] = ["AE", "T"];
		const result = checkAnswer(input, ["K AE1 T"]);

		expect(result.isCorrect).toBe(false);
		const statuses = result.phonemeResults.map((r) => r.status);
		expect(statuses).toContain("missing");
		expect(statuses).toContain("correct");
	});

	it("detects extra phonemes", () => {
		// Player adds an extra phoneme
		const input: EnglishPhonemeSymbolId[] = ["K", "AE", "T", "S"];
		const result = checkAnswer(input, ["K AE1 T"]);

		expect(result.isCorrect).toBe(false);
		const statuses = result.phonemeResults.map((r) => r.status);
		expect(statuses).toContain("extra");
	});

	it("handles empty player input", () => {
		const input: EnglishPhonemeSymbolId[] = [];
		const result = checkAnswer(input, ["K AE1 T"]);

		expect(result.isCorrect).toBe(false);
		expect(result.phonemeResults.every((r) => r.status === "missing")).toBe(true);
		expect(result.phonemeResults).toHaveLength(3);
	});

	it("enforces strict schwa matching (AX !== AH)", () => {
		// "subtle" is S AH1 T AX0 L — player uses AH instead of AX
		const input: EnglishPhonemeSymbolId[] = ["S", "AH", "T", "AH", "L"];
		const result = checkAnswer(input, ["S AH1 T AX0 L"]);

		expect(result.isCorrect).toBe(false);
	});

	it("handles multi-variant with best match selection", () => {
		// "enough" has two variants, player is close to one
		const input: EnglishPhonemeSymbolId[] = ["IX", "N", "AH", "F"];
		const result = checkAnswer(input, ["IX0 N AH1 F", "I0 N AH1 F"]);

		expect(result.isCorrect).toBe(true);
		expect(result.bestMatchVariant).toBe("IX0 N AH1 F");
	});

	it("produces correct alignment for colonel", () => {
		// "colonel" = K ER1 N AX0 L, player tries K O L O N E L
		const input: EnglishPhonemeSymbolId[] = ["K", "O", "L", "AX", "N", "E", "L"];
		const result = checkAnswer(input, ["K ER1 N AX0 L"]);

		expect(result.isCorrect).toBe(false);
		// Should have a mix of correct, extra, and missing
		const statuses = result.phonemeResults.map((r) => r.status);
		expect(statuses).toContain("correct"); // K and L should match
	});
});
