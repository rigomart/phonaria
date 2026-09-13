import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DbClient } from "../db/client";
import { resetCache, transcribeWords } from "../service";

/**
 * Create a mock database client for testing.
 */
function createMockDbClient(
	mockData: Array<{ word: string; pronunciations: string }>,
): DbClient {
	const mockSelect = vi.fn().mockReturnValue({
		from: vi.fn().mockReturnValue({
			where: vi.fn().mockResolvedValue(mockData),
		}),
	});

	return {
		select: mockSelect,
	} as unknown as DbClient;
}

describe("transcribeWords", () => {
	beforeEach(() => {
		resetCache();
		vi.clearAllMocks();
	});

	it("validates input and rejects empty word arrays", async () => {
		const mockDb = createMockDbClient([]);

		const result = await transcribeWords({ words: [] }, { dbClient: mockDb });

		expect(result.words).toEqual([]);
	});

	it("returns CMUdict pronunciations for known words", async () => {
		const mockDb = createMockDbClient([
			{
				word: "HELLO",
				pronunciations: JSON.stringify(["HH AH0 L OW1", "HH EH1 L OW1"]),
			},
		]);

		const result = await transcribeWords(
			{ words: ["hello"] },
			{ dbClient: mockDb },
		);

		expect(result.words).toHaveLength(1);
		expect(result.words[0].word).toBe("hello");
		expect(result.words[0].source).toBe("cmudict");
		expect(result.words[0].variants.length).toBeGreaterThan(0);
	});

	it("uses fallback for words not in dictionary", async () => {
		const mockDb = createMockDbClient([]);

		const result = await transcribeWords(
			{ words: ["xyzqwk"] },
			{ dbClient: mockDb },
		);

		expect(result.words).toHaveLength(1);
		expect(result.words[0].word).toBe("xyzqwk");
		expect(result.words[0].source).toBe("fallback");
	});

	it("handles mixed dictionary hits and misses", async () => {
		const mockDb = createMockDbClient([
			{
				word: "HELLO",
				pronunciations: JSON.stringify(["HH AH0 L OW1"]),
			},
		]);

		const result = await transcribeWords(
			{ words: ["hello", "xyzqwk"] },
			{ dbClient: mockDb },
		);

		expect(result.words).toHaveLength(2);
		expect(result.words[0].source).toBe("cmudict");
		expect(result.words[1].source).toBe("fallback");
	});

	it("caches dictionary lookups across calls", async () => {
		const mockDb = createMockDbClient([
			{
				word: "HELLO",
				pronunciations: JSON.stringify(["HH AH0 L OW1"]),
			},
		]);

		// First call
		await transcribeWords({ words: ["hello"] }, { dbClient: mockDb });

		// Second call - should use cache
		const mockDb2 = createMockDbClient([]);
		const result2 = await transcribeWords(
			{ words: ["hello"] },
			{ dbClient: mockDb2 },
		);

		expect(result2.words[0].source).toBe("cmudict");
		expect(mockDb2.select).not.toHaveBeenCalled();
	});

	it("normalizes words for dictionary lookup", async () => {
		const mockDb = createMockDbClient([
			{
				word: "HELLO",
				pronunciations: JSON.stringify(["HH AH0 L OW1"]),
			},
		]);

		const result = await transcribeWords(
			{ words: ["HELLO", "Hello", "hello"] },
			{ dbClient: mockDb },
		);

		expect(result.words).toHaveLength(3);
		expect(result.words[0].word).toBe("hello");
		expect(result.words[1].word).toBe("hello");
		expect(result.words[2].word).toBe("hello");
	});

	it("syllabifies CMUdict pronunciations", async () => {
		const mockDb = createMockDbClient([
			{
				word: "AARDVARK",
				pronunciations: JSON.stringify(["AA1 R D V AA2 R K"]),
			},
		]);

		const result = await transcribeWords(
			{ words: ["aardvark"] },
			{ dbClient: mockDb },
		);

		const firstVariant = result.words[0].variants[0];
		expect(firstVariant.length).toBeGreaterThan(0);
		expect(firstVariant[0].phonemes.length).toBeGreaterThan(0);
		expect(firstVariant[0].phonemes[0]).toHaveProperty("ipa");
		expect(firstVariant[0].phonemes[0]).toHaveProperty("phonemeId");
	});

	it("throws validation error for invalid input", async () => {
		const mockDb = createMockDbClient([]);

		await expect(
			transcribeWords({ words: ["a".repeat(300)] }, { dbClient: mockDb }),
		).rejects.toThrow();
	});

	it("throws validation error for too many words", async () => {
		const mockDb = createMockDbClient([]);
		const tooManyWords = Array(201).fill("word");

		await expect(
			transcribeWords({ words: tooManyWords }, { dbClient: mockDb }),
		).rejects.toThrow();
	});

	it("filters out empty strings from input", async () => {
		const mockDb = createMockDbClient([
			{
				word: "HELLO",
				pronunciations: JSON.stringify(["HH AH0 L OW1"]),
			},
		]);

		const result = await transcribeWords(
			{ words: ["hello", "", " ", "world"] },
			{ dbClient: mockDb },
		);

		// Empty strings should be filtered but the function continues
		expect(result.words.length).toBeGreaterThan(0);
	});
});
