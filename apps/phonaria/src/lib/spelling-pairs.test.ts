import { EnglishPhonemeSpellingPatterns, type SpellingPattern } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { pairSpellings } from "./spelling-pairs";

const entries = Object.entries(EnglishPhonemeSpellingPatterns) as [string, SpellingPattern][];

const rowsOf = (id: keyof typeof EnglishPhonemeSpellingPatterns) =>
	pairSpellings(EnglishPhonemeSpellingPatterns[id]).rows.map(({ pattern, examples }) => [
		pattern,
		examples.map(({ word }) => word),
	]);

describe("pairSpellings", () => {
	it("pairs each pattern with the word whose marked letters it spells", () => {
		expect(rowsOf("T")).toEqual([
			["t", ["top"]],
			["tt", ["letter"]],
			["-ed", ["jumped"]],
		]);
		// Split and anchored spellings: "a-e" around one consonant, "-ay" at the end.
		expect(rowsOf("EI")).toEqual([
			["a-e", ["make"]],
			["ai", ["rain"]],
			["-ay", ["day"]],
		]);
		// "ck" is exact for "ba[ck]", so the "k" inside it doesn't claim the word.
		expect(rowsOf("K")).toEqual([
			["c", ["cat"]],
			["k", ["kid"]],
			["ck", ["back"]],
		]);
	});

	it("groups examples that share a pattern", () => {
		expect(rowsOf("U")).toEqual([
			["oo", ["food", "mood"]],
			["ew", ["new"]],
		]);
	});

	it("accepts a pattern that holds the marked letters where its hyphen allows", () => {
		expect(rowsOf("SH")).toEqual([
			["sh", ["shop"]],
			["-tion", ["nation"]],
		]);
	});

	it("keeps an example that no pattern explains, alone", () => {
		expect(
			pairSpellings({
				patterns: ["t"],
				examples: [{ word: "bed", phonemic: "", spelled: "be[d]" }],
			}),
		).toEqual({
			rows: [{ pattern: null, examples: [{ word: "bed", phonemic: "", spelled: "be[d]" }] }],
			unpaired: ["t"],
		});
	});

	it("places every en-us example once, and lists the patterns without an example", () => {
		const unpaired: string[] = [];
		const alone: string[] = [];
		for (const [id, entry] of entries) {
			const { rows, unpaired: patterns } = pairSpellings(entry);
			const placed = rows.flatMap(({ examples }) => examples.map(({ word }) => word));
			expect([...placed].sort(), id).toEqual(entry.examples.map(({ word }) => word).sort());
			unpaired.push(...patterns.map((pattern) => `${id} ${pattern}`));
			alone.push(
				...rows
					.filter(({ pattern }) => pattern === null)
					.map(({ examples }) => `${id} ${examples[0].word}`),
			);
		}
		// The data has no word for these spellings; the section shows them without one.
		expect(unpaired).toEqual(["R rr", "S ss", "SH -sion", "U u-e", "AX e", "OU o"]);
		expect(alone).toEqual([]);
	});
});
