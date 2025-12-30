import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetCmudictCache, lookupCmudict } from "./cmudict";

vi.mock("@phonaria/phonetics-data", () => {
	const ipaMap: Record<string, string> = {
		HH: "h",
		AH0: "ə",
		L: "l",
		OW1: "oʊ",
		W: "w",
		ER1: "ɝ",
		D: "d",
	};

	return {
		getPhonemeIdForCmuArpa: (token: string) => token,
		getPhonemeCategory: (token: string) => (/[012]$/.test(token) ? "vowel" : "consonant"),
		getIpaForPhonemeId: (token: string) => ipaMap[token] ?? token.toLowerCase(),
	};
});

const mockRows = [
	{ word: "HELLO", cmuVariants: ["HH AH0 L OW1"] },
	{ word: "WORLD", cmuVariants: ["W ER1 L D"] },
] as const;

const dbSelectMock = vi.hoisted(() => vi.fn());

vi.mock("@/db/schema", () => ({
	words: {
		word: "word",
		cmuVariants: "cmu_variants",
	},
}));

vi.mock("@/db/drizzle", () => ({
	db: {
		select: dbSelectMock,
	},
}));

describe("CMUDict", () => {
	beforeEach(() => {
		__resetCmudictCache();

		dbSelectMock.mockReset();
		dbSelectMock.mockReturnValue({
			from: () => ({
				where: () => Promise.resolve(mockRows),
			}),
		});
	});

	it("should lookup words correctly after loading", async () => {
		const result = await lookupCmudict("hello");
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
				syllable.phonemes.flatMap((p) => ("ipa" in p ? [p.ipa] : [])),
			);
			expect(ipaSymbols).toContain("h");
			expect(ipaSymbols).toContain("ə");
			expect(ipaSymbols).toContain("l");
			expect(ipaSymbols).toContain("oʊ");
		}
	});

	it("should return undefined for unknown words", async () => {
		// Override mock to return nothing (no matching rows)
		dbSelectMock.mockReturnValueOnce({
			from: () => ({
				where: () => Promise.resolve([]),
			}),
		});

		const result = await lookupCmudict("unknownword");
		expect(result).toBeUndefined();
	});

	it("should not re-query for repeated misses (caches undefined results)", async () => {
		dbSelectMock.mockReturnValueOnce({
			from: () => ({
				where: () => Promise.resolve([]),
			}),
		});

		const first = await lookupCmudict("nope");
		const second = await lookupCmudict("nope");

		expect(first).toBeUndefined();
		expect(second).toBeUndefined();
		expect(dbSelectMock).toHaveBeenCalledTimes(1);
	});
});
