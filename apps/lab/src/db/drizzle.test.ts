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

	it("imports the Next.js adapter without database credentials", async () => {
		vi.stubEnv("TURSO_DATABASE_URL", "");
		vi.stubEnv("TURSO_AUTH_TOKEN", "");

		const adapter = await import("@/app/_actions/transcribe");
		expect(typeof adapter.transcribeWordsAction).toBe("function");
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
