import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Result as LighthouseResult } from "lighthouse";
import { describe, expect, it } from "vitest";
import {
	buildMedians,
	checkLimits,
	containsAny,
	median,
	PAGE_SPEED_PAGES,
	readRun,
	renderSummary,
	reportBaseName,
	runSourceFromEnv,
	summarizePage,
	withoutRequestHeaders,
} from "./page-speed";
import { PAGE_SPEED_LIMITS, PAGE_SPEED_MIN_RUNS, type PageSpeedLimits } from "./page-speed-limits";

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

describe("readRun with a query", () => {
	it("counts a run whose final URL carries a query", () => {
		const outcome = readRun(
			lhr({ finalDisplayedUrl: `${ORIGIN}/minimal-pairs/p-b?word=pet` }),
			ORIGIN,
		);
		expect(outcome.ok).toBe(true);
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
		const summary = renderSummary([good, empty], ORIGIN, 1, []);
		expect(summary).toContain("| `/sounds/th-thin` | 91 | 100 | 96 | 2.1 s | 0.01 | 120 ms |");
		expect(summary).toContain("| `/ipa-chart/vowels` | – | – | – | – | – | – |");
		expect(summary).toContain("- `/ipa-chart/vowels`: 0 of 1 runs counted (run failed: boom).");
		expect(summary).not.toContain("/sounds/th-thin`: ");
	});
});

describe("checkLimits", () => {
	const limits: PageSpeedLimits = {
		maxLcpMs: 1500,
		maxCls: 0.05,
		maxTbtMs: 300,
		minSeo: 100,
		minAccessibility: 96,
	};
	const fast = lhr({
		audits: {
			"largest-contentful-paint": { numericValue: 950 },
			"cumulative-layout-shift": { numericValue: 0.002 },
			"total-blocking-time": { numericValue: 20 },
		},
	});
	const blocked = (tbt: number) =>
		lhr({
			audits: {
				"largest-contentful-paint": { numericValue: 950 },
				"cumulative-layout-shift": { numericValue: 0.002 },
				"total-blocking-time": { numericValue: tbt },
			},
		});
	const check = (outcomes: Parameters<typeof summarizePage>[1]) =>
		checkLimits([summarizePage("/", outcomes)], { "/": limits }, 3, 2);

	it("passes a page whose medians are within its limits", () => {
		expect(check([readRun(fast, ORIGIN), readRun(fast, ORIGIN), readRun(fast, ORIGIN)])).toEqual(
			[],
		);
	});

	it("judges the median, so one slow run doesn't fail the page", () => {
		const outcomes = [readRun(blocked(2000), ORIGIN), readRun(fast, ORIGIN), readRun(fast, ORIGIN)];
		expect(check(outcomes)).toEqual([]);
	});

	it("names the page and the metric whose median is over its limit", () => {
		const outcomes = [
			readRun(blocked(1980), ORIGIN),
			readRun(blocked(2100), ORIGIN),
			readRun(fast, ORIGIN),
		];
		expect(check(outcomes)).toEqual([
			{ path: "/", metric: "tbtMs", message: "`/`: TBT 1980 ms is over its limit of 300 ms." },
		]);
	});

	it("names a score under its floor", () => {
		const lower = lhr({
			categories: {
				performance: { score: 0.9 },
				seo: { score: 0.92 },
				accessibility: { score: 0.9 },
			},
			audits: fast.audits,
		});
		const breaches = check([readRun(lower, ORIGIN), readRun(lower, ORIGIN), readRun(fast, ORIGIN)]);
		expect(breaches.map((b) => b.message)).toEqual([
			"`/`: SEO 92 is under its floor of 100.",
			"`/`: Accessibility 90 is under its floor of 96.",
		]);
	});

	it("counts a value exactly at the limit as within it", () => {
		const atLimit = blocked(300);
		expect(check([readRun(atLimit, ORIGIN), readRun(atLimit, ORIGIN)])).toEqual([]);
	});

	it("never shows a median just past its limit as equal to it", () => {
		const justOver = lhr({
			categories: {
				performance: { score: 0.9 },
				seo: { score: 1 },
				accessibility: { score: 0.955 },
			},
			audits: {
				"largest-contentful-paint": { numericValue: 1500.1 },
				"cumulative-layout-shift": { numericValue: 0.0501 },
				"total-blocking-time": { numericValue: 300.4 },
			},
		});
		const breaches = check([readRun(justOver, ORIGIN), readRun(justOver, ORIGIN)]);
		expect(breaches.map((b) => b.message)).toEqual([
			"`/`: LCP 1.5001 s is over its limit of 1.50 s.",
			"`/`: CLS 0.0501 is over its limit of 0.050.",
			"`/`: TBT 300.4 ms is over its limit of 300 ms.",
		]);
	});

	it("shows a score median between two runs with its decimal", () => {
		const row = summarizePage("/", [
			readRun(
				lhr({ ...fast, categories: { seo: { score: 1 }, accessibility: { score: 0.95 } } }),
				ORIGIN,
			),
			readRun(
				lhr({ ...fast, categories: { seo: { score: 1 }, accessibility: { score: 0.96 } } }),
				ORIGIN,
			),
		]);
		expect(checkLimits([row], { "/": limits }, 3, 2).map((b) => b.message)).toEqual([
			"`/`: Accessibility 95.5 is under its floor of 96.",
		]);
	});

	it("fails a page with fewer good runs than it needs, and judges nothing else", () => {
		const outcomes = [
			readRun(blocked(5000), ORIGIN),
			{ ok: false as const, problem: "run failed: boom" },
			{ ok: false as const, problem: "Lighthouse error NO_FCP" },
		];
		expect(check(outcomes)).toEqual([
			{
				path: "/",
				metric: null,
				message: "`/`: only 1 of 3 runs counted, and it needs at least 2.",
			},
		]);
	});

	it("fails a metric the counted runs gave no value for", () => {
		const noLcp = lhr({
			audits: {
				"cumulative-layout-shift": { numericValue: 0 },
				"total-blocking-time": { numericValue: 0 },
			},
		});
		expect(check([readRun(noLcp, ORIGIN), readRun(noLcp, ORIGIN)])).toEqual([
			{ path: "/", metric: "lcpMs", message: "`/`: LCP has no value from the runs that counted." },
		]);
	});

	it("fails a page that has no limits", () => {
		const row = summarizePage("/new", [readRun(fast, ORIGIN), readRun(fast, ORIGIN)]);
		expect(checkLimits([row], {}, 3, 2)).toEqual([
			{ path: "/new", metric: null, message: "`/new` has no limits set." },
		]);
	});

	it("marks each cell over its limit in the summary and lists why", () => {
		const rows = [
			summarizePage("/", [readRun(blocked(1980), ORIGIN), readRun(blocked(2100), ORIGIN)]),
			summarizePage("/ipa-chart/vowels", [readRun(fast, ORIGIN), readRun(fast, ORIGIN)]),
		];
		const breaches = checkLimits(rows, { "/": limits, "/ipa-chart/vowels": limits }, 2, 2);
		const summary = renderSummary(rows, ORIGIN, 2, breaches);
		expect(summary).toContain("| `/` | 91 | 100 | 96 | 0.9 s | 0.00 | **2040 ms** ❌ |");
		expect(summary).toContain("| `/ipa-chart/vowels` | 91 | 100 | 96 | 0.9 s | 0.00 | 20 ms |");
		expect(summary).toContain(
			"**Over the limits:**\n\n- `/`: TBT 2040 ms is over its limit of 300 ms.",
		);
		expect(summary).not.toContain("Every page is within its limits.");
	});

	it("says so when every page is within its limits", () => {
		const rows = [summarizePage("/", [readRun(fast, ORIGIN)])];
		expect(renderSummary(rows, ORIGIN, 1, [])).toContain("Every page is within its limits.");
	});
});

describe("PAGE_SPEED_LIMITS", () => {
	it("sets limits for every measured page and nothing else", () => {
		expect(Object.keys(PAGE_SPEED_LIMITS).sort()).toEqual([...PAGE_SPEED_PAGES].sort());
	});

	it("needs at least two of the three runs on each page", () => {
		expect(PAGE_SPEED_MIN_RUNS).toBe(2);
	});
});

describe("runSourceFromEnv", () => {
	it("prefers the pull request's head commit and number", () => {
		expect(
			runSourceFromEnv({ PAGE_SPEED_COMMIT: "abc", PAGE_SPEED_PR: "469", GITHUB_SHA: "merge" }),
		).toEqual({ commit: "abc", pullRequest: 469 });
	});

	it("falls back to GITHUB_SHA, and to nothing for a local run", () => {
		expect(runSourceFromEnv({ GITHUB_SHA: "merge" })).toEqual({
			commit: "merge",
			pullRequest: null,
		});
		expect(runSourceFromEnv({ PAGE_SPEED_COMMIT: "", PAGE_SPEED_PR: "" })).toEqual({
			commit: null,
			pullRequest: null,
		});
		expect(runSourceFromEnv({ PAGE_SPEED_PR: "not a number" }).pullRequest).toBeNull();
	});
});

describe("buildMedians", () => {
	const slower = lhr({
		categories: { performance: { score: 0.8 }, seo: { score: 1 }, accessibility: { score: 0.96 } },
		audits: {
			"largest-contentful-paint": { numericValue: 3000 },
			"cumulative-layout-shift": { numericValue: 0.1 },
			"total-blocking-time": { numericValue: 300 },
		},
	});
	const rows = [
		summarizePage("/", [
			readRun(lhr(), ORIGIN),
			readRun(slower, ORIGIN),
			readRun(lhr({ finalDisplayedUrl: "https://team.example.com/" }), ORIGIN),
			readRun(lhr(), ORIGIN),
		]),
		summarizePage("/ipa-chart/vowels", [{ ok: false, problem: "run failed: boom" }]),
	];
	const source = { commit: "abc123", pullRequest: 469 };

	it("holds each metric's median and its per-run values, with where they came from", () => {
		const medians = buildMedians(rows, ORIGIN, 4, source);
		expect(medians).toMatchObject({ commit: "abc123", pullRequest: 469, origin: ORIGIN });
		const home = medians.pages[0];
		expect(home.validRuns).toBe(3);
		expect(home.metrics.performance).toEqual({ median: 91, runs: [91, 80, 91] });
		expect(home.metrics.lcpMs).toEqual({ median: 2100, runs: [2100, 3000, 2100] });
		expect(home.metrics.cls.runs).toEqual([0.012, 0.1, 0.012]);
		expect(Object.keys(home.metrics)).toEqual([
			"performance",
			"seo",
			"accessibility",
			"lcpMs",
			"cls",
			"tbtMs",
		]);
	});

	it("keeps a page with no counted runs, with null medians and the reason", () => {
		const empty = buildMedians(rows, ORIGIN, 4, source).pages[1];
		expect(empty.metrics.performance).toEqual({ median: null, runs: [] });
		expect(empty.problems).toEqual(["run failed: boom"]);
	});

	it("takes its medians from the rows the summary table prints", () => {
		const { performance, seo, accessibility, lcpMs, cls, tbtMs } = buildMedians(
			rows,
			ORIGIN,
			4,
			source,
		).pages[0].metrics;
		expect(renderSummary(rows, ORIGIN, 4, [])).toContain(
			`| \`/\` | ${performance.median} | ${seo.median} | ${accessibility.median} | ${(lcpMs.median! / 1000).toFixed(1)} s | ${cls.median!.toFixed(2)} | ${tbtMs.median} ms |`,
		);
	});

	it("never holds a token value or request headers", () => {
		const runs = [readRun(lhr(), ORIGIN)];
		const json = JSON.stringify(buildMedians([summarizePage("/", runs)], ORIGIN, 1, source));
		expect(containsAny(json, ["s3cret"])).toBe(false);
		expect(json).not.toMatch(/header/i);
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

	it("leaves the query out of the name", () => {
		expect(reportBaseName("/minimal-pairs/p-b?word=pet", 2)).toBe("minimal-pairs-p-b-run-2");
	});

	it("gives every measured page a name with no characters artifact uploads refuse", () => {
		for (const path of PAGE_SPEED_PAGES) {
			expect(reportBaseName(path, 1)).toMatch(/^[a-z0-9-]+$/);
		}
	});

	it("measures the minimal-pair page with one fixed word", () => {
		const pages = PAGE_SPEED_PAGES.filter((path) => path.startsWith("/minimal-pairs/"));
		expect(pages).toEqual(["/minimal-pairs/p-b?word=pet"]);
	});
});

describe("preview workflow", () => {
	const workflow = readFileSync(
		resolve(import.meta.dirname, "../../../.github/workflows/preview.yml"),
		"utf8",
	);

	it("fails the job on page speed, but never on uploading its reports", () => {
		const measure = workflow.slice(workflow.indexOf("- name: Measure page speed"));
		const upload = workflow.slice(workflow.indexOf("- name: Upload page-speed reports"));
		expect(measure.split("- name:")[1]).not.toContain("continue-on-error");
		expect(upload.split("- name:")[1]).toContain("continue-on-error: true");
	});

	it("uploads the reports after the page-speed step, even when it fails", () => {
		const upload = workflow.slice(workflow.indexOf("- name: Upload page-speed reports"));
		expect(upload.split("- name:")[1]).toContain(
			"if: always() && steps.page-speed.outcome != 'skipped'",
		);
		expect(workflow.indexOf("- name: Upload page-speed reports")).toBeGreaterThan(
			workflow.indexOf("- name: Measure page speed"),
		);
	});

	it("keeps the page-speed reports as long as GitHub allows", () => {
		const upload = workflow.slice(workflow.indexOf("- name: Upload page-speed reports"));
		expect(upload.split("- name:")[1]).toContain("retention-days: 90");
	});

	it("tells the page-speed step which commit and pull request it measures", () => {
		const measure = workflow.slice(workflow.indexOf("- name: Measure page speed"));
		const step = measure.split("- name:")[1];
		expect(step).toContain("PAGE_SPEED_COMMIT: ${{ github.event.pull_request.head.sha }}");
		expect(step).toContain("PAGE_SPEED_PR: ${{ github.event.pull_request.number }}");
	});

	it("measures only after the smoke checks", () => {
		expect(workflow.indexOf("- name: Measure page speed")).toBeGreaterThan(
			workflow.indexOf("e2e:smoke"),
		);
	});
});
