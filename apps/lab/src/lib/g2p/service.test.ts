import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db/drizzle", () => ({
	db: {
		select: vi.fn(),
	},
}));

vi.mock("@/db/schema", () => ({
	words: { word: "word", pronunciations: "pronunciations" },
}));

// Must import after mocks are set up
const { db } = await import("@/db/drizzle");
const { processWords } = await import("./service");
const { __resetCmudictCache } = await import("./cmudict");

function mockDbResults(rows: { word: string; pronunciations: string }[]) {
	const chain = {
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockResolvedValue(rows),
	};
	(db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);
}

describe("processWords (tier 3 — DB lookup)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		__resetCmudictCache();
	});

	it('returns source "cmudict" for words found in DB', async () => {
		mockDbResults([
			{
				word: "AARDVARK",
				pronunciations: JSON.stringify(["AA1 R D V AA2 R K"]),
			},
		]);

		const result = await processWords(["aardvark"]);

		expect(result).toHaveLength(1);
		expect(result[0].word).toBe("aardvark");
		expect(result[0].source).toBe("cmudict");
		expect(result[0].variants.length).toBeGreaterThan(0);
		// Verify syllabification happened (has phonemes with IPA)
		const firstVariant = result[0].variants[0];
		expect(firstVariant.length).toBeGreaterThan(0);
		expect(firstVariant[0].phonemes.length).toBeGreaterThan(0);
	});

	it("handles multiple pronunciation variants from DB", async () => {
		mockDbResults([
			{
				word: "LIVE",
				pronunciations: JSON.stringify(["L IH1 V", "L AY1 V"]),
			},
		]);

		const result = await processWords(["live"]);

		expect(result).toHaveLength(1);
		expect(result[0].variants).toHaveLength(2);
	});

	it('returns source "fallback" for words not in DB', async () => {
		mockDbResults([]);

		const result = await processWords(["xyzqwk"]);

		expect(result).toHaveLength(1);
		expect(result[0].word).toBe("xyzqwk");
		expect(result[0].source).toBe("fallback");
	});

	it("handles mixed DB hits and misses", async () => {
		mockDbResults([
			{
				word: "AARDVARK",
				pronunciations: JSON.stringify(["AA1 R D V AA2 R K"]),
			},
		]);

		const result = await processWords(["aardvark", "zzznotaword"]);

		expect(result).toHaveLength(2);
		expect(result[0].source).toBe("cmudict");
		expect(result[1].source).toBe("fallback");
	});

	it("returns empty array for empty input", async () => {
		const result = await processWords([]);
		expect(result).toEqual([]);
	});
});
