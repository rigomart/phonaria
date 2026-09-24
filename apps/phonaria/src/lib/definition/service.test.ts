import { describe, expect, it, vi } from "vitest";
import { buildDictionaryLookupUrl, lookupDefinition, wiktionaryLookupHeaders } from "./service";

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

const helloPayload = {
	en: [
		{
			language: "English",
			partOfSpeech: "Interjection",
			definitions: [
				{
					definition: 'A <a href="/wiki/greeting">greeting</a>.',
					parsedExamples: [{ example: "<b>Hello</b>, everyone." }],
					examples: ["Hello, everyone."],
				},
				{ definition: "A greeting used when answering the telephone." },
			],
		},
		{
			language: "English",
			partOfSpeech: "Noun",
			definitions: [{ definition: "The act of saying hello." }],
		},
	],
};

describe("lookupDefinition", () => {
	it("returns capped senses from the Wiktionary REST payload", async () => {
		const fetchFn = vi.fn(async () => jsonResponse(helloPayload));

		const result = await lookupDefinition({ word: "Hello" }, { fetch: fetchFn });

		expect(result).toEqual({
			ok: true,
			result: {
				found: true,
				word: "hello",
				groups: [
					{
						partOfSpeech: "Interjection",
						senses: [
							{ definition: "A greeting.", example: "Hello, everyone." },
							{ definition: "A greeting used when answering the telephone." },
						],
					},
					{ partOfSpeech: "Noun", senses: [{ definition: "The act of saying hello." }] },
				],
			},
		});
		expect(fetchFn).toHaveBeenCalledWith(
			buildDictionaryLookupUrl("hello"),
			expect.objectContaining({
				method: "GET",
				headers: wiktionaryLookupHeaders(),
			}),
		);
	});

	it("deduplicates normalized senses before applying display caps", async () => {
		const fetchFn = vi.fn(async () =>
			jsonResponse({
				en: [
					{
						language: "English",
						partOfSpeech: "Noun",
						definitions: [
							{ definition: "A <b>first</b> sense." },
							{ definition: "A first sense." },
							{ definition: "A second sense." },
						],
					},
				],
			}),
		);

		const result = await lookupDefinition({ word: "example" }, { fetch: fetchFn });

		expect(result).toEqual({
			ok: true,
			result: {
				found: true,
				word: "example",
				groups: [
					{
						partOfSpeech: "Noun",
						senses: [{ definition: "A first sense." }, { definition: "A second sense." }],
					},
				],
			},
		});
	});

	it("normalizes punctuation before calling the API", async () => {
		const fetchFn = vi.fn(async () => jsonResponse({ status: 404 }, 404));

		await lookupDefinition({ word: '"Hello,"' }, { fetch: fetchFn });

		expect(fetchFn).toHaveBeenCalledWith(buildDictionaryLookupUrl("hello"), expect.any(Object));
	});

	it("returns not found for a 404 without treating it as a failure", async () => {
		const fetchFn = vi.fn(async () => jsonResponse({ status: 404, type: "Internal error" }, 404));

		const result = await lookupDefinition({ word: "zxqvwoplmj" }, { fetch: fetchFn });

		expect(result).toEqual({ ok: true, result: { found: false } });
	});

	it("returns not found when English senses are missing", async () => {
		const fetchFn = vi.fn(async () => jsonResponse({ fr: [] }));

		const result = await lookupDefinition({ word: "bonjour" }, { fetch: fetchFn });

		expect(result).toEqual({ ok: true, result: { found: false } });
	});

	it("returns not found for punctuation-only input without calling the API", async () => {
		const fetchFn = vi.fn(async () => jsonResponse({}));

		const result = await lookupDefinition({ word: "..." }, { fetch: fetchFn });

		expect(result).toEqual({ ok: true, result: { found: false } });
		expect(fetchFn).not.toHaveBeenCalled();
	});

	it("maps a network failure to a retryable error", async () => {
		const fetchFn = vi.fn(async () => {
			throw new Error("fetch failed");
		});

		const result = await lookupDefinition({ word: "hello" }, { fetch: fetchFn });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("retryable");
			expect(result.error.retryable).toBe(true);
		}
	});

	it("maps a non-404 HTTP failure to a retryable error", async () => {
		const fetchFn = vi.fn(async () => jsonResponse({ error: "upstream" }, 503));

		const result = await lookupDefinition({ word: "hello" }, { fetch: fetchFn });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("retryable");
		}
	});

	it("rejects invalid input without calling the API", async () => {
		const fetchFn = vi.fn(async () => jsonResponse({}));

		const result = await lookupDefinition({ word: "" }, { fetch: fetchFn });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("validation");
			expect(result.error.retryable).toBe(false);
		}
		expect(fetchFn).not.toHaveBeenCalled();
	});
});

describe("buildDictionaryLookupUrl", () => {
	it("encodes the path segment", () => {
		expect(buildDictionaryLookupUrl("don't")).toBe(
			`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent("don't")}`,
		);
		expect(buildDictionaryLookupUrl("well-known")).toBe(
			"https://en.wiktionary.org/api/rest_v1/page/definition/well-known",
		);
	});
});
