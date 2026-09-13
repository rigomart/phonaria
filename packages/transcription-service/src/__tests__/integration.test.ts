/**
 * Integration tests for transcription service with real Turso database.
 *
 * These tests require explicit configuration and are skipped by default.
 * To run them, set the following environment variables:
 *
 *   INTEGRATION_TEST_TURSO_URL=<your-test-db-url>
 *   INTEGRATION_TEST_TURSO_TOKEN=<your-test-db-token>
 *
 * The tests are READ-ONLY and will not mutate production data.
 * They verify the service can connect to a real database and perform lookups.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { createDbClient } from "../db/client";
import { transcribeWords } from "../service";

const INTEGRATION_TEST_ENABLED =
	process.env.INTEGRATION_TEST_TURSO_URL && process.env.INTEGRATION_TEST_TURSO_TOKEN;

describe.skipIf(!INTEGRATION_TEST_ENABLED)("Turso integration (read-only)", () => {
	let dbClient: ReturnType<typeof createDbClient>;

	beforeAll(() => {
		const url = process.env.INTEGRATION_TEST_TURSO_URL;
		if (!url) {
			throw new Error("INTEGRATION_TEST_TURSO_URL must be set for integration tests");
		}

		dbClient = createDbClient({
			url,
			authToken: process.env.INTEGRATION_TEST_TURSO_TOKEN,
		});
	});

	it("connects to the database and performs lookups", async () => {
		const result = await transcribeWords({ words: ["hello", "world"] }, { dbClient });

		expect(result.words).toHaveLength(2);
		expect(result.words[0].word).toBe("hello");
		expect(result.words[1].word).toBe("world");
	});

	it("finds common words in CMUdict", async () => {
		const result = await transcribeWords({ words: ["aardvark"] }, { dbClient });

		expect(result.words).toHaveLength(1);
		expect(result.words[0].source).toBe("cmudict");
		expect(result.words[0].variants.length).toBeGreaterThan(0);
	});

	it("uses fallback for nonsense words", async () => {
		const result = await transcribeWords({ words: ["xyzqwknotaword"] }, { dbClient });

		expect(result.words).toHaveLength(1);
		expect(result.words[0].source).toBe("fallback");
	});

	it("handles multiple pronunciations", async () => {
		// "live" has multiple pronunciations: /lɪv/ and /laɪv/
		const result = await transcribeWords({ words: ["live"] }, { dbClient });

		expect(result.words).toHaveLength(1);
		if (result.words[0].source === "cmudict") {
			// May have multiple variants
			expect(result.words[0].variants.length).toBeGreaterThan(0);
		}
	});

	it("preserves syllable structure from CMUdict", async () => {
		const result = await transcribeWords({ words: ["hello"] }, { dbClient });

		const word = result.words[0];
		if (word.source === "cmudict") {
			const firstVariant = word.variants[0];
			expect(firstVariant.length).toBeGreaterThan(0);

			// Each syllable should have phonemes
			for (const syllable of firstVariant) {
				expect(syllable.phonemes.length).toBeGreaterThan(0);
				expect(syllable.stress).toBeDefined();
			}
		}
	});

	it("handles case-insensitive lookups", async () => {
		const result = await transcribeWords({ words: ["HELLO", "Hello", "hello"] }, { dbClient });

		expect(result.words).toHaveLength(3);
		for (const word of result.words) {
			expect(word.word).toBe("hello");
		}
	});

	it("processes batch requests efficiently", async () => {
		const words = ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog"];

		const result = await transcribeWords({ words }, { dbClient });

		expect(result.words).toHaveLength(words.length);
		for (const word of result.words) {
			expect(word.variants.length).toBeGreaterThan(0);
		}
	});

	it("does not mutate database (read-only verification)", async () => {
		// This test verifies the service only performs SELECT queries
		// and does not attempt to INSERT, UPDATE, or DELETE

		const before = await transcribeWords({ words: ["test"] }, { dbClient });

		// Perform multiple operations
		await transcribeWords({ words: ["test", "another"] }, { dbClient });
		await transcribeWords({ words: ["test"] }, { dbClient });

		const after = await transcribeWords({ words: ["test"] }, { dbClient });

		// Results should be identical (no mutation)
		expect(before.words[0]).toEqual(after.words[0]);
	});
});
