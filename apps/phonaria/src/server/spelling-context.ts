import { flags } from "@/lib/flags";
import { type AskJev, createOpenRouterJev, JevError } from "@/lib/jev/client";
import type { SpellingContextOutput } from "@/lib/transcription/spelling-context";
import {
	chooseSpellingInContext as defaultChooseSpelling,
	SpellingContextValidationError,
} from "@/lib/transcription/spelling-context-service";
import type { WorkerRateLimit } from "@/server/cloudflare/env";
import { logWorkerEvent } from "@/server/cloudflare/log";

/** The suggestion line waits on this, and the rule answers instantly, so keep it short. */
export const SPELLING_CONTEXT_TIMEOUT_MS = 1_500;

export type SpellingContextWorkerEnv = {
	OPENROUTER_API_KEY?: string;
	SPELLING_CONTEXT_RATE_LIMIT: WorkerRateLimit;
};

export type ChooseSpellingOnWorkerDependencies = {
	chooseSpelling?: typeof defaultChooseSpelling;
	createAskJev?: (apiKey: string) => AskJev;
	isEnabled?: () => boolean;
	rateLimitKey?: string;
	log?: typeof logWorkerEvent;
	now?: () => number;
};

const UNAVAILABLE: SpellingContextOutput = { status: "unavailable" };

/**
 * Framework-neutral Worker handler. Every failure short of malformed input answers
 * `unavailable`, and the browser falls back to the frequency rule: this is an enhancement,
 * never a reason to show the learner an error. Learner text is never logged.
 */
export async function chooseSpellingOnWorker(
	input: unknown,
	env: SpellingContextWorkerEnv,
	dependencies: ChooseSpellingOnWorkerDependencies = {},
): Promise<SpellingContextOutput> {
	const log = dependencies.log ?? logWorkerEvent;
	const isEnabled = dependencies.isEnabled ?? (() => flags.isEnabled("spellingContext"));
	const now = dependencies.now ?? Date.now;
	const unavailable = (level: "warn" | "error", reason: string, details = {}) => {
		log({ level, message: "spelling_context_unavailable", details: { reason, ...details } });
		return UNAVAILABLE;
	};

	if (!isEnabled()) return UNAVAILABLE;

	const apiKey = env.OPENROUTER_API_KEY?.trim();
	if (!apiKey) return unavailable("warn", "missing_api_key");
	if (!env.SPELLING_CONTEXT_RATE_LIMIT) return unavailable("error", "missing_rate_limit");

	const limited = await env.SPELLING_CONTEXT_RATE_LIMIT.limit({
		key: dependencies.rateLimitKey?.trim() || "anonymous",
	});
	if (!limited.success) return unavailable("warn", "rate_limited");

	const askJev =
		dependencies.createAskJev?.(apiKey) ??
		createOpenRouterJev({ apiKey, timeoutMs: SPELLING_CONTEXT_TIMEOUT_MS });
	const choose = dependencies.chooseSpelling ?? defaultChooseSpelling;
	const started = now();

	try {
		const result = await choose(input, { askJev });
		if (result.status === "answered") {
			log({
				level: "info",
				message: "spelling_context_answered",
				details: {
					picks: result.picks.length,
					offered: result.picks.filter((pick) => pick.word !== null).length,
					ms: now() - started,
				},
			});
		}
		return result;
	} catch (error) {
		if (error instanceof SpellingContextValidationError) {
			log({ level: "warn", message: "spelling_context_invalid" });
			throw error;
		}
		return unavailable("warn", "jev_failed", {
			status: error instanceof JevError ? error.status : undefined,
			error: error instanceof Error ? error.message : "unknown",
			ms: now() - started,
		});
	}
}
