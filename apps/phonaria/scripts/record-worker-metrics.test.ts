import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
	compareToGuardrails,
	formatWorkerMetricsReport,
	measureWorkerDirectory,
	parseWranglerOutput,
	resolveMeasurementDirectory,
} from "./record-worker-metrics";

const repoRoot = resolve(import.meta.dirname, "../../..");

function readWorkflow(name: string): string {
	return readFileSync(resolve(repoRoot, ".github/workflows", name), "utf8");
}

describe("parseWranglerOutput", () => {
	it("reads upload size, module count, and startup from Wrangler deploy text", () => {
		const output = `
Uploaded phonaria-staging (2.41 sec)
  Worker Startup Time: 21 ms
Total Upload: 1000.10 KiB / gzip: 215.14 KiB
Your worker has access to the following bindings:
- 15 modules
`;
		expect(parseWranglerOutput(output)).toEqual({
			uncompressedBytes: Math.round(1000.1 * 1024),
			gzipBytes: Math.round(215.14 * 1024),
			modules: 15,
			startupMs: 21,
		});
	});

	it("reads dry-run upload lines that omit colons and say extra modules", () => {
		const output = "Total Upload 1449.22 KiB / gzip 310.87 KiB, 8 extra modules";
		expect(parseWranglerOutput(output)).toEqual({
			uncompressedBytes: Math.round(1449.22 * 1024),
			gzipBytes: Math.round(310.87 * 1024),
			modules: 8,
		});
	});
});

describe("compareToGuardrails", () => {
	it("flags values above the approved investigation thresholds", () => {
		expect(
			compareToGuardrails({
				uncompressedBytes: 6 * 1024 * 1024,
				gzipBytes: 200_000,
				modules: 16,
				startupMs: 20,
			}),
		).toMatchObject({
			uncompressedBytes: "investigate",
			gzipBytes: "ok",
			modules: "ok",
			startupMs: "ok",
		});
	});

	it("formats a reviewable report", () => {
		const compared = compareToGuardrails({
			uncompressedBytes: 1_024_000,
			gzipBytes: 220_000,
			modules: 15,
			startupMs: null,
		});
		expect(
			formatWorkerMetricsReport({
				uncompressedBytes: 1_024_000,
				gzipBytes: 220_000,
				modules: 15,
				startupMs: null,
				comparedToGuardrails: compared,
			}),
		).toContain("startup: n/a (needs a real deploy)");
	});
});

describe("measureWorkerDirectory", () => {
	it("does not count Vite client chunks as Worker modules", () => {
		const directory = mkdtempSync(join(tmpdir(), "worker-metrics-"));
		mkdirSync(join(directory, "client", "assets"), { recursive: true });
		mkdirSync(join(directory, "server", "assets"), { recursive: true });
		writeFileSync(join(directory, "client", "assets", "index.js"), "export default 1");
		writeFileSync(join(directory, "server", "index.mjs"), "export default 2");
		writeFileSync(join(directory, "server", "assets", "route.mjs"), "export default 3");

		expect(resolveMeasurementDirectory(directory)).toBe(join(directory, "server"));
		expect(measureWorkerDirectory(directory).modules).toBe(2);
	});

	it("counts a Wrangler dry-run directory that has no client tree", () => {
		const directory = mkdtempSync(join(tmpdir(), "worker-dry-run-"));
		writeFileSync(join(directory, "index.js"), "export default 1");
		writeFileSync(join(directory, "chunk.mjs"), "export default 2");

		expect(resolveMeasurementDirectory(directory)).toBe(directory);
		expect(measureWorkerDirectory(directory).modules).toBe(2);
	});
});

describe("deploy workflows", () => {
	it("records Worker metrics from the Wrangler upload, not Vite dist", () => {
		const preview = readWorkflow("preview.yml");
		const production = readWorkflow("production.yml");
		const stagingJob = preview.slice(preview.indexOf("deploy-staging:"));

		expect(stagingJob).toContain("wrangler deploy --dry-run --outdir .wrangler/dry-run");
		expect(stagingJob).toContain("WRANGLER_DEPLOY_LOG: wrangler-dry-run.log");
		expect(stagingJob).toContain("WORKER_BUNDLE_DIR: .wrangler/dry-run");
		expect(stagingJob).not.toMatch(/WORKER_BUNDLE_DIR:\s+dist\s*$/m);
		expect(production).toContain("WORKER_BUNDLE_DIR: .wrangler/dry-run");
		expect(production).not.toMatch(/WORKER_BUNDLE_DIR:\s+dist\s*$/m);
	});
});
