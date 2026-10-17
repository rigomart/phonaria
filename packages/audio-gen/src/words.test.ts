import { EnglishPhonemeSpellingPatterns } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { collectWordsWithPhonemic, getWordPronunciation } from "./words";

describe("catalog pronunciation inputs", () => {
	it("plans all spelling words only when requested, including 56 beyond the catalog", () => {
		const words = collectWordsWithPhonemic("spelling");
		const expected = new Set(
			Object.values(EnglishPhonemeSpellingPatterns).flatMap(({ examples }) =>
				examples.map(({ spelled }) => spelled.replace(/[[\]]/g, "")),
			),
		);
		expect(words.map(({ word }) => word)).toEqual([...expected].sort());
		expect(words).toHaveLength(88);
		const catalog = new Set(collectWordsWithPhonemic().map(({ word }) => word));
		expect(words.filter(({ word }) => !catalog.has(word))).toHaveLength(56);
	});
	it.each([
		["be", "B IY1"],
		["cause", "K AO1 Z"],
		["coffee", "K AA1 F IY0"],
		["dogs", "D AA1 G Z"],
		["hello", "HH AH0 L OW1"],
		["her", "HH ER1"],
		["new", "N UW1"],
		["rabbit", "R AE1 B AH0 T"],
		["this", "DH IH1 S"],
		["top", "T AA1 P"],
		["jeep", "JH IY1 P"],
		["rained", "R EY1 N D"],
		["yoke", "Y OW1 K"],
	])("uses the reviewed spelling pronunciation for %s", (word, cmuArpa) => {
		expect(collectWordsWithPhonemic("spelling").find((entry) => entry.word === word)?.cmuArpa).toBe(
			cmuArpa,
		);
	});
	it("uses the catalog's 400 words and real ARPAbet rather than generated local mappings", () => {
		const words = collectWordsWithPhonemic();
		expect(words).toHaveLength(400);
		expect(new Set(words.map(({ word }) => word)).size).toBe(400);
		expect(words.find(({ word }) => word === "seat")).toMatchObject({
			variant: "S I1 T",
			cmuArpa: "S IY1 T",
			phonemic: "sit",
		});
		expect(words.find(({ word }) => word === "adapt")).toMatchObject({
			cmuArpa: "AH0 D AE1 P T",
		});
	});
	it("does not silently pick a pronunciation or fall back to plain text", () => {
		expect(() => getWordPronunciation("missing", undefined)).toThrow(/missing/);
		expect(() => getWordPronunciation("read", ["R I1 D", "R E1 D"])).toThrow(/read/);
		expect(() => getWordPronunciation("stress", ["S I1 T", "S I0 T"])).toThrow(/stress/);
		expect(() => getWordPronunciation("bad", ["S EE1 T"])).toThrow();
	});
});
