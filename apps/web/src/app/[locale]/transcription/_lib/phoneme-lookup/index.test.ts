import { describe, expect, it, vi } from "vitest";

// Mock subpath modules with test data using new phoneme ID format (H, AX, OU instead of HH, AH, OW)
vi.mock("@phonaria/phonetics-data/data/en/curated-1k", () => ({
	EnglishCuratedTop1k: {
		meta: { tier: "1k", wordCount: 3 },
		words: {
			// "the" has multiple variants (phoneme ID format)
			the: ["DH AX0", "DH AH1", "DH I0"],
			hello: ["H AX0 L OU1"],
			world: ["W ER1 L D"],
		},
	},
}));

vi.mock("@phonaria/phonetics-data/data/en/curated-10k", () => ({
	EnglishCuratedTop10k: {
		meta: { tier: "10k", wordCount: 5 },
		words: {
			// Tier 2 includes tier 1 words plus additional (phoneme ID format)
			the: ["DH AX0", "DH AH1", "DH I0"],
			hello: ["H AX0 L OU1"],
			world: ["W ER1 L D"],
			phonetics: ["F AX0 N E1 T IX0 K S"],
			transcription: ["T R AE2 N S K R IX1 P SH AX0 N"],
		},
	},
}));

// Import after mock setup
import { batchLookup, lookupWordClient } from "./index";

describe("phoneme-lookup", () => {
	describe("lookupWordClient", () => {
		it("returns tier1 result for common words", async () => {
			const result = await lookupWordClient("hello");

			expect(result).not.toBeNull();
			expect(result?.source).toBe("tier1");
			expect(result?.word).toBe("hello");
			expect(result?.cmuVariants).toEqual(["H AX0 L OU1"]);
			expect(result?.variants.length).toBeGreaterThan(0);
		});

		it("returns tier2 result for less common words", async () => {
			const result = await lookupWordClient("phonetics");

			expect(result).not.toBeNull();
			expect(result?.source).toBe("tier2");
			expect(result?.word).toBe("phonetics");
			expect(result?.cmuVariants).toEqual(["F AX0 N E1 T IX0 K S"]);
		});

		it("returns multiple variants for words with alternate pronunciations", async () => {
			const result = await lookupWordClient("the");

			expect(result).not.toBeNull();
			expect(result?.cmuVariants).toHaveLength(3);
			expect(result?.cmuVariants).toContain("DH AX0");
			expect(result?.cmuVariants).toContain("DH I0");
			expect(result?.variants).toHaveLength(3);
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

		it("includes syllabified data for all variants", async () => {
			const result = await lookupWordClient("hello");

			expect(result?.variants).toBeDefined();
			expect(result?.variants).toHaveLength(1); // "hello" has one variant
			expect(result?.variants[0].length).toBe(2); // hel-lo (2 syllables)
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

		it("includes syllabified variants for found words", async () => {
			const result = await batchLookup(["hello"]);

			const helloResult = result.found.get("hello");
			expect(helloResult?.variants).toBeDefined();
			expect(helloResult?.variants.length).toBeGreaterThan(0);
			expect(helloResult?.variants[0].length).toBe(2); // hel-lo
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

		it("returns all variants for words with multiple pronunciations", async () => {
			const result = await batchLookup(["the"]);

			const theResult = result.found.get("the");
			expect(theResult?.cmuVariants).toHaveLength(3);
			expect(theResult?.variants).toHaveLength(3);
		});
	});
});
