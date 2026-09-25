import { describe, expect, it, vi } from "vitest";
import { createOpenRouterJev, JEV_MODEL, JevError, OPENROUTER_SYSTEM_ONE_URL } from "./client";

const request = {
	state: { sentence: "I wnat it" },
	questions: {
		miss_1: {
			type: "choice" as const,
			instructions: "Which word?",
			criteria: { want: "want", none_of_these: "none" },
		},
	},
};

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("createOpenRouterJev", () => {
	it("posts the questions to OpenRouter with the key and model, and returns the answers", async () => {
		const answers = { miss_1: { type: "choice", choice: "want", confidence: 0.9 } };
		const fetch = vi.fn(async () => jsonResponse({ answers, usage: { input_tokens: 40 } }));
		const askJev = createOpenRouterJev({ apiKey: "sk-test", timeoutMs: 1000, fetch });

		await expect(askJev(request)).resolves.toEqual(answers);

		const [url, init] = fetch.mock.calls[0] as unknown as [
			string,
			{ method: string; headers: Record<string, string>; body: string; signal: AbortSignal },
		];
		expect(url).toBe(OPENROUTER_SYSTEM_ONE_URL);
		expect(init.method).toBe("POST");
		expect(init.headers.Authorization).toBe("Bearer sk-test");
		expect(JSON.parse(init.body)).toEqual({ model: JEV_MODEL, ...request });
		expect(init.signal).toBeInstanceOf(AbortSignal);
	});

	it("fails with the HTTP status and does not retry", async () => {
		const fetch = vi.fn(async () => jsonResponse({ error: "busy" }, 429));
		const askJev = createOpenRouterJev({ apiKey: "sk-test", timeoutMs: 1000, fetch });

		await expect(askJev(request)).rejects.toMatchObject({ name: "JevError", status: 429 });
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it("reports a timeout as a JevError", async () => {
		const fetch = vi.fn(async () => {
			throw new DOMException("The operation timed out.", "TimeoutError");
		});
		const askJev = createOpenRouterJev({ apiKey: "sk-test", timeoutMs: 1000, fetch });

		await expect(askJev(request)).rejects.toThrow(new JevError("Jev request timed out"));
	});

	it("rejects a body without answers", async () => {
		const fetch = vi.fn(async () => jsonResponse({ id: "x" }));
		const askJev = createOpenRouterJev({ apiKey: "sk-test", timeoutMs: 1000, fetch });

		await expect(askJev(request)).rejects.toThrow("Jev response has no answers");
	});
});
