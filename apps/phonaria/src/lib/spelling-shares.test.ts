import { describe, expect, it } from "vitest";
import { getRankedSpellings, soundsSpelledBy } from "./spelling-shares";

describe("ranked spellings", () => {
	it("ranks /f/'s spellings by share, the most frequent word first", () => {
		const { ranked, other } = getRankedSpellings("F");
		expect(ranked.map(({ spelling }) => spelling)).toEqual(["f", "ff", "ph"]);
		expect(ranked[0].percentage).toBeGreaterThan(80);
		expect(ranked[0].examples).toHaveLength(3);
		expect(ranked[0].examples[0]).toEqual({ word: "for", spelled: "[f]or" });
		expect(other[0]).toMatchObject({
			spelling: "gh",
			examples: [{ word: "enough", spelled: "enou[gh]" }],
		});
	});

	it("never repeats a word within a spelling", () => {
		const { ranked } = getRankedSpellings("I");
		for (const { examples } of ranked) {
			const words = examples.map(({ word }) => word);
			expect(new Set(words).size).toBe(words.length);
		}
	});

	it("finds the sounds a spelling often spells", () => {
		expect(soundsSpelledBy("th")).toEqual(expect.arrayContaining(["TH", "DH"]));
		expect(soundsSpelledBy("gh")).toEqual([]);
	});
});
