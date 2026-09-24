import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { resolveTestDatabaseConfig } from "@/db/config";
import { createDatabase } from "@/db/drizzle";
import { words } from "@/db/schema";
import { __resetCmudictCache } from "@/lib/g2p/cmudict";
import { processWords } from "@/lib/g2p/service";
import { MAX_TRANSCRIPTION_WORDS } from "./contract";
import { transcribeWords } from "./service";

const testConfig = resolveTestDatabaseConfig();
const describeIntegration = testConfig ? describe : describe.skip;

describe("resolveTestDatabaseConfig", () => {
	it("never uses production Turso credentials as test config", () => {
		expect(
			resolveTestDatabaseConfig({
				TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
				TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
			}),
		).toBeNull();
	});
});

describeIntegration("transcription Turso integration (read-only)", () => {
	if (!testConfig) {
		return;
	}

	const db = createDatabase(testConfig, { readOnly: true });

	beforeEach(() => {
		__resetCmudictCache();
	});

	async function transcribe(wordsInput: string[]) {
		return transcribeWords(
			{ words: wordsInput },
			{ processWords: (input) => processWords(input, { db }) },
		);
	}

	it("returns a dictionary pronunciation for a known word", async () => {
		const result = await transcribe(["aardvark"]);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.words).toHaveLength(1);
			expect(result.words[0]?.word).toBe("aardvark");
			expect(result.words[0]?.source).toBe("cmudict");
			expect(result.words[0]?.variants[0]?.length).toBeGreaterThan(0);
		}
	});

	it("uses fallback lookup for a missing word", async () => {
		const result = await transcribe(["zxqvwoplmj"]);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.words[0]?.source).toBe("fallback");
			expect(result.words[0]?.word).toBe("zxqvwoplmj");
		}
	});

	it("handles mixed known and missing words", async () => {
		const result = await transcribe(["aardvark", "zxqvwoplmj"]);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.words.map((word) => word.source)).toEqual(["cmudict", "fallback"]);
		}
	});

	it("rejects the 200-word limit without querying Turso", async () => {
		const payload = Array.from({ length: MAX_TRANSCRIPTION_WORDS + 1 }, (_, i) => `w${i}`);
		const result = await transcribe(payload);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("validation");
		}
	});

	it("rejects malformed input", async () => {
		const result = await transcribeWords(
			{ words: [""] },
			{ processWords: (input) => processWords(input, { db }) },
		);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("validation");
		}
	});

	it("cannot mutate the database through the read-only client", async () => {
		await expect(
			db.insert(words).values({
				word: "SHOULD_NOT_WRITE",
				pronunciations: "[]",
			}),
		).rejects.toSatisfy((error: unknown) => {
			if (!(error instanceof Error)) {
				return false;
			}
			const cause = error.cause instanceof Error ? error.cause.message : "";
			return /read-only/i.test(error.message) || /read-only/i.test(cause);
		});

		const leftover = await db
			.select({ word: words.word })
			.from(words)
			.where(eq(words.word, "SHOULD_NOT_WRITE"));
		expect(leftover).toEqual([]);
	});
});
