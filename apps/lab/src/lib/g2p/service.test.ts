import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db/drizzle", () => ({
	getDb: vi.fn(),
}));

vi.mock("@/db/schema", () => ({
	words: { word: "word", pronunciations: "pronunciations" },
}));

// Must import after mocks are set up
const { getDb } = await import("@/db/drizzle");
const { processWords } = await import("./service");
const { __resetCmudictCache, lookupManyCmudict } = await import("./cmudict");

function mockDbResults(rows: { word: string; pronunciations: string }[]) {
	const chain = {
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockResolvedValue(rows),
	};
	const select = vi.fn().mockReturnValue(chain);
	vi.mocked(getDb).mockReturnValue({ select } as never);
	return { select };
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

	it("attaches one-slip dictionary neighbours on a fallback word", async () => {
		const chain = {
			from: vi.fn().mockReturnThis(),
			where: vi
				.fn()
				.mockResolvedValueOnce([])
				.mockResolvedValue([
					{
						word: "RECEIVE",
						pronunciations: JSON.stringify(["R IH0 S IY1 V"]),
					},
				]),
		};
		const select = vi.fn().mockReturnValue(chain);
		vi.mocked(getDb).mockReturnValue({ select } as never);

		const result = await processWords(["recieve"]);

		expect(result[0]?.source).toBe("fallback");
		expect(result[0]?.spellingNeighbours).toContain("receive");
	});

	it("returns empty array for empty input", async () => {
		const result = await processWords([]);
		expect(result).toEqual([]);
		expect(getDb).not.toHaveBeenCalled();
	});

	it("evicts the least-recently-used negative lookup after 5,000 entries", async () => {
		const { select } = mockDbResults([]);

		for (let batch = 0; batch < 25; batch += 1) {
			const words = Array.from({ length: 200 }, (_, index) => `missing-${batch * 200 + index}`);
			await lookupManyCmudict(words);
		}

		await lookupManyCmudict(["missing-0"]);
		expect(select).toHaveBeenCalledTimes(25);

		await lookupManyCmudict(["overflow"]);
		expect(select).toHaveBeenCalledTimes(26);

		await lookupManyCmudict(["missing-1"]);
		expect(select).toHaveBeenCalledTimes(27);

		await lookupManyCmudict(["missing-0"]);
		expect(select).toHaveBeenCalledTimes(27);
	});
});
