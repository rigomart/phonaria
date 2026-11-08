import { describe, expect, it, vi } from "vitest";
import type { G2PWord } from "@/lib/g2p/model";
import { MAX_TRANSCRIPTION_WORDS } from "./contract";
import {
	TRANSCRIPTION_DATABASE_MESSAGE,
	TRANSCRIPTION_RETRYABLE_MESSAGE,
	transcribeWords,
} from "./service";

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
			expect(result.error.message).toBe(TRANSCRIPTION_DATABASE_MESSAGE);
			expect(result.reason).toBe("Error: SQLITE_ERROR: no such table: words");
		}
	});

	it("keeps the query and the learner's words out of the error and its reason", async () => {
		const processWords = vi.fn(async () => {
			const cause = Object.assign(new Error("SQLITE_ERROR: no such table: words"), {
				code: "SQLITE_ERROR",
			});
			throw Object.assign(
				new Error('Failed query: select "word" from "words" where "word" in (?)\nparams: AARDVARK'),
				{ query: 'select "word" from "words" where "word" in (?)', params: ["AARDVARK"], cause },
			);
		});

		const result = await transcribeWords({ words: ["aardvark"] }, { processWords });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("database");
			expect(result.error.message).toBe(TRANSCRIPTION_DATABASE_MESSAGE);
			expect(Object.values(result.error).join(" ")).not.toMatch(/AARDVARK|select|SQLITE/i);
			expect(result.reason).toBe("Error: SQLITE_ERROR: no such table: words");
			expect(result.reason).not.toMatch(/AARDVARK|select/i);
		}
	});

	it("treats a timeout inside Drizzle's wrapper as retryable", async () => {
		const processWords = vi.fn(async () => {
			const cause = new DOMException("The operation was cancelled", "TimeoutError");
			throw Object.assign(new Error("Failed query: select 1\nparams: busy"), {
				query: "select 1",
				params: ["busy"],
				cause,
			});
		});

		const result = await transcribeWords({ words: ["busy"] }, { processWords });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("retryable");
			expect(result.error.message).toBe(TRANSCRIPTION_RETRYABLE_MESSAGE);
			expect(result.reason).toBe("TimeoutError: The operation was cancelled");
		}
	});

	it("treats an aborted request as retryable by its error name alone", async () => {
		const processWords = vi.fn(async () => {
			throw new DOMException("The user aborted a request", "AbortError");
		});

		const result = await transcribeWords({ words: ["hello"] }, { processWords });

		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.kind).toBe("retryable");
	});

	it("does not treat a learner's word in Drizzle's message as a transient failure", async () => {
		const processWords = vi.fn(async () => {
			throw Object.assign(new Error("Failed query: select 1\nparams: unavailable"), {
				query: "select 1",
				params: ["unavailable"],
				cause: new Error("SQLITE_ERROR: no such table: words"),
			});
		});

		const result = await transcribeWords({ words: ["unavailable"] }, { processWords });

		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.kind).toBe("database");
	});

	it("drops URLs from the reason", async () => {
		const processWords = vi.fn(async () => {
			throw new Error("fetch failed: https://db-example.turso.io/v2/pipeline unreachable");
		});

		const result = await transcribeWords({ words: ["hello"] }, { processWords });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reason).toBe("Error: fetch failed: [url] unreachable");
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
			expect(result.error.message).toBe(TRANSCRIPTION_RETRYABLE_MESSAGE);
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
