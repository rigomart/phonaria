import { describe, expect, it } from "vitest";
import { batchLookup } from "./index";
import { loadTier2, lookupTier1, lookupTier2 } from "./shared";

describe("tiered word resolution", () => {
	describe("tier 1 — top 1k words (bundled)", () => {
		it('resolves "the" from tier 1', async () => {
			const result = await batchLookup(["the"]);
			const word = result.found.get("the");
			expect(word).toBeDefined();
			expect(word?.source).toBe("tier1");
			expect(word?.cmuVariants).toContain("DH AX0");
		});

		it('resolves "about" from tier 1', async () => {
			const result = await batchLookup(["about"]);
			const word = result.found.get("about");
			expect(word).toBeDefined();
			expect(word?.source).toBe("tier1");
		});

		it("tier 1 words are never in the missing list", async () => {
			const result = await batchLookup(["the", "is", "have", "not"]);
			expect(result.missing).toHaveLength(0);
			expect(result.found.size).toBe(4);
			for (const [, word] of result.found) {
				expect(word.source).toBe("tier1");
			}
		});
	});

	describe("tier 2 — top 10k words (lazy-loaded)", () => {
		it('resolves "despite" from tier 2 (not in tier 1)', async () => {
			// Verify it's not in tier 1
			expect(lookupTier1("despite")).toBeNull();

			const result = await batchLookup(["despite"]);
			const word = result.found.get("despite");
			expect(word).toBeDefined();
			expect(word?.source).toBe("tier2");
			expect(word?.cmuVariants).toContain("D IX0 S P AI1 T");
		});

		it('resolves "kitchen" from tier 2 (not in tier 1)', async () => {
			expect(lookupTier1("kitchen")).toBeNull();

			const result = await batchLookup(["kitchen"]);
			const word = result.found.get("kitchen");
			expect(word).toBeDefined();
			expect(word?.source).toBe("tier2");
		});

		it('resolves "opportunity" from tier 2 (not in tier 1)', async () => {
			expect(lookupTier1("opportunity")).toBeNull();

			const result = await batchLookup(["opportunity"]);
			const word = result.found.get("opportunity");
			expect(word).toBeDefined();
			expect(word?.source).toBe("tier2");
		});
	});

	describe("tier 3 — words beyond top 10k", () => {
		it('reports "aardvark" as missing (not in tier 1 or 2)', async () => {
			expect(lookupTier1("aardvark")).toBeNull();
			const tier2Data = await loadTier2();
			expect(lookupTier2(tier2Data, "aardvark")).toBeNull();

			const result = await batchLookup(["aardvark"]);
			expect(result.found.has("aardvark")).toBe(false);
			expect(result.missing).toContain("aardvark");
		});

		it('reports "quintessential" as missing', async () => {
			const result = await batchLookup(["quintessential"]);
			expect(result.found.has("quintessential")).toBe(false);
			expect(result.missing).toContain("quintessential");
		});
	});

	describe("mixed input across tiers", () => {
		it("correctly routes words to their respective tiers", async () => {
			const result = await batchLookup([
				"the", // tier 1
				"despite", // tier 2
				"aardvark", // missing → tier 3
			]);

			expect(result.found.get("the")?.source).toBe("tier1");
			expect(result.found.get("despite")?.source).toBe("tier2");
			expect(result.missing).toContain("aardvark");
		});

		it("produces syllabified variants for found words", async () => {
			const result = await batchLookup(["the", "despite"]);

			const theWord = result.found.get("the");
			expect(theWord?.variants.length).toBeGreaterThan(0);
			expect(theWord?.variants[0].length).toBeGreaterThan(0);
			expect(theWord?.variants[0][0].phonemes.length).toBeGreaterThan(0);

			const despiteWord = result.found.get("despite");
			expect(despiteWord?.variants.length).toBeGreaterThan(0);
		});
	});
});
