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

	it("reads startup from a real staging deploy's output", () => {
		// Excerpt of the Wrangler 4.131.1 output from staging run 41113151037.
		const output = `
│ Total (74 modules)                                        │      │ 3487.59 KiB │
└───────────────────────────────────────────────────────────┴──────┴─────────────┘
✨ Success! Uploaded 20 files (36 already uploaded) (1.65 sec)

Total Upload: 3488.50 KiB / gzip: 850.60 KiB
Worker Startup Time: 9 ms
Your Worker has access to the following bindings:
`;
		expect(parseWranglerOutput(output)).toEqual({
			uncompressedBytes: Math.round(3488.5 * 1024),
			gzipBytes: Math.round(850.6 * 1024),
			modules: 74,
			startupMs: 9,
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
			startupMs: "ok",
		});
	});

	it("never fails on module count", () => {
		const compared = compareToGuardrails({
			uncompressedBytes: 1_024_000,
			gzipBytes: 220_000,
			modules: 10_000,
			startupMs: 20,
		});
		expect(compared).not.toHaveProperty("modules");
		expect(Object.values(compared)).not.toContain("investigate");
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

	it("prints the module count as information, not against a limit", () => {
		const metrics = {
			uncompressedBytes: 1_024_000,
			gzipBytes: 220_000,
			modules: 74,
			startupMs: null,
		};
		const report = formatWorkerMetricsReport({
			...metrics,
			comparedToGuardrails: compareToGuardrails(metrics),
		});
		expect(report).toContain("- modules: 74 (info)");
		expect(report).not.toMatch(/modules: 74 \//);
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

	it("walks every JS module in a chosen directory, including a client folder", () => {
		const directory = mkdtempSync(join(tmpdir(), "worker-chosen-"));
		mkdirSync(join(directory, "client"));
		writeFileSync(join(directory, "index.mjs"), "export default 1");
		writeFileSync(join(directory, "client", "extra.mjs"), "export default 2");

		expect(resolveMeasurementDirectory(directory)).toBe(directory);
		expect(measureWorkerDirectory(directory).modules).toBe(2);
	});
});

describe("deploy workflows", () => {
	const dryRunWithPipefail =
		/set -o pipefail\s+bunx wrangler deploy --dry-run --outdir \.wrangler\/dry-run \| tee wrangler-dry-run\.log/;

	const workflows = ["preview.yml", "staging.yml", "production.yml"];
	const realDeployWorkflows = ["staging.yml", "production.yml"];

	it("records Worker metrics from the Wrangler upload, not Vite dist", () => {
		for (const name of workflows) {
			const workflow = readWorkflow(name);

			expect(workflow).toContain("WORKER_BUNDLE_DIR: .wrangler/dry-run");
			expect(workflow).not.toMatch(/WORKER_BUNDLE_DIR:\s+dist\s*$/m);
		}
	});

	it("reads startup time from the real deploy, since a dry-run never reports it", () => {
		expect(readWorkflow("preview.yml")).toContain("WRANGLER_DEPLOY_LOG: wrangler-dry-run.log");
		for (const name of realDeployWorkflows) {
			const workflow = readWorkflow(name);

			expect(workflow).toMatch(/- name: Deploy \w+ Worker\n\s+id: deploy\n/);
			expect(workflow).toContain("DEPLOY_OUTPUT: ${{ steps.deploy.outputs.command-output }}");
			expect(workflow).toContain("WRANGLER_DEPLOY_LOG: wrangler-deploy.log");
			expect(workflow).toContain(`printf '%s\\n' "$DEPLOY_OUTPUT" > wrangler-deploy.log`);
		}
	});

	it("fails staging and production when the deploy reports no startup time", () => {
		for (const name of realDeployWorkflows) {
			expect(readWorkflow(name)).toMatch(
				/if ! jq -e '\.metrics\.startupMs != null' worker-metrics\.json > \/dev\/null; then\n.*::error::.*\n\s+exit 1\n/,
			);
		}
	});

	it("fails the Wrangler dry-run step when wrangler fails before tee", () => {
		for (const name of workflows) {
			expect(readWorkflow(name)).toMatch(dryRunWithPipefail);
		}
	});
});
