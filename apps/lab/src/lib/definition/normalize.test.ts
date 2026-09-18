import { describe, expect, it } from "vitest";
import { MAX_SENSES_PER_POS, MAX_SENSES_TOTAL } from "./contract";
import {
	capDefinitionSenses,
	firstDefinedWord,
	isLookupableDefinitionWord,
	normalizeDefinitionWord,
} from "./normalize";

describe("normalizeDefinitionWord", () => {
	it("lowercases and trims", () => {
		expect(normalizeDefinitionWord("  Hello  ")).toBe("hello");
	});

	it("strips surrounding punctuation", () => {
		expect(normalizeDefinitionWord('"Hello,"')).toBe("hello");
		expect(normalizeDefinitionWord("(word)")).toBe("word");
		expect(normalizeDefinitionWord("world!")).toBe("world");
	});

	it("preserves internal apostrophes and hyphens", () => {
		expect(normalizeDefinitionWord("don't")).toBe("don't");
		expect(normalizeDefinitionWord("well-known")).toBe("well-known");
	});

	it("normalizes curly apostrophes and dashes", () => {
		expect(normalizeDefinitionWord("don\u2019t")).toBe("don't");
		expect(normalizeDefinitionWord("rock\u2013solid")).toBe("rock-solid");
	});
});

describe("isLookupableDefinitionWord", () => {
	it("accepts ordinary dictionary words", () => {
		expect(isLookupableDefinitionWord("hello")).toBe(true);
		expect(isLookupableDefinitionWord("don't")).toBe(true);
	});

	it("rejects empty or oversized values", () => {
		expect(isLookupableDefinitionWord("")).toBe(false);
		expect(isLookupableDefinitionWord("a".repeat(65))).toBe(false);
	});
});

describe("capDefinitionSenses", () => {
	it("keeps the first two senses per part of speech", () => {
		const groups = capDefinitionSenses([
			{
				word: "set",
				meanings: [
					{
						partOfSpeech: "noun",
						definitions: [
							{ definition: "a collection" },
							{ definition: "a group of tennis games" },
							{ definition: "a stage setting" },
						],
					},
				],
			},
		]);

		expect(groups).toEqual([
			{ partOfSpeech: "noun", senses: ["a collection", "a group of tennis games"] },
		]);
		expect(groups[0]?.senses).toHaveLength(MAX_SENSES_PER_POS);
	});

	it("stops at six senses total across parts of speech", () => {
		const groups = capDefinitionSenses([
			{
				meanings: [
					{
						partOfSpeech: "noun",
						definitions: [{ definition: "n1" }, { definition: "n2" }],
					},
					{
						partOfSpeech: "verb",
						definitions: [{ definition: "v1" }, { definition: "v2" }],
					},
					{
						partOfSpeech: "adjective",
						definitions: [{ definition: "a1" }, { definition: "a2" }],
					},
					{
						partOfSpeech: "adverb",
						definitions: [{ definition: "adv1" }, { definition: "adv2" }],
					},
				],
			},
		]);

		expect(groups).toEqual([
			{ partOfSpeech: "noun", senses: ["n1", "n2"] },
			{ partOfSpeech: "verb", senses: ["v1", "v2"] },
			{ partOfSpeech: "adjective", senses: ["a1", "a2"] },
		]);
		expect(groups.flatMap((group) => group.senses)).toHaveLength(MAX_SENSES_TOTAL);
	});

	it("merges later entries into an existing part of speech until the per-POS cap", () => {
		const groups = capDefinitionSenses([
			{
				meanings: [{ partOfSpeech: "noun", definitions: [{ definition: "first" }] }],
			},
			{
				meanings: [
					{
						partOfSpeech: "noun",
						definitions: [{ definition: "second" }, { definition: "third" }],
					},
				],
			},
		]);

		expect(groups).toEqual([{ partOfSpeech: "noun", senses: ["first", "second"] }]);
	});
});

describe("firstDefinedWord", () => {
	it("uses the first entry word when present", () => {
		expect(firstDefinedWord([{ word: "Hello" }], "hello")).toBe("Hello");
	});

	it("falls back when entries omit the word", () => {
		expect(firstDefinedWord([{}], "hello")).toBe("hello");
	});
});
