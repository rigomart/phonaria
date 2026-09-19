import { describe, expect, it } from "vitest";
import { MAX_SENSES_PER_POS, MAX_SENSES_TOTAL } from "./contract";
import { capDefinitionSenses, parseWiktionaryPayload, stripDefinitionHtml } from "./normalize";
import { isLookupableDefinitionWord, normalizeDefinitionWord } from "./word";

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
						language: "English",
						partOfSpeech: "Noun",
						definitions: [
							{ definition: 'A <a href="/wiki/greeting">greeting</a>.' },
							{ definition: "An act of greeting." },
						],
					},
				],
				fr: [{ partOfSpeech: "Nom", definitions: [{ definition: "bonjour" }] }],
			}),
		).toEqual([
			{
				partOfSpeech: "Noun",
				definitions: [{ definition: "A greeting." }, { definition: "An act of greeting." }],
			},
		]);
	});

	it("filters entries by their own language inside the English response bucket", () => {
		expect(
			parseWiktionaryPayload({
				en: [
					{
						language: "Translingual",
						partOfSpeech: "Symbol",
						definitions: [{ definition: "ISO 639-3 language code for Sentani." }],
					},
					{
						language: "English",
						partOfSpeech: "Verb",
						definitions: [{ definition: "To put something down." }],
					},
				],
			}),
		).toEqual([
			{
				partOfSpeech: "Verb",
				definitions: [{ definition: "To put something down." }],
			},
		]);
	});

	it("keeps a definition's own text without nested senses or stylesheet content", () => {
		expect(
			parseWiktionaryPayload({
				en: [
					{
						language: "English",
						partOfSpeech: "Article",
						definitions: [
							{
								definition:
									"<span>Used before a noun phrase.</span><ol><li><span>The definite grammatical article.</span><ol><li><span>Because it was already mentioned.</span></li></ol></li></ol>",
							},
							{
								definition:
									"<span>The definite grammatical article.</span><style>.mw-parser-output .defdate{font-size:smaller}</style>",
							},
							{ definition: "Because it was already mentioned." },
						],
					},
				],
			}),
		).toEqual([
			{
				partOfSpeech: "Article",
				definitions: [
					{ definition: "Used before a noun phrase." },
					{ definition: "The definite grammatical article." },
					{ definition: "Because it was already mentioned." },
				],
			},
		]);
	});

	it("removes references, media, and layout subtrees from definitions and examples", () => {
		expect(
			parseWiktionaryPayload({
				en: [
					{
						language: "English",
						partOfSpeech: "Noun",
						definitions: [
							{
								definition:
									'<span>Either end of a line.</span><sup class="reference">[1]</sup><div class="mw-references-wrap"><ol class="references"><li>A bibliography entry.</li></ol></div><figure><img src="point.png"><figcaption>A marked point.</figcaption></figure><table><tr><td>layout text</td></tr></table>',
								parsedExamples: [
									{
										example:
											"Look <b>here</b>.<figure><figcaption>Diagram caption</figcaption></figure>",
									},
								],
							},
						],
					},
				],
			}),
		).toEqual([
			{
				partOfSpeech: "Noun",
				definitions: [{ definition: "Either end of a line.", example: "Look here." }],
			},
		]);
	});

	it("preserves text boundaries and readable inline math", () => {
		expect(
			parseWiktionaryPayload({
				en: [
					{
						language: "English",
						partOfSpeech: "Noun",
						definitions: [
							{
								definition:
									"<div>A mathematical quantity.</div><div>For example, <math><mi>e</mi><msup><mi>i</mi><mi>π</mi></msup><mo>+</mo><mn>1</mn><mo>=</mo><mn>0</mn>.</math></div>",
							},
						],
					},
				],
			}),
		).toEqual([
			{
				partOfSpeech: "Noun",
				definitions: [{ definition: "A mathematical quantity. For example, eiπ+1=0." }],
			},
		]);
	});

	it("bounds source fragments and normalized output without losing later candidates", () => {
		const meanings = parseWiktionaryPayload({
			en: [
				{
					language: "English",
					partOfSpeech: "Noun",
					definitions: [
						{ definition: "x".repeat(20_001) },
						{
							definition: `<span>${"d".repeat(1_200)}</span>`,
							parsedExamples: [
								{ example: "x".repeat(20_001) },
								{ example: `<i>${"e".repeat(700)}</i>` },
							],
						},
					],
				},
			],
		});

		expect(meanings).toEqual([
			{
				partOfSpeech: "Noun",
				definitions: [
					{
						definition: "d".repeat(1_000),
						example: "e".repeat(500),
					},
				],
			},
		]);
	});

	it("skips malformed entries while retaining legitimate English part-of-speech labels", () => {
		expect(
			parseWiktionaryPayload({
				en: [
					null,
					"not an entry",
					{ language: "English", partOfSpeech: "Letter", definitions: "not an array" },
					{
						language: "English",
						partOfSpeech: " Letter ",
						definitions: [{ definition: "A letter." }, null],
					},
					{
						language: "English",
						partOfSpeech: "Symbol",
						definitions: [{ definition: "A symbol." }],
					},
					{
						language: "English",
						partOfSpeech: "Numeral",
						definitions: [{ definition: "A numeral." }],
					},
				],
			}),
		).toEqual([
			{ partOfSpeech: "Letter", definitions: [{ definition: "A letter." }] },
			{ partOfSpeech: "Symbol", definitions: [{ definition: "A symbol." }] },
			{ partOfSpeech: "Numeral", definitions: [{ definition: "A numeral." }] },
		]);
	});

	it("skips comment-only examples and ignores unrelated example metadata", () => {
		expect(
			parseWiktionaryPayload({
				en: [
					{
						language: "English",
						partOfSpeech: "Noun",
						definitions: [
							{
								definition: "A definition.",
								parsedExamples: [
									{ example: "<!-- hidden -->" },
									{
										example: "The <b>useful</b> example.",
										translation: "ignored",
										footer: "ignored",
										qualifier: "ignored",
									},
								],
								examples: ["ignored fallback"],
							},
						],
					},
				],
			}),
		).toEqual([
			{
				partOfSpeech: "Noun",
				definitions: [{ definition: "A definition.", example: "The useful example." }],
			},
		]);
	});

	it("returns empty when English is missing", () => {
		expect(parseWiktionaryPayload({ fr: [] })).toEqual([]);
		expect(parseWiktionaryPayload([])).toEqual([]);
	});

	it("keeps the first stripped example per sense from parsedExamples", () => {
		expect(
			parseWiktionaryPayload({
				en: [
					{
						language: "English",
						partOfSpeech: "Interjection",
						definitions: [
							{
								definition: "A greeting.",
								parsedExamples: [
									{ example: "<b>Hello</b>, everyone." },
									{ example: "Hello? Is anyone there?" },
								],
								examples: ["ignored fallback"],
							},
							{
								definition: "A greeting used when answering the telephone.",
							},
						],
					},
				],
			}),
		).toEqual([
			{
				partOfSpeech: "Interjection",
				definitions: [
					{ definition: "A greeting.", example: "Hello, everyone." },
					{ definition: "A greeting used when answering the telephone." },
				],
			},
		]);
	});

	it("falls back to examples when parsedExamples has no usable text", () => {
		expect(
			parseWiktionaryPayload({
				en: [
					{
						language: "English",
						partOfSpeech: "Noun",
						definitions: [
							{
								definition: "A greeting.",
								parsedExamples: [{ example: "<b>  </b>" }],
								examples: ["They gave each other a quick <b>hello</b>."],
							},
						],
					},
				],
			}),
		).toEqual([
			{
				partOfSpeech: "Noun",
				definitions: [
					{ definition: "A greeting.", example: "They gave each other a quick hello." },
				],
			},
		]);
	});
});

describe("capDefinitionSenses", () => {
	it("keeps the first two senses per part of speech", () => {
		const groups = capDefinitionSenses([
			{
				partOfSpeech: "noun",
				definitions: [
					{ definition: "a collection" },
					{ definition: "a group of tennis games" },
					{ definition: "a stage setting" },
				],
			},
		]);

		expect(groups).toEqual([
			{
				partOfSpeech: "noun",
				senses: [{ definition: "a collection" }, { definition: "a group of tennis games" }],
			},
		]);
		expect(groups[0]?.senses).toHaveLength(MAX_SENSES_PER_POS);
	});

	it("stops at six senses total across parts of speech", () => {
		const groups = capDefinitionSenses([
			{ partOfSpeech: "noun", definitions: [{ definition: "n1" }, { definition: "n2" }] },
			{ partOfSpeech: "verb", definitions: [{ definition: "v1" }, { definition: "v2" }] },
			{ partOfSpeech: "adjective", definitions: [{ definition: "a1" }, { definition: "a2" }] },
			{ partOfSpeech: "adverb", definitions: [{ definition: "adv1" }, { definition: "adv2" }] },
		]);

		expect(groups).toEqual([
			{ partOfSpeech: "noun", senses: [{ definition: "n1" }, { definition: "n2" }] },
			{ partOfSpeech: "verb", senses: [{ definition: "v1" }, { definition: "v2" }] },
			{ partOfSpeech: "adjective", senses: [{ definition: "a1" }, { definition: "a2" }] },
		]);
		expect(groups.flatMap((group) => group.senses)).toHaveLength(MAX_SENSES_TOTAL);
	});

	it("merges later entries into an existing part of speech until the per-POS cap", () => {
		const groups = capDefinitionSenses([
			{ partOfSpeech: "noun", definitions: [{ definition: "first" }] },
			{ partOfSpeech: "noun", definitions: [{ definition: "second" }, { definition: "third" }] },
		]);

		expect(groups).toEqual([
			{ partOfSpeech: "noun", senses: [{ definition: "first" }, { definition: "second" }] },
		]);
	});

	it("preserves the first example on kept senses without counting it toward the cap", () => {
		const groups = capDefinitionSenses([
			{
				partOfSpeech: "noun",
				definitions: [
					{ definition: "first", example: "ex1" },
					{ definition: "second", example: "ex2" },
					{ definition: "third", example: "ex3" },
				],
			},
		]);

		expect(groups).toEqual([
			{
				partOfSpeech: "noun",
				senses: [
					{ definition: "first", example: "ex1" },
					{ definition: "second", example: "ex2" },
				],
			},
		]);
		expect(groups[0]?.senses).toHaveLength(MAX_SENSES_PER_POS);
	});
});
