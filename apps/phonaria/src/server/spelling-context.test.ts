import { describe, expect, it, vi } from "vitest";
import { JevError } from "@/lib/jev/client";
import { SpellingContextValidationError } from "@/lib/transcription/spelling-context-service";
import { chooseSpellingOnWorker, type SpellingContextWorkerEnv } from "./spelling-context";

const input = {
	text: "I wnat to learn English.",
	misses: [{ tokenIndex: 1, candidates: ["what", "want"] }],
};

function allowingEnv(overrides: Partial<SpellingContextWorkerEnv> = {}): SpellingContextWorkerEnv {
	return {
		OPENROUTER_API_KEY: "sk-test",
		SPELLING_CONTEXT_RATE_LIMIT: { limit: async () => ({ success: true }) },
		...overrides,
	};
}

function answeringJev() {
	return vi.fn(() => async () => ({
		miss_1: { type: "choice", choice: "want", confidence: 0.95 },
	}));
}

describe("chooseSpellingOnWorker", () => {
	it("answers with Jev's picks and logs counts, never the text", async () => {
		const log = vi.fn();
		const createAskJev = answeringJev();
		const limit = vi.fn(async () => ({ success: true }));

		const result = await chooseSpellingOnWorker(
			input,
			allowingEnv({ SPELLING_CONTEXT_RATE_LIMIT: { limit } }),
			{ createAskJev, isEnabled: () => true, log, rateLimitKey: "203.0.113.10", now: () => 0 },
		);

		expect(result).toEqual({ status: "answered", picks: [{ tokenIndex: 1, word: "want" }] });
		expect(createAskJev).toHaveBeenCalledWith("sk-test");
		expect(limit).toHaveBeenCalledWith({ key: "203.0.113.10" });
		expect(log).toHaveBeenCalledWith({
			level: "info",
			message: "spelling_context_answered",
			details: { picks: 1, offered: 1, ms: 0 },
		});
		expect(JSON.stringify(log.mock.calls)).not.toContain("wnat");
	});

	it("is unavailable, quietly, while the flag is off", async () => {
		const log = vi.fn();
		const limit = vi.fn();
		const createAskJev = answeringJev();

		await expect(
			chooseSpellingOnWorker(input, allowingEnv({ SPELLING_CONTEXT_RATE_LIMIT: { limit } }), {
				createAskJev,
				isEnabled: () => false,
				log,
			}),
		).resolves.toEqual({ status: "unavailable" });
		expect(limit).not.toHaveBeenCalled();
		expect(createAskJev).not.toHaveBeenCalled();
		expect(log).not.toHaveBeenCalled();
	});

	it.each([
		["missing_api_key", allowingEnv({ OPENROUTER_API_KEY: "  " }), "warn"],
		[
			"missing_rate_limit",
			allowingEnv({
				SPELLING_CONTEXT_RATE_LIMIT:
					undefined as unknown as SpellingContextWorkerEnv["SPELLING_CONTEXT_RATE_LIMIT"],
			}),
			"error",
		],
		[
			"rate_limited",
			allowingEnv({ SPELLING_CONTEXT_RATE_LIMIT: { limit: async () => ({ success: false }) } }),
			"warn",
		],
	] as const)("is unavailable when %s, without calling Jev", async (reason, env, level) => {
		const log = vi.fn();
		const createAskJev = answeringJev();

		await expect(
			chooseSpellingOnWorker(input, env, { createAskJev, isEnabled: () => true, log }),
		).resolves.toEqual({ status: "unavailable" });
		expect(createAskJev).not.toHaveBeenCalled();
		expect(log).toHaveBeenCalledWith({
			level,
			message: "spelling_context_unavailable",
			details: { reason },
		});
	});

	it("is unavailable when Jev fails or times out, so the browser falls back to the rule", async () => {
		const log = vi.fn();
		const createAskJev = vi.fn(() => async () => {
			throw new JevError("Jev responded 520", 520);
		});

		await expect(
			chooseSpellingOnWorker(input, allowingEnv(), {
				createAskJev,
				isEnabled: () => true,
				log,
				now: () => 0,
			}),
		).resolves.toEqual({ status: "unavailable" });
		expect(log).toHaveBeenCalledWith({
			level: "warn",
			message: "spelling_context_unavailable",
			details: { reason: "jev_failed", status: 520, error: "Jev responded 520", ms: 0 },
		});
	});

	it("rethrows malformed input so the adapter can answer 400", async () => {
		const log = vi.fn();

		await expect(
			chooseSpellingOnWorker({ text: "" }, allowingEnv(), {
				createAskJev: answeringJev(),
				isEnabled: () => true,
				log,
			}),
		).rejects.toBeInstanceOf(SpellingContextValidationError);
		expect(log).toHaveBeenCalledWith({ level: "warn", message: "spelling_context_invalid" });
	});
});
