import { describe, expect, it } from "vitest";
import { splitSpelledWord } from "./spelled-word";

describe("splitSpelledWord", () => {
	it("separates highlighted letters from the rest of the word", () => {
		expect(splitSpelledWord("ha[pp]y")).toEqual([
			{ text: "ha", highlighted: false },
			{ text: "pp", highlighted: true },
			{ text: "y", highlighted: false },
		]);
	});

	it("handles split spellings and highlights at either edge", () => {
		expect(splitSpelledWord("[m]a[k]")).toEqual([
			{ text: "m", highlighted: true },
			{ text: "a", highlighted: false },
			{ text: "k", highlighted: true },
		]);
		expect(splitSpelledWord("m[a]k[e]").map(({ text }) => text)).toEqual(["m", "a", "k", "e"]);
	});

	it("returns the whole word unhighlighted when nothing is marked", () => {
		expect(splitSpelledWord("cat")).toEqual([{ text: "cat", highlighted: false }]);
	});
});
