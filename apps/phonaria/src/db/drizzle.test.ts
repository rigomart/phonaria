import { afterEach, describe, expect, it, vi } from "vitest";
import { words } from "./schema";

afterEach(() => {
	vi.unstubAllEnvs();
	vi.resetModules();
});

describe("drizzle module load", () => {
	it("imports without Turso credentials and does not open a connection", async () => {
		vi.stubEnv("TURSO_DATABASE_URL", "");
		vi.stubEnv("TURSO_AUTH_TOKEN", "");

		const drizzle = await import("./drizzle");

		expect(typeof drizzle.getDb).toBe("function");
		expect(typeof drizzle.createDatabase).toBe("function");
		expect(() => drizzle.getDb()).toThrow(/TURSO_DATABASE_URL/);
	});

	it("imports the transcription service without database credentials", async () => {
		vi.stubEnv("TURSO_DATABASE_URL", "");
		vi.stubEnv("TURSO_AUTH_TOKEN", "");

		const service = await import("@/lib/transcription/service");
		const result = await service.transcribeWords({ words: [] });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe("validation");
		}
	});

	it("imports the Worker transcription handler without database credentials", async () => {
		vi.stubEnv("TURSO_DATABASE_URL", "");
		vi.stubEnv("TURSO_AUTH_TOKEN", "");

		const handler = await import("@/server/transcription");
		expect(typeof handler.transcribeWordsOnWorker).toBe("function");
	});

	it("uses an injected libsql client factory", async () => {
		const { createDatabase } = await import("./drizzle");
		const execute = vi.fn(async () => ({
			columns: [],
			columnTypes: [],
			rows: [],
			rowsAffected: 0,
			lastInsertRowid: BigInt(0),
			toJSON() {
				return {};
			},
		}));
		const createClient = vi.fn(() => ({
			execute,
			batch: vi.fn(),
			migrate: vi.fn(),
			transaction: vi.fn(),
			close: vi.fn(),
			sync: vi.fn(),
		}));

		createDatabase(
			{ url: "libsql://lab.example", authToken: "token" },
			{ createClient: createClient as never },
		);

		expect(createClient).toHaveBeenCalledWith({
			url: "libsql://lab.example",
			authToken: "token",
			fetch: expect.any(Function),
		});
	});

	it("rejects writes on a read-only client before they reach storage", async () => {
		const { createDatabase } = await import("./drizzle");
		const db = createDatabase({ url: "file::memory:" }, { readOnly: true });

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
	});
});

describe("createTimeoutFetch", () => {
	function hangingFetch() {
		return vi.fn(
			(_input: RequestInfo | URL, init?: RequestInit) =>
				new Promise<Response>((_resolve, reject) => {
					init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
				}),
		);
	}

	it("aborts a request that takes longer than the timeout", async () => {
		const { createTimeoutFetch } = await import("./drizzle");
		const base = hangingFetch();

		await expect(
			createTimeoutFetch(10, base)(new Request("https://db.example/v2/pipeline")),
		).rejects.toMatchObject({ name: "TimeoutError" });
	});

	it("keeps the abort signal the request already carries", async () => {
		const { createTimeoutFetch } = await import("./drizzle");
		const base = hangingFetch();
		const controller = new AbortController();
		const pending = createTimeoutFetch(
			60_000,
			base,
		)(new Request("https://db.example/v2/pipeline", { signal: controller.signal }));

		controller.abort(new Error("caller gave up"));

		await expect(pending).rejects.toThrow("caller gave up");
	});

	it("passes a response through when it arrives in time", async () => {
		const { createTimeoutFetch } = await import("./drizzle");
		const response = new Response("ok");
		const base = vi.fn(async () => response);

		await expect(createTimeoutFetch(1000, base)("https://db.example/v2/pipeline")).resolves.toBe(
			response,
		);
		expect(base).toHaveBeenCalledWith("https://db.example/v2/pipeline", {
			signal: expect.any(AbortSignal),
		});
	});
});
