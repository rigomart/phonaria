import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Result as LighthouseResult } from "lighthouse";
import { describe, expect, it } from "vitest";
import {
	containsAny,
	median,
	readRun,
	renderSummary,
	reportBaseName,
	summarizePage,
	withoutRequestHeaders,
} from "./page-speed";

const ORIGIN = "https://phonaria-pr-1.example.workers.dev";

function lhr(overrides: Record<string, unknown> = {}): LighthouseResult {
	return {
		finalDisplayedUrl: `${ORIGIN}/`,
		categories: {
			performance: { score: 0.91 },
			seo: { score: 1 },
			accessibility: { score: 0.96 },
		},
		audits: {
			"largest-contentful-paint": { numericValue: 2100 },
			"cumulative-layout-shift": { numericValue: 0.012 },
			"total-blocking-time": { numericValue: 120 },
		},
		configSettings: { extraHeaders: { "CF-Access-Client-Secret": "s3cret" } },
		...overrides,
	} as unknown as LighthouseResult;
}

describe("readRun", () => {
	it("reads scores as 0–100 and metrics as raw values", () => {
		expect(readRun(lhr(), ORIGIN)).toEqual({
			ok: true,
			metrics: {
				performance: 91,
				seo: 100,
				accessibility: 96,
				lcpMs: 2100,
				cls: 0.012,
				tbtMs: 120,
			},
		});
	});

	it("rejects a run that ended on the Access login page", () => {
		const outcome = readRun(
			lhr({ finalDisplayedUrl: "https://team.cloudflareaccess.com/cdn-cgi/access/login" }),
			ORIGIN,
		);
		expect(outcome).toEqual({
			ok: false,
			problem: "ended on https://team.cloudflareaccess.com, not the preview",
		});
	});

	it("rejects a run Lighthouse reported an error for", () => {
		const outcome = readRun(lhr({ runtimeError: { code: "NO_FCP", message: "" } }), ORIGIN);
		expect(outcome).toEqual({ ok: false, problem: "Lighthouse error NO_FCP" });
	});
});

describe("median", () => {
	it("takes the middle value, or the mean of the two middle ones", () => {
		expect(median([3, 1, 2])).toBe(2);
		expect(median([4, 1])).toBe(2.5);
	});

	it("ignores missing values and returns null when none are left", () => {
		expect(median([null, 5, null])).toBe(5);
		expect(median([null])).toBeNull();
	});
});

describe("summarizePage", () => {
	it("takes each number's median over the runs that counted", () => {
		const row = summarizePage("/", [
			readRun(lhr(), ORIGIN),
			readRun(
				lhr({
					categories: { performance: { score: 0.8 } },
					audits: { "largest-contentful-paint": { numericValue: 3000 } },
				}),
				ORIGIN,
			),
			readRun(lhr({ finalDisplayedUrl: "https://team.cloudflareaccess.com/" }), ORIGIN),
		]);
		expect(row.validRuns).toBe(2);
		expect(row.median.performance).toBe(85.5);
		expect(row.median.lcpMs).toBe(2550);
		expect(row.median.seo).toBe(100);
		expect(row.problems).toEqual(["ended on https://team.cloudflareaccess.com, not the preview"]);
	});
});

describe("renderSummary", () => {
	it("writes one row per page and notes runs that didn't count", () => {
		const good = summarizePage("/sounds/th-thin", [readRun(lhr(), ORIGIN)]);
		const empty = summarizePage("/ipa-chart/vowels", [{ ok: false, problem: "run failed: boom" }]);
		const summary = renderSummary([good, empty], ORIGIN, 1);
		expect(summary).toContain("| `/sounds/th-thin` | 91 | 100 | 96 | 2.1 s | 0.01 | 120 ms |");
		expect(summary).toContain("| `/ipa-chart/vowels` | – | – | – | – | – | – |");
		expect(summary).toContain("- `/ipa-chart/vowels`: 0 of 1 runs counted (run failed: boom).");
		expect(summary).not.toContain("/sounds/th-thin`: ");
	});
});

describe("withoutRequestHeaders", () => {
	it("drops the request headers Lighthouse copies into the report", () => {
		const clean = withoutRequestHeaders(lhr());
		expect(clean.configSettings.extraHeaders).toBeNull();
		expect(containsAny(JSON.stringify(clean), ["s3cret"])).toBe(false);
	});
});

describe("containsAny", () => {
	it("ignores empty secrets", () => {
		expect(containsAny("anything", [""])).toBe(false);
		expect(containsAny("has s3cret inside", ["", "s3cret"])).toBe(true);
	});
});

describe("reportBaseName", () => {
	it("names reports after the page and run", () => {
		expect(reportBaseName("/", 1)).toBe("home-run-1");
		expect(reportBaseName("/minimal-pairs/p-b", 3)).toBe("minimal-pairs-p-b-run-3");
	});
});

describe("preview workflow", () => {
	const workflow = readFileSync(
		resolve(import.meta.dirname, "../../../.github/workflows/preview.yml"),
		"utf8",
	);

	it("never lets page speed or its upload fail the job", () => {
		const measure = workflow.slice(workflow.indexOf("- name: Measure page speed"));
		const upload = workflow.slice(workflow.indexOf("- name: Upload page-speed reports"));
		expect(measure.split("- name:")[1]).toContain("continue-on-error: true");
		expect(upload.split("- name:")[1]).toContain("continue-on-error: true");
	});

	it("measures only after the smoke checks", () => {
		expect(workflow.indexOf("- name: Measure page speed")).toBeGreaterThan(
			workflow.indexOf("e2e:smoke"),
		);
	});
});
