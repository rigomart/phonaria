import { describe, expect, it } from "vitest";
import { createSpellingVocabulary, MIN_LENGTH_FOR_TWO_EDITS } from "./spelling-search";

/** Ranks double as the vocabulary: the curated list is both the word set and the evidence. */
function vocabularyOf(...words: string[]) {
	return createSpellingVocabulary(Object.fromEntries(words.map((word, rank) => [word, rank])));
}

describe("createSpellingVocabulary ranks", () => {
	it("reports the curated rank of a word it knows", () => {
		expect(vocabularyOf("the", "receive").rank("receive")).toBe(1);
	});

	it("reports no rank for a word outside the list", () => {
		expect(vocabularyOf("the").rank("aardvark")).toBeNull();
	});

	it("ignores letter case when looking up a rank", () => {
		expect(vocabularyOf("the", "receive").rank("Receive")).toBe(1);
	});
});

describe("createSpellingVocabulary nearWords", () => {
	it("finds a word one edit from the token", () => {
		expect(vocabularyOf("receive", "unrelated").nearWords("recieve")).toContain("receive");
	});

	it("finds a word two edits from the token", () => {
		expect(vocabularyOf("accommodate", "unrelated").nearWords("acomodate")).toContain(
			"accommodate",
		);
	});

	it("finds both readings of an ambiguous token", () => {
		const found = vocabularyOf("definitely", "defiantly").nearWords("definatly");
		expect(found.sort()).toEqual(["defiantly", "definitely"]);
	});

	it("leaves out a word three edits from the token", () => {
		expect(vocabularyOf("accommodate").nearWords("acomdate")).toEqual([]);
	});

	it("leaves out the token itself", () => {
		expect(vocabularyOf("receive").nearWords("receive")).toEqual([]);
	});

	it("searches only one edit out for a token too short to bound two", () => {
		const short = "a".repeat(MIN_LENGTH_FOR_TWO_EDITS - 1);
		const vocabulary = vocabularyOf(`${short}xy`, `${short}x`);

		// One edit away is still found; the two-edit neighbour is not.
		expect(vocabulary.nearWords(short)).toEqual([`${short}x`]);
	});

	it("searches two edits out once the token is long enough to bound them", () => {
		const long = "a".repeat(MIN_LENGTH_FOR_TWO_EDITS);
		const vocabulary = vocabularyOf(`${long}xy`);

		expect(vocabulary.nearWords(long)).toEqual([`${long}xy`]);
	});

	it("returns every neighbour in a crowded field rather than truncating", () => {
		// The policy can only abstain over rivals it is shown. Dropping some of a crowded field
		// would let an arbitrary subset settle the offer, so the search returns all of them.
		const base = "b".repeat(MIN_LENGTH_FOR_TWO_EDITS);
		const crowd: string[] = [];
		for (let position = 0; position < base.length; position += 1) {
			for (let letter = 0; letter < 26; letter += 1) {
				const replacement = String.fromCodePoint(97 + letter);
				if (replacement === "b") continue;
				crowd.push(base.slice(0, position) + replacement + base.slice(position + 1));
			}
		}

		const found = vocabularyOf(...crowd).nearWords(base);
		expect(found.length).toBe(crowd.length);
	});

	it("returns nothing for an empty token", () => {
		expect(vocabularyOf("the").nearWords("")).toEqual([]);
	});

	it("matches a word carrying an apostrophe", () => {
		expect(vocabularyOf("don't", "done").nearWords("dont")).toContain("don't");
	});

	it("finds the same words a full scan would", () => {
		// The length and letter-mask prefilters must not drop a word real classification keeps.
		const words = [
			"accommodate",
			"accommodates",
			"commodate",
			"acclimate",
			"definitely",
			"defiantly",
			"receive",
			"relieve",
			"believe",
			"deceive",
			"separate",
			"desperate",
			"aardvark",
			"zucchini",
			"rhinoceros",
		];
		const vocabulary = vocabularyOf(...words);

		for (const token of ["acomodate", "definatly", "recieve", "seperate", "rhinocerus"]) {
			const maxEdits = token.length >= MIN_LENGTH_FOR_TWO_EDITS ? 2 : 1;
			const expected = words
				.filter((word) => word !== token && withinEdits(token, word, maxEdits))
				.sort();
			expect(vocabulary.nearWords(token).sort(), token).toEqual(expected);
		}
	});
});

/** Deliberately unoptimised: the point is to not share the search's prefilters. */
function withinEdits(token: string, word: string, maxEdits: number): boolean {
	const rows = token.length + 1;
	const columns = word.length + 1;
	const table = Array.from({ length: rows }, () => new Array<number>(columns).fill(0));
	for (let row = 0; row < rows; row += 1) table[row][0] = row;
	for (let column = 0; column < columns; column += 1) table[0][column] = column;

	for (let row = 1; row < rows; row += 1) {
		for (let column = 1; column < columns; column += 1) {
			const cost = token[row - 1] === word[column - 1] ? 0 : 1;
			let best = Math.min(
				table[row - 1][column] + 1,
				table[row][column - 1] + 1,
				table[row - 1][column - 1] + cost,
			);
			if (
				row > 1 &&
				column > 1 &&
				token[row - 1] === word[column - 2] &&
				token[row - 2] === word[column - 1]
			) {
				best = Math.min(best, table[row - 2][column - 2] + 1);
			}
			table[row][column] = best;
		}
	}

	return table[token.length][word.length] <= maxEdits;
}
