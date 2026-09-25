import { describe, expect, it } from "vitest";
import {
	createSpellingFrequency,
	getVisibleSpellingSuggestion,
	isOneSlipNeighbour,
	type SpellingFrequency,
	type SpellingSuggestion,
	suggestSpelling,
} from "./spelling-suggestion";

function frequency(ranksByWord: Record<string, number>): SpellingFrequency {
	return createSpellingFrequency(ranksByWord);
}

/** One dictionary miss, as the server reports it. */
function miss(tokenIndex: number, ...candidates: string[]) {
	return { tokenIndex, candidates };
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
			misses: [miss(0, "receive")],
			frequency: frequency({ receive: 1484 }),
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
			misses: [miss(0, "the", "ten", "tea")],
			frequency: frequency({ the: 0, ten: 948, tea: 1910 }),
		});

		expect(offerOf(result)).toEqual({
			suggestedText: "the",
			underlinedTokenIndexes: [0],
		});
	});

	it("stays silent when neighbours are comparably common", () => {
		const result = suggestSpelling({
			originalText: "frm",
			tokens: ["frm"],
			misses: [miss(0, "from", "form", "farm")],
			frequency: frequency({ from: 25, form: 30, farm: 40 }),
		});

		expect(result).toBeNull();
	});

	it("does not offer a spelling when nothing missed the dictionary", () => {
		const result = suggestSpelling({
			originalText: "from",
			tokens: ["from"],
			misses: [],
			frequency: frequency({ from: 25, form: 479 }),
		});

		expect(result).toBeNull();
	});

	it("rewrites a mixed phrase and underlines only the offered word", () => {
		const result = suggestSpelling({
			originalText: "hello recieve",
			tokens: ["hello", "recieve"],
			misses: [miss(1, "receive")],
			frequency: frequency({ hello: 1929, receive: 1484 }),
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
			misses: [miss(1, "receive")],
			frequency: frequency({ hello: 1929, receive: 1484 }),
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
			misses: [miss(0, "receive")],
			frequency: frequency({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("Receive");
	});

	it("keeps all-caps on an offered token", () => {
		const result = suggestSpelling({
			originalText: "RECIEVE",
			tokens: ["RECIEVE"],
			misses: [miss(0, "receive")],
			frequency: frequency({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("RECEIVE");
	});

	it("applies every obvious substitution in one rewrite", () => {
		const result = suggestSpelling({
			originalText: "teh recieve",
			tokens: ["teh", "recieve"],
			misses: [miss(0, "the", "ten", "tea"), miss(1, "receive")],
			frequency: frequency({ the: 0, ten: 948, tea: 1910, receive: 1484 }),
		});

		expect(offerOf(result)).toEqual({
			suggestedText: "the receive",
			underlinedTokenIndexes: [0, 1],
		});
	});

	it("stays silent for a miss with no candidates", () => {
		const result = suggestSpelling({
			originalText: "zxqvwoplmj",
			tokens: ["zxqvwoplmj"],
			misses: [miss(0)],
			frequency: frequency({ the: 0, receive: 1484, hello: 1929 }),
		});

		expect(result).toBeNull();
	});

	it("underlines only the obvious miss when another miss is silent", () => {
		const result = suggestSpelling({
			originalText: "zxqvwoplmj recieve",
			tokens: ["zxqvwoplmj", "recieve"],
			misses: [miss(0), miss(1, "receive")],
			frequency: frequency({ receive: 1484 }),
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
			misses: [miss(0, "receive")],
			frequency: frequency({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("receive");
	});

	it("offers receive for a missing-letter slip", () => {
		const result = suggestSpelling({
			originalText: "receve",
			tokens: ["receve"],
			misses: [miss(0, "receive")],
			frequency: frequency({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("receive");
	});

	it("offers receive for recieve even when relieve is a distant 10k neighbour", () => {
		const result = suggestSpelling({
			originalText: "recieve",
			tokens: ["recieve"],
			misses: [miss(0, "receive", "relieve")],
			frequency: frequency({ receive: 1484, relieve: 9944 }),
		});

		expect(result?.suggestedText).toBe("receive");
	});

	it("offers don't for dont against done", () => {
		const result = suggestSpelling({
			originalText: "dont",
			tokens: ["dont"],
			misses: [miss(0, "don't", "done", "don")],
			frequency: frequency({ "don't": 67, done: 229, don: 2461 }),
		});

		expect(result?.suggestedText).toBe("don't");
	});

	it("returns no offer for empty text", () => {
		const result = suggestSpelling({
			originalText: "",
			tokens: [],
			misses: [],
			frequency: frequency({ the: 0 }),
		});

		expect(result).toBeNull();
	});
});

/** Offered when the curated list shows the word is common, or the slip itself justifies it. */
describe("suggestSpelling plausibility", () => {
	function soleOffer(token: string, candidate: string, ranks: Record<string, number> = {}) {
		const result = suggestSpelling({
			originalText: token,
			tokens: [token],
			misses: [miss(0, candidate)],
			frequency: frequency(ranks),
		});
		return result?.suggestedText ?? null;
	}

	it("rejects a sole candidate reached by swapping a consonant for a vowel", () => {
		expect(soleOffer("reciv", "recio")).toBeNull();
	});

	it("rejects a sole candidate reached by swapping one consonant for another", () => {
		expect(soleOffer("langwidge", "langridge")).toBeNull();
	});

	it("rejects a sole candidate reached by transposing a consonant and a vowel", () => {
		expect(soleOffer("definatly", "defiantly")).toBeNull();
	});

	it("offers a sole candidate that supplies a letter the learner left out", () => {
		expect(soleOffer("aardvrk", "aardvark")).toBe("aardvark");
	});

	it("offers a sole candidate that drops a letter the learner doubled", () => {
		expect(soleOffer("zucchinni", "zucchini")).toBe("zucchini");
	});

	it("offers a sole candidate reached by swapping one vowel for another", () => {
		expect(soleOffer("rhinocerus", "rhinoceros")).toBe("rhinoceros");
	});

	it("offers a sole candidate reached by transposing two vowels", () => {
		expect(soleOffer("wierdness", "weirdness")).toBe("weirdness");
	});

	it("offers a sole weak candidate once the curated list shows it is common", () => {
		expect(soleOffer("thnik", "think")).toBeNull();
		expect(soleOffer("thnik", "think", { think: 322 })).toBe("think");
	});

	it("treats an absent rank as missing evidence rather than as a common word", () => {
		// No frequency evidence cannot carry a weak slip; a curated rank can.
		expect(soleOffer("reciv", "recio")).toBeNull();
		expect(soleOffer("reciv", "recio", { recio: 4000 })).toBe("recio");
	});

	it("ignores a candidate that is more than one slip from the token", () => {
		expect(soleOffer("fone", "phone", { phone: 200 })).toBeNull();
	});

	it("lets the leader through once an implausible rival is filtered out", () => {
		// Unfiltered, `tec` scored just past the curated list and denied `the` its lead.
		const result = suggestSpelling({
			originalText: "teh",
			tokens: ["teh"],
			misses: [miss(0, "the", "tec")],
			frequency: frequency({ the: 9000 }),
		});

		expect(result?.suggestedText).toBe("the");
	});

	it("stays silent when two candidates rest on strong slips alone", () => {
		const result = suggestSpelling({
			originalText: "wrk",
			tokens: ["wrk"],
			misses: [miss(0, "wark", "werk")],
			frequency: frequency({}),
		});

		expect(result).toBeNull();
	});
});

describe("suggestSpelling with context picks", () => {
	it("offers the context pick where the rule stays silent", () => {
		// `wnat` has `what` and `want` as neighbours; frequency alone cannot choose.
		const result = suggestSpelling({
			originalText: "I wnat to learn",
			tokens: ["I", "wnat", "to", "learn"],
			misses: [miss(1, "what", "want")],
			frequency: frequency({ what: 40, want: 90 }),
			contextPicks: new Map([[1, "want"]]),
		});

		expect(offerOf(result)).toEqual({
			suggestedText: "I want to learn",
			underlinedTokenIndexes: [1],
		});
	});

	it("keeps a token silent when the context declined, even if the rule would offer", () => {
		const result = suggestSpelling({
			originalText: "recieve",
			tokens: ["recieve"],
			misses: [miss(0, "receive")],
			frequency: frequency({ receive: 1484 }),
			contextPicks: new Map([[0, null]]),
		});

		expect(result).toBeNull();
	});

	it("uses the rule for tokens the context did not answer", () => {
		const result = suggestSpelling({
			originalText: "recieve teh",
			tokens: ["recieve", "teh"],
			misses: [miss(0, "receive"), miss(1, "the", "tea")],
			frequency: frequency({ receive: 1484, the: 0, tea: 2000 }),
			contextPicks: new Map([[1, "the"]]),
		});

		expect(offerOf(result)).toEqual({
			suggestedText: "receive the",
			underlinedTokenIndexes: [0, 1],
		});
	});

	it("ignores a context pick that is not one of the searched candidates", () => {
		const result = suggestSpelling({
			originalText: "wnat",
			tokens: ["wnat"],
			misses: [miss(0, "what", "want")],
			frequency: frequency({}),
			contextPicks: new Map([[0, "wanted"]]),
		});

		expect(result).toBeNull();
	});

	it("keeps the learner's capitalization on a context pick", () => {
		const result = suggestSpelling({
			originalText: "Wnat",
			tokens: ["Wnat"],
			misses: [miss(0, "what", "want")],
			frequency: frequency({}),
			contextPicks: new Map([[0, "WANT"]]),
		});

		expect(result?.suggestedText).toBe("Want");
	});
});

describe("isOneSlipNeighbour", () => {
	it("accepts each single slip and rejects anything further", () => {
		expect(isOneSlipNeighbour("wnat", "want")).toBe(true);
		expect(isOneSlipNeighbour("adress", "address")).toBe(true);
		expect(isOneSlipNeighbour("frm", "fm")).toBe(true);
		expect(isOneSlipNeighbour("cn", "can")).toBe(true);
		expect(isOneSlipNeighbour("definatly", "definitely")).toBe(false);
		expect(isOneSlipNeighbour("want", "want")).toBe(false);
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
