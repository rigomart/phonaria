import { describe, expect, it } from "vitest";
import { CPU_GUARDRAIL_MS, formatSummary, summarize } from "./query-worker-analytics";

describe("summarize", () => {
	it("totals requests and converts CPU microseconds to milliseconds", () => {
		const summary = summarize([
			{
				sum: { requests: 40, errors: 0 },
				quantiles: { cpuTimeP50: 3200, cpuTimeP99: 9100 },
				dimensions: { status: "success" },
			},
		]);
		expect(summary.requests).toBe(40);
		expect(summary.cpuTimeP50Ms).toBeCloseTo(3.2);
		expect(summary.cpuTimeP99Ms).toBeCloseTo(9.1);
		expect(summary.failureStatuses).toEqual({});
	});

	it("surfaces exceededResources separately from the status breakdown", () => {
		const summary = summarize([
			{ sum: { requests: 10 }, dimensions: { status: "success" } },
			{ sum: { requests: 2 }, dimensions: { status: "exceededResources" } },
		]);
		expect(summary.requests).toBe(12);
		expect(summary.byStatus).toEqual({ success: 10, exceededResources: 2 });
		expect(summary.failureStatuses).toEqual({ exceededResources: 2 });
	});

	it("takes the worst CPU quantile across rows", () => {
		const summary = summarize([
			{ quantiles: { cpuTimeP99: 4000 }, dimensions: { status: "success" } },
			{ quantiles: { cpuTimeP99: 12000 }, dimensions: { status: "success" } },
		]);
		expect(summary.cpuTimeP99Ms).toBeCloseTo(12);
	});

	it("reports no CPU data rather than zero when quantiles are absent", () => {
		expect(summarize([{ sum: { requests: 1 } }]).cpuTimeP99Ms).toBeNull();
	});
});

describe("formatSummary", () => {
	it("states the guardrail alongside the measured p99", () => {
		const text = formatSummary(summarize([{ quantiles: { cpuTimeP99: 5000 } }]), "phonaria");
		expect(text).toContain("5.00 ms");
		expect(text).toContain(`guardrail ${CPU_GUARDRAIL_MS} ms`);
	});

	it("calls out failure outcomes so they cannot be skimmed past", () => {
		const text = formatSummary(
			summarize([{ sum: { requests: 1 }, dimensions: { status: "exceededResources" } }]),
			"phonaria",
		);
		expect(text).toContain("FAILURE OUTCOMES");
	});
});
