import { beforeEach, describe, expect, it, vi } from "vitest";

// Partial mock for @phonaria/phonetics-data - override only curated data
vi.mock("@phonaria/phonetics-data", async () => {
	const actual = await vi.importActual<typeof import("@phonaria/phonetics-data")>(
		"@phonaria/phonetics-data",
	);
	return {
		...actual,
		curatedTop1k: {
			meta: { tier: "1k", wordCount: 3 },
			words: {
				the: "DH AH0",
				hello: "HH AH0 L OW1",
				world: "W ER1 L D",
			},
		},
		curatedTop10k: {
			meta: { tier: "10k", wordCount: 5 },
			words: {
				// Tier 2 includes tier 1 words plus additional
				the: "DH AH0",
				hello: "HH AH0 L OW1",
				world: "W ER1 L D",
				phonetics: "F AH0 N EH1 T IH0 K S",
				transcription: "T R AE2 N S K R IH1 P SH AH0 N",
			},
		},
	};
});

// Import after mock setup
import { batchLookup, lookupWordClient } from "./index";

describe("phoneme-lookup", () => {
	// Reset module state between tests
	beforeEach(() => {
		vi.resetModules();
	});

	describe("lookupWordClient", () => {
		it("returns tier1 result for common words", async () => {
			const result = await lookupWordClient("hello");

			expect(result).not.toBeNull();
			expect(result?.source).toBe("tier1");
			expect(result?.word).toBe("hello");
			expect(result?.cmu).toBe("HH AH0 L OW1");
			expect(result?.syllables.length).toBeGreaterThan(0);
		});

		it("returns tier2 result for less common words", async () => {
			const result = await lookupWordClient("phonetics");

			expect(result).not.toBeNull();
			expect(result?.source).toBe("tier2");
			expect(result?.word).toBe("phonetics");
			expect(result?.cmu).toBe("F AH0 N EH1 T IH0 K S");
		});

		it("returns null for unknown words", async () => {
			const result = await lookupWordClient("xyznonword");
			expect(result).toBeNull();
		});

		it("normalizes input to lowercase", async () => {
			const result = await lookupWordClient("HELLO");

			expect(result).not.toBeNull();
			expect(result?.word).toBe("hello");
			expect(result?.source).toBe("tier1");
		});

		it("returns null for empty input", async () => {
			const result = await lookupWordClient("");
			expect(result).toBeNull();
		});

		it("returns null for whitespace-only input", async () => {
			const result = await lookupWordClient("   ");
			expect(result).toBeNull();
		});

		it("includes syllabified data", async () => {
			const result = await lookupWordClient("hello");

			expect(result?.syllables).toBeDefined();
			expect(result?.syllables.length).toBe(2); // hel-lo
		});
	});

	describe("batchLookup", () => {
		it("returns found words with correct tier sources", async () => {
			const result = await batchLookup(["hello", "phonetics"]);

			expect(result.found.size).toBe(2);
			expect(result.missing).toHaveLength(0);

			const helloResult = result.found.get("hello");
			expect(helloResult?.source).toBe("tier1");

			const phoneticsResult = result.found.get("phonetics");
			expect(phoneticsResult?.source).toBe("tier2");
		});

		it("separates found and missing words correctly", async () => {
			const result = await batchLookup(["hello", "xyznonword", "world"]);

			expect(result.found.size).toBe(2);
			expect(result.found.has("hello")).toBe(true);
			expect(result.found.has("world")).toBe(true);
			expect(result.missing).toEqual(["xyznonword"]);
		});

		it("handles duplicate words efficiently", async () => {
			const result = await batchLookup(["hello", "HELLO", "Hello"]);

			// Should only have one entry for normalized "hello"
			expect(result.found.size).toBe(1);
			expect(result.found.has("hello")).toBe(true);
			expect(result.missing).toHaveLength(0);
		});

		it("preserves original casing in missing list", async () => {
			const result = await batchLookup(["UnknownWord"]);

			expect(result.missing).toEqual(["UnknownWord"]);
		});

		it("handles empty input", async () => {
			const result = await batchLookup([]);

			expect(result.found.size).toBe(0);
			expect(result.missing).toHaveLength(0);
		});

		it("skips empty strings in input", async () => {
			const result = await batchLookup(["hello", "", "  ", "world"]);

			expect(result.found.size).toBe(2);
			expect(result.missing).toHaveLength(0);
		});

		it("includes syllabified data for found words", async () => {
			const result = await batchLookup(["hello"]);

			const helloResult = result.found.get("hello");
			expect(helloResult?.syllables).toBeDefined();
			expect(helloResult?.syllables.length).toBeGreaterThan(0);
		});

		it("prioritizes tier1 over tier2 for words in both", async () => {
			// "the" is in both tier1 and tier2
			const result = await batchLookup(["the"]);

			const theResult = result.found.get("the");
			expect(theResult?.source).toBe("tier1");
		});

		it("handles mixed tier1, tier2, and missing words", async () => {
			const result = await batchLookup(["hello", "phonetics", "unknownword"]);

			expect(result.found.size).toBe(2);
			expect(result.found.get("hello")?.source).toBe("tier1");
			expect(result.found.get("phonetics")?.source).toBe("tier2");
			expect(result.missing).toEqual(["unknownword"]);
		});
	});
});
