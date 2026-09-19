import { describe, expect, it } from "vitest";
import { MAX_SENSES_PER_POS, MAX_SENSES_TOTAL } from "./contract";
import {
	capDefinitionSenses,
	isLookupableDefinitionWord,
	normalizeDefinitionWord,
	parseWiktionaryPayload,
	stripDefinitionHtml,
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

describe("stripDefinitionHtml", () => {
	it("strips Wiktionary gloss markup to plain text", () => {
		expect(
			stripDefinitionHtml(
				'<span class="use-with-mention">A <a href="/wiki/greeting#English">greeting</a> (salutation).</span>',
			),
		).toBe("A greeting (salutation).");
	});

	it("decodes basic HTML entities", () => {
		expect(stripDefinitionHtml("fish &amp; chips")).toBe("fish & chips");
		expect(stripDefinitionHtml("it&#39;s")).toBe("it's");
	});
});

describe("parseWiktionaryPayload", () => {
	it("reads English senses and ignores other languages", () => {
		expect(
			parseWiktionaryPayload({
				en: [
					{
						partOfSpeech: "Noun",
						definitions: [
							{ definition: 'A <a href="/wiki/greeting">greeting</a>.' },
							{ definition: "An act of greeting." },
						],
					},
				],
				fr: [{ partOfSpeech: "Nom", definitions: [{ definition: "bonjour" }] }],
			}),
		).toEqual([{ partOfSpeech: "Noun", definitions: ["A greeting.", "An act of greeting."] }]);
	});

	it("returns empty when English is missing", () => {
		expect(parseWiktionaryPayload({ fr: [] })).toEqual([]);
		expect(parseWiktionaryPayload([])).toEqual([]);
	});
});

describe("capDefinitionSenses", () => {
	it("keeps the first two senses per part of speech", () => {
		const groups = capDefinitionSenses([
			{
				partOfSpeech: "noun",
				definitions: ["a collection", "a group of tennis games", "a stage setting"],
			},
		]);

		expect(groups).toEqual([
			{ partOfSpeech: "noun", senses: ["a collection", "a group of tennis games"] },
		]);
		expect(groups[0]?.senses).toHaveLength(MAX_SENSES_PER_POS);
	});

	it("stops at six senses total across parts of speech", () => {
		const groups = capDefinitionSenses([
			{ partOfSpeech: "noun", definitions: ["n1", "n2"] },
			{ partOfSpeech: "verb", definitions: ["v1", "v2"] },
			{ partOfSpeech: "adjective", definitions: ["a1", "a2"] },
			{ partOfSpeech: "adverb", definitions: ["adv1", "adv2"] },
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
			{ partOfSpeech: "noun", definitions: ["first"] },
			{ partOfSpeech: "noun", definitions: ["second", "third"] },
		]);

		expect(groups).toEqual([{ partOfSpeech: "noun", senses: ["first", "second"] }]);
	});
});
