import { describe, expect, it } from "vitest";
import { PRESERVED_SECRET_KEYS } from "./write-dev-vars";
import { buildWorkerSecrets, WORKER_SECRET_KEYS } from "./write-worker-secrets";

describe("write-worker-secrets", () => {
	it("writes only the declared secrets that are set", () => {
		const { secrets, skipped } = buildWorkerSecrets({
			TURSO_DATABASE_URL: "libsql://db.example",
			TURSO_AUTH_TOKEN: "token",
			OPENROUTER_API_KEY: "  ",
			AZURE_SPEECH_KEY: "speech-key",
			AZURE_SPEECH_REGION: "eastus",
			EVIDENCE_LOG_DATABASE_URL: "libsql://evidence.example",
			CLOUDFLARE_API_TOKEN: "never-a-worker-secret",
			SITE_URL: "https://phonaria.example",
		});

		expect(secrets).toEqual({
			TURSO_DATABASE_URL: "libsql://db.example",
			TURSO_AUTH_TOKEN: "token",
			AZURE_SPEECH_KEY: "speech-key",
			AZURE_SPEECH_REGION: "eastus",
			EVIDENCE_LOG_DATABASE_URL: "libsql://evidence.example",
		});
		expect(skipped).toEqual(["OPENROUTER_API_KEY", "EVIDENCE_LOG_AUTH_TOKEN"]);
	});

	it("produces an empty set when nothing is configured, so the deploy still runs", () => {
		expect(buildWorkerSecrets({})).toEqual({ secrets: {}, skipped: [...WORKER_SECRET_KEYS] });
	});

	it("keeps local .dev.vars preservation on the same list", () => {
		expect(PRESERVED_SECRET_KEYS).toEqual(WORKER_SECRET_KEYS);
	});
});
