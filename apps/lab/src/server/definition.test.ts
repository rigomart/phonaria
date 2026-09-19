import { describe, expect, it, vi } from "vitest";
import { DefinitionError } from "@/lib/definition/contract";
import { type DefinitionWorkerEnv, lookupDefinitionOnWorker } from "./definition";

function allowingEnv(overrides: Partial<DefinitionWorkerEnv> = {}): DefinitionWorkerEnv {
	return {
		DEFINITION_RATE_LIMIT: { limit: async () => ({ success: true }) },
		...overrides,
	};
}

describe("lookupDefinitionOnWorker", () => {
	it("fails closed without a configured rate-limit binding", async () => {
		const lookupDefinition = vi.fn(async () => ({
			ok: true as const,
			result: { found: false as const },
		}));
		const log = vi.fn();

		await expect(
			lookupDefinitionOnWorker({ word: "hello" }, {} as DefinitionWorkerEnv, {
				lookupDefinition,
				log,
			}),
		).rejects.toMatchObject({
			kind: "retryable",
			retryable: true,
			message: "Definition lookup is temporarily unavailable.",
		});
		expect(lookupDefinition).not.toHaveBeenCalled();
		expect(log).toHaveBeenCalledWith({
			level: "error",
			message: "definition_lookup_failed",
			details: { kind: "retryable", retryable: true },
		});
	});

	it("allows an ordinary request through the configured rate limiter", async () => {
		const lookupDefinition = vi.fn(async () => ({
			ok: true as const,
			result: { found: false as const },
		}));
		const limit = vi.fn(async () => ({ success: true }));

		await expect(
			lookupDefinitionOnWorker(
				{ word: "hello" },
				{ DEFINITION_RATE_LIMIT: { limit } },
				{ lookupDefinition, rateLimitKey: "203.0.113.10" },
			),
		).resolves.toEqual({ found: false });
		expect(limit).toHaveBeenCalledWith({ key: "203.0.113.10" });
		expect(lookupDefinition).toHaveBeenCalledWith({ word: "hello" });
	});

	it("rejects a limited request before calling the lookup", async () => {
		const lookupDefinition = vi.fn(async () => ({
			ok: true as const,
			result: { found: false as const },
		}));
		const limit = vi.fn(async () => ({ success: false }));
		const log = vi.fn();

		await expect(
			lookupDefinitionOnWorker(
				{ word: "hello" },
				{ DEFINITION_RATE_LIMIT: { limit } },
				{ lookupDefinition, rateLimitKey: "203.0.113.10", log },
			),
		).rejects.toMatchObject({
			kind: "rate_limit",
			retryable: true,
			status: 429,
			message: "Too many definition requests. Please try again shortly.",
		});
		expect(lookupDefinition).not.toHaveBeenCalled();
		expect(log).toHaveBeenCalledWith({
			level: "warn",
			message: "definition_lookup_failed",
			details: { kind: "rate_limit", retryable: true },
		});
		expect(JSON.stringify(log.mock.calls[0]?.[0])).not.toMatch(/hello/);
	});

	it("returns a found payload from the shared service", async () => {
		const lookupDefinition = vi.fn(async () => ({
			ok: true as const,
			result: {
				found: true as const,
				word: "hello",
				groups: [{ partOfSpeech: "noun", senses: ["a greeting"] }],
			},
		}));

		await expect(
			lookupDefinitionOnWorker({ word: "hello" }, allowingEnv(), { lookupDefinition }),
		).resolves.toEqual({
			found: true,
			word: "hello",
			groups: [{ partOfSpeech: "noun", senses: ["a greeting"] }],
		});
	});

	it("throws a sanitized retryable failure and does not include the word", async () => {
		const lookupDefinition = vi.fn(async () => {
			throw new Error("fetch failed: en.wiktionary.org timeout");
		});
		const log = vi.fn();

		await expect(
			lookupDefinitionOnWorker({ word: "aardvark" }, allowingEnv(), {
				lookupDefinition,
				log,
			}),
		).rejects.toBeInstanceOf(DefinitionError);

		expect(log).toHaveBeenCalledWith({
			level: "error",
			message: "definition_lookup_failed",
			details: { kind: "retryable", retryable: true },
		});
		const payload = JSON.stringify(log.mock.calls[0]?.[0]);
		expect(payload).not.toMatch(/aardvark/);
		expect(payload).not.toMatch(/wiktionary/);
	});

	it("throws service errors after the rate limiter allows the request", async () => {
		const lookupDefinition = vi.fn(async () => ({
			ok: false as const,
			error: new DefinitionError(
				"retryable",
				"We couldn't load that definition. Please try again.",
			),
		}));
		const log = vi.fn();

		await expect(
			lookupDefinitionOnWorker({ word: "hello" }, allowingEnv(), { lookupDefinition, log }),
		).rejects.toMatchObject({
			kind: "retryable",
			retryable: true,
		});
		expect(log).toHaveBeenCalledWith({
			level: "error",
			message: "definition_lookup_failed",
			details: { kind: "retryable", retryable: true },
		});
	});
});
