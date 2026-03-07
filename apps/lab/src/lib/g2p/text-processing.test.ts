import { describe, expect, it } from "vitest";
import { normalizeCmuWord, tokenizeText } from "./text-processing";

describe("tokenizeText", () => {
	it("returns empty array for empty string", () => {
		expect(tokenizeText("")).toEqual([]);
	});

	it("returns empty array for whitespace-only input", () => {
		expect(tokenizeText("   ")).toEqual([]);
	});

	it("splits on whitespace", () => {
		expect(tokenizeText("hello world")).toEqual(["hello", "world"]);
	});

	it("strips punctuation", () => {
		expect(tokenizeText("hello, world!")).toEqual(["hello", "world"]);
	});

	it("handles multiple spaces", () => {
		expect(tokenizeText("hello   world")).toEqual(["hello", "world"]);
	});

	it("preserves apostrophes", () => {
		expect(tokenizeText("don't")).toEqual(["don't"]);
	});

	it("preserves hyphens", () => {
		expect(tokenizeText("well-known")).toEqual(["well-known"]);
	});

	it("strips surrounding punctuation but preserves internal", () => {
		expect(tokenizeText('"hello" world.')).toEqual(["hello", "world"]);
	});
});

describe("normalizeCmuWord", () => {
	it("converts to uppercase", () => {
		expect(normalizeCmuWord("hello")).toBe("HELLO");
	});

	it("trims whitespace", () => {
		expect(normalizeCmuWord("  hello  ")).toBe("HELLO");
	});

	it("strips variant suffix (1)", () => {
		expect(normalizeCmuWord("THE(1)")).toBe("THE");
	});

	it("strips variant suffix (2)", () => {
		expect(normalizeCmuWord("the(2)")).toBe("THE");
	});

	it("does not strip non-variant parentheses", () => {
		expect(normalizeCmuWord("HELLO")).toBe("HELLO");
	});
});
