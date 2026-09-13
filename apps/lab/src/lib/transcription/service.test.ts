import { describe, expect, it, vi } from "vitest";
import type { G2PWord } from "@/lib/g2p/model";
import { MAX_TRANSCRIPTION_WORDS } from "./contract";
import { transcribeWords } from "./service";

function word(value: string, source: G2PWord["source"] = "cmudict"): G2PWord {
	return {
		word: value,
		variants: [[{ phonemes: [{ cmuToken: "AH", phonemeId: null }], stress: "none" }]],
		source,
	};
}

describe("transcribeWords", () => {
	it("returns known words from the injected lookup", async () => {
		const processWords = vi.fn(async (words: string[]) => words.map((value) => word(value)));

		const result = await transcribeWords({ words: ["hello"] }, { processWords });

		expect(result).toEqual({ ok: true, words: [word("hello")] });
		expect(processWords).toHaveBeenCalledWith(["hello"]);
	});

	it("preserves fallback results for missing words", async () => {
		const processWords = vi.fn(async () => [word("zxqvwoplmj", "fallback")]);

		const result = await transcribeWords({ words: ["zxqvwoplmj"] }, { processWords });

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.words[0]?.source).toBe("fallback");
		}
	});

	it("rejects malformed input without calling the lookup", async () => {
		const processWords = vi.fn(async () => []);

		const result = await transcribeWords({ words: "hello" }, { processWords });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("validation");
			expect(result.error.retryable).toBe(false);
		}
		expect(processWords).not.toHaveBeenCalled();
	});

	it("rejects an empty word list", async () => {
		const result = await transcribeWords({ words: [] });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("validation");
		}
	});

	it("rejects more than 200 words", async () => {
		const processWords = vi.fn(async () => []);
		const words = Array.from({ length: MAX_TRANSCRIPTION_WORDS + 1 }, (_, i) => `w${i}`);

		const result = await transcribeWords({ words }, { processWords });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("validation");
		}
		expect(processWords).not.toHaveBeenCalled();
	});

	it("maps a database failure", async () => {
		const processWords = vi.fn(async () => {
			throw new Error("SQLITE_ERROR: no such table: words");
		});

		const result = await transcribeWords({ words: ["hello"] }, { processWords });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("database");
			expect(result.error.retryable).toBe(true);
			expect(result.error.message).toMatch(/SQLITE_ERROR/);
		}
	});

	it("maps a retryable transport failure", async () => {
		const processWords = vi.fn(async () => {
			throw new Error("fetch failed: network timeout");
		});

		const result = await transcribeWords({ words: ["hello"] }, { processWords });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("retryable");
			expect(result.error.retryable).toBe(true);
		}
	});

	it("does not construct a database client when only validation runs", async () => {
		const processWords = vi.fn(async () => {
			throw new Error("should not run");
		});

		await transcribeWords(null, { processWords });
		expect(processWords).not.toHaveBeenCalled();
	});
});
