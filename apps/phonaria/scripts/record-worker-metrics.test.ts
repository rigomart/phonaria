import { describe, expect, it } from "vitest";
import {
	compareToGuardrails,
	formatWorkerMetricsReport,
	parseWranglerOutput,
} from "./record-worker-metrics";

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
