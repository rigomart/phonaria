import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertGeneratedWorkerName, readGeneratedWorkerName } from "./assert-generated-worker-name";

describe("readGeneratedWorkerName", () => {
	it("reads the flattened Worker name from redirected Wrangler JSON", () => {
		const directory = mkdtempSync(join(tmpdir(), "lab-wrangler-"));
		const path = join(directory, "wrangler.json");
		writeFileSync(path, JSON.stringify({ name: "phonaria-lab-staging", vars: {} }));
		expect(readGeneratedWorkerName(path)).toBe("phonaria-lab-staging");
	});

	it("rejects a missing name so a top-level phonaria-lab flatten cannot pass silently", () => {
		const directory = mkdtempSync(join(tmpdir(), "lab-wrangler-"));
		const path = join(directory, "wrangler.json");
		writeFileSync(path, JSON.stringify({ vars: {} }));
		expect(() => readGeneratedWorkerName(path)).toThrow(/missing a Worker name/);
	});
});

describe("assertGeneratedWorkerName", () => {
	it("fails when Vite flattened the top-level production Worker name", () => {
		expect(() => assertGeneratedWorkerName("phonaria-lab", "phonaria-lab-staging")).toThrow(
			/CLOUDFLARE_ENV/,
		);
	});

	it("accepts the staging Worker name", () => {
		expect(() =>
			assertGeneratedWorkerName("phonaria-lab-staging", "phonaria-lab-staging"),
		).not.toThrow();
	});
});
