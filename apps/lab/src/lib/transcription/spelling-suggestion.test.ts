import { describe, expect, it } from "vitest";
import { createSpellingVocabulary, type SpellingVocabulary } from "./spelling-search";
import {
	getVisibleSpellingSuggestion,
	MAX_EXPANDED_TOKENS_PER_REQUEST,
	type SpellingSuggestion,
	suggestSpelling,
} from "./spelling-suggestion";

/** The ranks double as the searchable vocabulary, exactly as the curated list does. */
function vocabulary(ranksByWord: Record<string, number>): SpellingVocabulary {
	return createSpellingVocabulary(ranksByWord);
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
			vocabulary: vocabulary({ receive: 1484 }),
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
			vocabulary: vocabulary({ the: 0, ten: 948, tea: 1910 }),
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
			vocabulary: vocabulary({ from: 25, form: 30, farm: 40 }),
		});

		expect(result).toBeNull();
	});

	it("does not offer a spelling when nothing missed the dictionary", () => {
		const result = suggestSpelling({
			originalText: "from",
			tokens: ["from"],
			misses: [],
			vocabulary: vocabulary({ from: 25, form: 479 }),
		});

		expect(result).toBeNull();
	});

	it("rewrites a mixed phrase and underlines only the offered word", () => {
		const result = suggestSpelling({
			originalText: "hello recieve",
			tokens: ["hello", "recieve"],
			misses: [miss(1, "receive")],
			vocabulary: vocabulary({ hello: 1929, receive: 1484 }),
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
			vocabulary: vocabulary({ hello: 1929, receive: 1484 }),
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
			vocabulary: vocabulary({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("Receive");
	});

	it("keeps all-caps on an offered token", () => {
		const result = suggestSpelling({
			originalText: "RECIEVE",
			tokens: ["RECIEVE"],
			misses: [miss(0, "receive")],
			vocabulary: vocabulary({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("RECEIVE");
	});

	it("applies every obvious substitution in one rewrite", () => {
		const result = suggestSpelling({
			originalText: "teh recieve",
			tokens: ["teh", "recieve"],
			misses: [miss(0, "the", "ten", "tea"), miss(1, "receive")],
			vocabulary: vocabulary({ the: 0, ten: 948, tea: 1910, receive: 1484 }),
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
			vocabulary: vocabulary({ the: 0, receive: 1484, hello: 1929 }),
		});

		expect(result).toBeNull();
	});

	it("underlines only the obvious miss when another miss is silent", () => {
		const result = suggestSpelling({
			originalText: "zxqvwoplmj recieve",
			tokens: ["zxqvwoplmj", "recieve"],
			misses: [miss(0), miss(1, "receive")],
			vocabulary: vocabulary({ receive: 1484 }),
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
			vocabulary: vocabulary({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("receive");
	});

	it("offers receive for a missing-letter slip", () => {
		const result = suggestSpelling({
			originalText: "receve",
			tokens: ["receve"],
			misses: [miss(0, "receive")],
			vocabulary: vocabulary({ receive: 1484 }),
		});

		expect(result?.suggestedText).toBe("receive");
	});

	it("offers receive for recieve even when relieve is a distant 10k neighbour", () => {
		const result = suggestSpelling({
			originalText: "recieve",
			tokens: ["recieve"],
			misses: [miss(0, "receive", "relieve")],
			vocabulary: vocabulary({ receive: 1484, relieve: 9944 }),
		});

		expect(result?.suggestedText).toBe("receive");
	});

	it("offers don't for dont against done", () => {
		const result = suggestSpelling({
			originalText: "dont",
			tokens: ["dont"],
			misses: [miss(0, "don't", "done", "don")],
			vocabulary: vocabulary({ "don't": 67, done: 229, don: 2461 }),
		});

		expect(result?.suggestedText).toBe("don't");
	});

	it("returns no offer for empty text", () => {
		const result = suggestSpelling({
			originalText: "",
			tokens: [],
			misses: [],
			vocabulary: vocabulary({ the: 0 }),
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
			// The candidate is named as a server miss, so the vocabulary only supplies ranks here.
			vocabulary: vocabulary(ranks),
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

	it("rejects a two-edit candidate when one of the edits guesses at a consonant", () => {
		// `fone` → `phone` is an omitted `h` plus an `f` for a `p`: the second edit is a guess.
		expect(soleOffer("fone", "phone", { phone: 200 })).toBeNull();
	});

	it("lets the leader through once an implausible rival is filtered out", () => {
		// Unfiltered, `tec` scored just past the curated list and denied `the` its lead.
		const result = suggestSpelling({
			originalText: "teh",
			tokens: ["teh"],
			misses: [miss(0, "the", "tec")],
			vocabulary: vocabulary({ the: 9000 }),
		});

		expect(result?.suggestedText).toBe("the");
	});

	it("stays silent when two candidates rest on strong slips alone", () => {
		const result = suggestSpelling({
			originalText: "wrk",
			tokens: ["wrk"],
			misses: [miss(0, "wark", "werk")],
			vocabulary: vocabulary({}),
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

/**
 * The bounded second edit. The server only ever finds one-edit candidates, so everything here
 * arrives from the vocabulary scan: the misses carry no candidates at all.
 */
describe("suggestSpelling two-edit recovery", () => {
	function offerFor(token: string, ranks: Record<string, number>) {
		const result = suggestSpelling({
			originalText: token,
			tokens: [token],
			misses: [miss(0)],
			vocabulary: vocabulary(ranks),
		});
		return result?.suggestedText ?? null;
	}

	it("offers accommodate for acomodate", () => {
		expect(offerFor("acomodate", { accommodate: 6777 })).toBe("accommodate");
	});

	it("offers definitely for definatly rather than the nearer defiantly", () => {
		// `defiantly` is one edit away but nothing vouches for it, and the edit reorders a
		// consonant. `definitely` is two edits away, both of which contradict nothing typed.
		expect(offerFor("definatly", { definitely: 1152 })).toBe("definitely");
		expect(offerFor("definatly", { definitely: 1152, defiantly: 9_000 })).toBe("definitely");
	});

	it("refuses a two-edit candidate the curated list says nothing about", () => {
		// Two edits and no frequency evidence is a search for anything nearby, not a reading.
		expect(offerFor("acomodate", {})).toBeNull();
	});

	it("refuses a two-edit candidate when only one of the edits is strong", () => {
		// `kompuuter` drops a doubled `u`, which contradicts nothing, but also swaps `k` for
		// `c`, which guesses at a consonant. One strong edit does not carry the other.
		expect(offerFor("kompuuter", { computer: 1_500 })).toBeNull();
	});

	it("keeps a one-edit reading ahead of a two-edit rival of similar frequency", () => {
		// `received` is two strong edits from `recieve` and slightly more common than `receive`.
		// Undiscounted it would deny `receive` its lead and silence the offer entirely.
		expect(offerFor("recieve", { received: 1_000, receive: 1_484 })).toBe("receive");
	});

	it("gives way when a two-edit reading is far more common than the one-edit rival", () => {
		expect(offerFor("recieve", { received: 5, receive: 9_000 })).toBe("received");
	});

	it("does not reach two edits for a token too short to bound them", () => {
		// Every short word neighbours every other, so two edits out of `cn` settles nothing.
		expect(offerFor("cn", { coin: 2_000 })).toBeNull();
	});

	it("stays silent when two strong two-edit readings are comparably common", () => {
		// `probly` reads as `probably` (two omitted letters) or `problem`; nothing settles it.
		expect(offerFor("probly", { problem: 381, probably: 415 })).toBeNull();
	});

	it("judges every rival in a crowded field rather than a truncated sample", () => {
		// One substitution from the token, all curated, all comparably common: the policy must
		// see the whole field and abstain, not offer whichever few a truncating search returned.
		const crowd: Record<string, number> = {};
		for (let letter = 0; letter < 26; letter += 1) {
			const replacement = String.fromCodePoint(97 + letter);
			if (replacement === "b") continue;
			crowd[`bbbbb${replacement}`] = 100 + letter;
		}

		expect(offerFor("bbbbbb", crowd)).toBeNull();
	});

	it("bounds how many tokens one request may scan", () => {
		const tokens = Array.from(
			{ length: MAX_EXPANDED_TOKENS_PER_REQUEST + 1 },
			(_, index) => `acomodate${"x".repeat(index)}`,
		);
		// Only the first token is a real two-edit slip; the rest exist to spend the budget.
		const result = suggestSpelling({
			originalText: tokens.join(" "),
			tokens,
			misses: tokens.map((_, index) => miss(index)),
			vocabulary: vocabulary({ accommodate: 6777 }),
		});

		expect(result?.underlinedTokenIndexes).toEqual([0]);
	});

	it("does not spend the request budget on tokens too short to reach two edits", () => {
		// A short token's scan can only return curated words one edit out, which the server has
		// already supplied. Charging for it would deny a later recoverable token its search.
		const shortMisses = Array.from({ length: MAX_EXPANDED_TOKENS_PER_REQUEST }, () => "cn");
		const tokens = [...shortMisses, "acomodate"];

		const result = suggestSpelling({
			originalText: tokens.join(" "),
			tokens,
			misses: tokens.map((_, index) => miss(index)),
			vocabulary: vocabulary({ accommodate: 6777 }),
		});

		expect(result?.suggestedText).toContain("accommodate");
	});

	it("scans a repeated token once rather than once per occurrence", () => {
		// The same misspelling twelve times over is one search, so the budget survives it.
		const repeated = Array.from({ length: MAX_EXPANDED_TOKENS_PER_REQUEST }, () => "zxqvwoplmj");
		const tokens = [...repeated, "acomodate"];

		const result = suggestSpelling({
			originalText: tokens.join(" "),
			tokens,
			misses: tokens.map((_, index) => miss(index)),
			vocabulary: vocabulary({ accommodate: 6777 }),
		});

		expect(result?.suggestedText).toContain("accommodate");
	});

	it("stops scanning once the request budget is spent", () => {
		const filler = Array.from(
			{ length: MAX_EXPANDED_TOKENS_PER_REQUEST },
			(_, index) => `zxqvwoplmj${"x".repeat(index)}`,
		);
		const tokens = [...filler, "acomodate"];

		// The recoverable token is last, so every scan was spent before reaching it.
		const result = suggestSpelling({
			originalText: tokens.join(" "),
			tokens,
			misses: tokens.map((_, index) => miss(index)),
			vocabulary: vocabulary({ accommodate: 6777 }),
		});

		expect(result).toBeNull();
	});
});
