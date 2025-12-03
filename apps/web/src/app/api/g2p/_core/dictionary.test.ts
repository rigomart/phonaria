import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmudict } from "./dictionary";

vi.mock("shared-data", () => ({
	cmudictData: {
		meta: {
			formatVersion: 1,
			source: "cmudict",
			sourceUrl: "https://example.com/cmudict.dict",
			generatedAt: "2025-01-09T12:00:00.000Z",
			wordCount: 2,
			variantCount: 3,
			skippedLineCount: 0,
			deduplicatedVariantCount: 0,
		},
		data: {
			HELLO: ["HH AH0 L OW1"],
			WORLD: ["W ER1 L D"],
		},
	},
}));

const mockCmudictData = {
	meta: {
		formatVersion: 1,
		source: "cmudict",
		sourceUrl: "https://example.com/cmudict.dict",
		generatedAt: "2025-01-09T12:00:00.000Z",
		wordCount: 2,
		variantCount: 3,
		skippedLineCount: 0,
		deduplicatedVariantCount: 0,
	},
	data: {
		HELLO: ["HH AH0 L OW1"],
		WORLD: ["W ER1 L D"],
	},
};

describe("CMUDict", () => {
	beforeEach(() => {
		// Reset the cmudict instance before each test
		const cmudictInstance = cmudict as unknown as {
			data: Record<string, string[]> | null;
			loaded: boolean;
			loadPromise: Promise<void> | null;
			cache: Map<string, string[][]>;
		};
		cmudictInstance.data = null;
		cmudictInstance.loaded = false;
		cmudictInstance.loadPromise = null;
		cmudictInstance.cache.clear();
	});

	it("should load dictionary data from payload.data property", async () => {
		await cmudict.load();

		// Verify that the data was loaded from the correct property
		const cmudictInstance = cmudict as unknown as {
			data: Record<string, string[]> | null;
			loaded: boolean;
		};
		expect(cmudictInstance.data).toEqual(mockCmudictData.data);
		expect(cmudictInstance.loaded).toBe(true);
	});

	it("should lookup words correctly after loading", async () => {
		await cmudict.load();

		const result = cmudict.lookup("hello");
		expect(result).toBeDefined();
		expect(Array.isArray(result)).toBe(true);
		if (result) {
			// Result is an array of variants, each variant is an array of syllables
			expect(result.length).toBeGreaterThan(0);
			const firstVariant = result[0];
			expect(Array.isArray(firstVariant)).toBe(true);
			expect(firstVariant.length).toBeGreaterThan(0);
			
			// Check that syllables have the expected structure
			const firstSyllable = firstVariant[0];
			expect(firstSyllable).toHaveProperty("phonemes");
			expect(firstSyllable).toHaveProperty("stress");
			expect(Array.isArray(firstSyllable.phonemes)).toBe(true);
			
			// Verify IPA symbols are present
			const ipaSymbols = firstVariant.flatMap((syllable) =>
				syllable.phonemes.map((p) => p.ipa)
			);
			expect(ipaSymbols).toContain("h");
			expect(ipaSymbols).toContain("ə");
			expect(ipaSymbols).toContain("l");
			expect(ipaSymbols).toContain("oʊ");
		}
	});

	it("should return undefined for unknown words", async () => {
		await cmudict.load();

		const result = cmudict.lookup("unknownword");
		expect(result).toBeUndefined();
	});

	it("should throw error when lookup called before load", () => {
		expect(() => cmudict.lookup("hello")).toThrow("Dictionary not loaded");
	});
});
