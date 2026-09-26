/**
 * Minimal client for Jev, TypeSafe's typed-decision model, served through OpenRouter's
 * System One endpoint. Server-only: it carries the API key.
 *
 * API reference: https://docs.typesafe.ai/api
 * Findings that shaped its use: https://github.com/rigomart/phonaria/issues/262
 */

export const OPENROUTER_SYSTEM_ONE_URL = "https://openrouter.ai/api/v1/systemone";
export const JEV_MODEL = "jev-latest";

export type JevChoiceQuestion = {
	type: "choice";
	instructions: string;
	/** Option key → what choosing it means. At most 255 options. */
	criteria: Record<string, string>;
};

export type JevRequest = {
	state: unknown;
	/** Independent questions about the same state share one call. */
	questions: Record<string, JevChoiceQuestion>;
};

/** Answers by question key, unvalidated: callers parse what they asked for. */
export type AskJev = (request: JevRequest) => Promise<Record<string, unknown>>;

export type JevFetch = (
	input: string,
	init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal },
) => Promise<Response>;

export class JevError extends Error {
	readonly status?: number;

	constructor(message: string, status?: number) {
		super(message);
		this.name = "JevError";
		this.status = status;
	}
}

/** One attempt, no retries: every caller has a deterministic fallback that beats waiting. */
export function createOpenRouterJev(options: {
	apiKey: string;
	timeoutMs: number;
	fetch?: JevFetch;
}): AskJev {
	const fetchFn = options.fetch ?? fetch;

	return async (request) => {
		let response: Response;
		try {
			response = await fetchFn(OPENROUTER_SYSTEM_ONE_URL, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${options.apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ model: JEV_MODEL, ...request }),
				signal: AbortSignal.timeout(options.timeoutMs),
			});
		} catch (error) {
			const timedOut = error instanceof Error && error.name === "TimeoutError";
			throw new JevError(timedOut ? "Jev request timed out" : "Jev request failed");
		}

		if (!response.ok) {
			throw new JevError(`Jev responded ${response.status}`, response.status);
		}

		let payload: unknown;
		try {
			payload = await response.json();
		} catch {
			throw new JevError("Jev returned a non-JSON body");
		}

		const answers = (payload as { answers?: unknown } | null)?.answers;
		if (typeof answers !== "object" || answers === null) {
			throw new JevError("Jev response has no answers");
		}
		return answers as Record<string, unknown>;
	};
}
