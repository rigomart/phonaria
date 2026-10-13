import { describe, expect, it } from "vitest";
import {
	getChartSection,
	getChartSectionSounds,
	getChartTabPath,
	getSoundPath,
	parseSoundSlug,
} from "./sound-route";

describe("sound pages", () => {
	it("names each page by its lowercase phoneme ID", () => {
		expect(getSoundPath("T")).toBe("/ipa-chart/t");
		expect(getSoundPath("SH")).toBe("/ipa-chart/sh");
	});

	it("reads a slug in any letter case", () => {
		expect(parseSoundSlug("sh", "en-us")).toBe("SH");
		expect(parseSoundSlug("AE", "en-us")).toBe("AE");
	});

	it("rejects unknown slugs and sounds outside the accent", () => {
		expect(parseSoundSlug("consonants", "en-us")).toBeUndefined();
		expect(parseSoundSlug("constructor", "en-us")).toBeUndefined();
		// /x/ is in the Spanish inventory only.
		expect(parseSoundSlug("x", "en-us")).toBeUndefined();
	});

	it("groups diphthongs with the vowels", () => {
		expect(getChartSection("T")).toBe("consonants");
		expect(getChartSection("AE")).toBe("vowels");
		expect(getChartSection("AI")).toBe("vowels");
	});

	it("lists every sound of a chart section once", () => {
		const consonants = getChartSectionSounds("en-us", "consonants");
		const vowels = getChartSectionSounds("en-us", "vowels");
		expect(consonants).toHaveLength(24);
		expect(vowels).toHaveLength(16);
		expect(vowels).toContain("OI");
		expect(new Set([...consonants, ...vowels]).size).toBe(40);
	});

	it("puts a sound page under its chart's tab", () => {
		expect(getChartTabPath("/ipa-chart/t", "en-us")).toBe("/ipa-chart/consonants");
		expect(getChartTabPath("/ipa-chart/ai", "en-us")).toBe("/ipa-chart/vowels");
		expect(getChartTabPath("/ipa-chart/frequency", "en-us")).toBe("/ipa-chart/frequency");
		expect(getChartTabPath("/credits", "en-us")).toBe("/credits");
	});
});
