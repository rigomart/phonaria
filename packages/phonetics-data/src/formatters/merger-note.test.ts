import { describe, expect, it } from "vitest";
import { splitMergerNoteText } from "./merger-note";

describe("splitMergerNoteText", () => {
	it("separates example words and sounds from the plain text", () => {
		expect(splitMergerNoteText("Say *cot* with the /ɑ/ of *father*.")).toEqual([
			{ text: "Say ", kind: "plain" },
			{ text: "cot", kind: "word" },
			{ text: " with the ", kind: "plain" },
			{ text: "ɑ", kind: "sound" },
			{ text: " of ", kind: "plain" },
			{ text: "father", kind: "word" },
			{ text: ".", kind: "plain" },
		]);
	});

	it("keeps text without markup whole", () => {
		expect(splitMergerNoteText("Both are normal.")).toEqual([
			{ text: "Both are normal.", kind: "plain" },
		]);
	});
});
