import { describe, expect, it, vi } from "vitest";
import { buildDictionaryLookupUrl, lookupDefinition } from "./service";

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("lookupDefinition", () => {
	it("returns capped senses from the Free Dictionary API payload", async () => {
		const fetchFn = vi.fn(async () =>
			jsonResponse([
				{
					word: "hello",
					meanings: [
						{
							partOfSpeech: "noun",
							definitions: [{ definition: "a greeting" }, { definition: "an act of greeting" }],
						},
						{
							partOfSpeech: "verb",
							definitions: [{ definition: "to greet" }],
						},
					],
				},
			]),
		);

		const result = await lookupDefinition({ word: "Hello" }, { fetch: fetchFn });

		expect(result).toEqual({
			ok: true,
			result: {
				found: true,
				word: "hello",
				groups: [
					{ partOfSpeech: "noun", senses: ["a greeting", "an act of greeting"] },
					{ partOfSpeech: "verb", senses: ["to greet"] },
				],
			},
		});
		expect(fetchFn).toHaveBeenCalledWith(
			buildDictionaryLookupUrl("hello"),
			expect.objectContaining({ method: "GET" }),
		);
	});

	it("normalizes punctuation before calling the API", async () => {
		const fetchFn = vi.fn(async () => jsonResponse({ title: "No Definitions Found" }, 404));

		await lookupDefinition({ word: '"Hello,"' }, { fetch: fetchFn });

		expect(fetchFn).toHaveBeenCalledWith(buildDictionaryLookupUrl("hello"), expect.any(Object));
	});

	it("returns not found for a 404 without treating it as a failure", async () => {
		const fetchFn = vi.fn(async () => jsonResponse({ title: "No Definitions Found" }, 404));

		const result = await lookupDefinition({ word: "zxqvwoplmj" }, { fetch: fetchFn });

		expect(result).toEqual({ ok: true, result: { found: false } });
	});

	it("returns not found for punctuation-only input without calling the API", async () => {
		const fetchFn = vi.fn(async () => jsonResponse([]));

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
		const fetchFn = vi.fn(async () => jsonResponse([]));

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
			`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent("don't")}`,
		);
		expect(buildDictionaryLookupUrl("well-known")).toBe(
			"https://api.dictionaryapi.dev/api/v2/entries/en/well-known",
		);
	});
});
