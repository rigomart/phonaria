import { getLanguagePhonemeIds } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import {
	formatOrdinal,
	formatPercentage,
	hasPhonemeFrequency,
	rankPhonemes,
	summarizePhonemeFrequency,
} from "./phoneme-frequency";

describe("frequency ranking", () => {
	it("ranks every English sound once in order", () => {
		const ranked = rankPhonemes("en-us");
		expect(ranked.map(({ phonemeId }) => phonemeId).sort()).toEqual(
			[...getLanguagePhonemeIds("en-us")].sort(),
		);
		expect(ranked.map(({ rank }) => rank)).toEqual(ranked.map((_, index) => index + 1));
	});

	it("has no data for an accent without frequency data", () => {
		expect(hasPhonemeFrequency("en-us")).toBe(true);
		expect(hasPhonemeFrequency("es-419")).toBe(false);
		expect(rankPhonemes("es-419")).toEqual([]);
		expect(summarizePhonemeFrequency("es-419", "P")).toBeNull();
	});
});

describe("frequency summary", () => {
	it("describes /ð/ by rank and share of speech", () => {
		const summary = summarizePhonemeFrequency("en-us", "DH");
		expect(summary?.rank).toBe(11);
		expect(summary?.count).toBe(40);
		expect(summary?.percentage).toBeGreaterThan(0);
		expect(summary?.relativeShare).toBeLessThan(1);
	});

	it("fills the whole bar for the most common sound", () => {
		expect(summarizePhonemeFrequency("en-us", "AX")?.relativeShare).toBe(1);
	});

	it("formats ordinals and small shares", () => {
		expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 40].map(formatOrdinal)).toEqual([
			"1st",
			"2nd",
			"3rd",
			"4th",
			"11th",
			"12th",
			"13th",
			"21st",
			"22nd",
			"23rd",
			"40th",
		]);
		expect(formatPercentage(7.9229)).toBe("7.9%");
		expect(formatPercentage(0.0501)).toBe("0.05%");
	});
});
