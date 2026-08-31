import { describe, expect, it } from "vitest";
import { getDiphthongEntries, getMonophthongEntries } from "./vowel-chart-data";

describe("vowel chart data", () => {
	it("returns the full American English vowel inventory with discriminated entry types", () => {
		const monophthongs = getMonophthongEntries("en-us");
		const diphthongs = getDiphthongEntries("en-us");

		expect(monophthongs).toHaveLength(11);
		expect(diphthongs).toHaveLength(5);
		expect(monophthongs.every((entry) => entry.vowelType === "monophthong")).toBe(true);
		expect(diphthongs.every((entry) => entry.vowelType === "diphthong")).toBe(true);
	});

	it("keeps the symbol-faithful shared onset for /aɪ/ and /aʊ/", () => {
		const diphthongs = getDiphthongEntries("en-us");
		const ai = diphthongs.find((entry) => entry.id === "AI");
		const au = diphthongs.find((entry) => entry.id === "AU");

		expect(ai?.features.height).toBe("open");
		expect(ai?.features.backness).toBe("front");
		expect(au?.features.height).toBe("open");
		expect(au?.features.backness).toBe("front");
	});

	it("returns no diphthongs for accents without diphthong data", () => {
		expect(getDiphthongEntries("es-419")).toEqual([]);
	});
});
