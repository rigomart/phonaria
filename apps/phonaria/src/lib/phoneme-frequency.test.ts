import { getLanguagePhonemeIds } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import {
	FREQUENCY_BANDS,
	formatOrdinal,
	formatPercentage,
	hasPhonemeFrequency,
	rankPhonemes,
	summarizePhonemeFrequency,
} from "./phoneme-frequency";

function bandOf(id: string) {
	return rankPhonemes("en-us").find((sound) => sound.phonemeId === id)?.band.label;
}

describe("frequency bands", () => {
	it("puts the most and least common sounds in the outer bands", () => {
		for (const id of ["AX", "T", "N"]) expect(bandOf(id), id).toBe("Very common");
		for (const id of ["ZH", "OI"]) expect(bandOf(id), id).toBe("Rare");
	});

	it("ranks every English sound once and uses every band", () => {
		const ranked = rankPhonemes("en-us");
		expect(ranked.map(({ phonemeId }) => phonemeId).sort()).toEqual(
			[...getLanguagePhonemeIds("en-us")].sort(),
		);
		expect(ranked.map(({ rank }) => rank)).toEqual(ranked.map((_, index) => index + 1));
		expect(new Set(ranked.map(({ band }) => band))).toEqual(new Set(FREQUENCY_BANDS));
		// Bands never interleave, so bar colors darken steadily down the list.
		const bandOrder = ranked.map(({ band }) => FREQUENCY_BANDS.indexOf(band));
		expect(bandOrder).toEqual([...bandOrder].sort((a, b) => a - b));
	});

	it("has no data for an accent without frequency data", () => {
		expect(hasPhonemeFrequency("en-us")).toBe(true);
		expect(hasPhonemeFrequency("es-419")).toBe(false);
		expect(rankPhonemes("es-419")).toEqual([]);
		expect(summarizePhonemeFrequency("es-419", "P")).toBeNull();
	});
});

describe("frequency summary", () => {
	it("describes /ð/ by band, rank and its share of the most common sound's", () => {
		const summary = summarizePhonemeFrequency("en-us", "DH");
		expect(summary?.band.label).toBe("Common");
		expect(summary?.rank).toBe(11);
		expect(summary?.count).toBe(40);
		expect(summary?.fill).toBeGreaterThan(0);
		expect(summary?.fill).toBeLessThan(1);
	});

	it("fills the bar fully for the most common sound", () => {
		expect(summarizePhonemeFrequency("en-us", "AX")?.fill).toBe(1);
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
