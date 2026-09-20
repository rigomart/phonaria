import { describe, expect, it } from "vitest";
import {
	createSpellingDictionary,
	getVisibleSpellingSuggestion,
	type SpellingDictionary,
	type SpellingSuggestion,
	suggestSpelling,
} from "./spelling-suggestion";

function dictionary(ranksByWord: Record<string, number>): SpellingDictionary {
	return createSpellingDictionary(ranksByWord);
}

function offerOf(result: SpellingSuggestion | null) {
	if (result === null) return null;
	return {
		suggestedText: result.suggestedText,
		underlinedTokenIndexes: result.underlinedTokenIndexes,
	};
}

describe("suggestSpelling", () => {
	it("offers receive for recieve", () => {
		const result = suggestSpelling({
			originalText: "recieve",
			tokens: ["recieve"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ receive: 1484 }),
		});

		expect(offerOf(result)).toEqual({
			suggestedText: "receive",
			underlinedTokenIndexes: [0],
		});
	});

	it("offers the for teh against the, ten, and tea", () => {
		const result = suggestSpelling({
			originalText: "teh",
			tokens: ["teh"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ the: 0, ten: 948, tea: 1910 }),
		});

		expect(offerOf(result)).toEqual({
			suggestedText: "the",
			underlinedTokenIndexes: [0],
		});
	});

	it("offers a unique neighbour", () => {
		const result = suggestSpelling({
			originalText: "recieve",
			tokens: ["recieve"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ receive: 50, unrelated: 1 }),
		});

		expect(result?.suggestedText).toBe("receive");
	});

	it("stays silent when neighbours are comparably common", () => {
		const result = suggestSpelling({
			originalText: "frm",
			tokens: ["frm"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ from: 25, form: 30, farm: 40 }),
		});

		expect(result).toBeNull();
	});

	it("stays silent for a two-slip phonetic guess", () => {
		const result = suggestSpelling({
			originalText: "fone",
			tokens: ["fone"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ phone: 200, night: 10 }),
		});

		expect(result).toBeNull();
	});

	it("does not offer a spelling for a dictionary hit", () => {
		const result = suggestSpelling({
			originalText: "from",
			tokens: ["from"],
			missedTokenIndexes: [],
			dictionary: dictionary({ from: 25, form: 479 }),
		});

		expect(result).toBeNull();
	});

	it("rewrites a mixed phrase and underlines only the offered word", () => {
		const result = suggestSpelling({
			originalText: "hello recieve",
			tokens: ["hello", "recieve"],
			missedTokenIndexes: [1],
			dictionary: dictionary({ hello: 1929, receive: 1484 }),
		});

		expect(offerOf(result)).toEqual({
			suggestedText: "hello receive",
			underlinedTokenIndexes: [1],
		});
		expect(result?.segments).toEqual([
			{ text: "hello ", underlined: false },
			{ text: "receive", underlined: true },
		]);
	});

	it("preserves punctuation and spacing when splicing", () => {
		const result = suggestSpelling({
			originalText: "Hello, recieve!",
			tokens: ["Hello", "recieve"],
			missedTokenIndexes: [1],
			dictionary: dictionary({ hello: 1929, receive: 1484 }),
		});

		expect(offerOf(result)).toEqual({
			suggestedText: "Hello, receive!",
			underlinedTokenIndexes: [1],
		});
	});

	it("keeps title case on an offered token", () => {
		const result = suggestSpelling({
			originalText: "Recieve",
			tokens: ["Recieve"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("Receive");
	});

	it("keeps all-caps on an offered token", () => {
		const result = suggestSpelling({
			originalText: "RECIEVE",
			tokens: ["RECIEVE"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("RECEIVE");
	});

	it("applies every obvious substitution in one rewrite", () => {
		const result = suggestSpelling({
			originalText: "teh recieve",
			tokens: ["teh", "recieve"],
			missedTokenIndexes: [0, 1],
			dictionary: dictionary({ the: 0, ten: 948, tea: 1910, receive: 1484 }),
		});

		expect(offerOf(result)).toEqual({
			suggestedText: "the receive",
			underlinedTokenIndexes: [0, 1],
		});
	});

	it("stays silent for an unguessable miss", () => {
		const result = suggestSpelling({
			originalText: "zxqvwoplmj",
			tokens: ["zxqvwoplmj"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ the: 0, receive: 1484, hello: 1929 }),
		});

		expect(result).toBeNull();
	});

	it("underlines only the obvious miss when another miss is silent", () => {
		const result = suggestSpelling({
			originalText: "zxqvwoplmj recieve",
			tokens: ["zxqvwoplmj", "recieve"],
			missedTokenIndexes: [0, 1],
			dictionary: dictionary({ receive: 1484 }),
		});

		expect(offerOf(result)).toEqual({
			suggestedText: "zxqvwoplmj receive",
			underlinedTokenIndexes: [1],
		});
	});

	it("offers receive for an extra-letter slip", () => {
		const result = suggestSpelling({
			originalText: "recceive",
			tokens: ["recceive"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("receive");
	});

	it("offers receive for a missing-letter slip", () => {
		const result = suggestSpelling({
			originalText: "receve",
			tokens: ["receve"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("receive");
	});

	it("offers receive for recieve even when relieve is a distant 10k neighbour", () => {
		const result = suggestSpelling({
			originalText: "recieve",
			tokens: ["recieve"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ receive: 1484, relieve: 9944 }),
		});

		expect(result?.suggestedText).toBe("receive");
	});

	it("offers don't for dont against done", () => {
		const result = suggestSpelling({
			originalText: "dont",
			tokens: ["dont"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ "don't": 67, done: 229, don: 2461 }),
		});

		expect(result?.suggestedText).toBe("don't");
	});

	it("offers a unique neighbour that is only in the full dictionary", () => {
		const result = suggestSpelling({
			originalText: "aardvrk",
			tokens: ["aardvrk"],
			missedTokenIndexes: [0],
			dictionary: dictionary({ aardvark: 10_000 }),
		});

		expect(result?.suggestedText).toBe("aardvark");
	});

	it("returns no offer for empty text", () => {
		const result = suggestSpelling({
			originalText: "",
			tokens: [],
			missedTokenIndexes: [],
			dictionary: dictionary({ the: 0 }),
		});

		expect(result).toBeNull();
	});
});

describe("getVisibleSpellingSuggestion", () => {
	const suggestion: SpellingSuggestion = {
		suggestedText: "receive",
		underlinedTokenIndexes: [0],
		segments: [{ text: "receive", underlined: true }],
	};

	it("shows a rewrite when lookup succeeded", () => {
		expect(getVisibleSpellingSuggestion(suggestion, null, false)).toEqual(suggestion);
	});

	it("hides the rewrite while a lookup error is showing", () => {
		expect(getVisibleSpellingSuggestion(suggestion, "service", false)).toBeNull();
	});

	it("hides the rewrite while a transcription is in flight", () => {
		expect(getVisibleSpellingSuggestion(suggestion, null, true)).toBeNull();
	});
});
