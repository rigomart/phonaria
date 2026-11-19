import type { Result as LighthouseResult } from "lighthouse";
import type { PageSpeedLimits } from "./page-speed-limits";

/**
 * The contrast page picks a pair word at random unless the URL names one, so
 * it is measured with `?word=pet`: every run then measures the same pair.
 */
export const PAGE_SPEED_PAGES = [
	"/",
	"/sounds/th-thin",
	"/minimal-pairs/p-b?word=pet",
	"/ipa-chart/vowels",
] as const;

export const PAGE_SPEED_RUNS = 3;

export const PAGE_SPEED_CATEGORIES = ["performance", "seo", "accessibility"] as const;

/** Previews are noindex on purpose, so this audit would hold every SEO score at about 66. */
export const PAGE_SPEED_SKIPPED_AUDITS = ["is-crawlable"];

export interface PageSpeedRun {
	performance: number | null;
	seo: number | null;
	accessibility: number | null;
	lcpMs: number | null;
	cls: number | null;
	tbtMs: number | null;
}

export const PAGE_SPEED_METRICS = [
	"performance",
	"seo",
	"accessibility",
	"lcpMs",
	"cls",
	"tbtMs",
] as const satisfies ReadonlyArray<keyof PageSpeedRun>;

export type RunOutcome = { ok: true; metrics: PageSpeedRun } | { ok: false; problem: string };

export interface PageSpeedRow {
	path: string;
	validRuns: number;
	median: PageSpeedRun;
	/** The runs that counted, in run order. */
	runs: PageSpeedRun[];
	problems: string[];
}

/**
 * Turns a Lighthouse result into the numbers the summary reports, or says why
 * the run doesn't count: Lighthouse hit an error, or the page it ended on isn't
 * the preview (Cloudflare Access sent it to its login page).
 */
export function readRun(lhr: LighthouseResult, expectedOrigin: string): RunOutcome {
	if (lhr.runtimeError) {
		return { ok: false, problem: `Lighthouse error ${lhr.runtimeError.code}` };
	}
	const finalOrigin = originOf(lhr.finalDisplayedUrl);
	if (finalOrigin !== expectedOrigin) {
		return { ok: false, problem: `ended on ${finalOrigin ?? "an unknown page"}, not the preview` };
	}
	return {
		ok: true,
		metrics: {
			performance: categoryScore(lhr, "performance"),
			seo: categoryScore(lhr, "seo"),
			accessibility: categoryScore(lhr, "accessibility"),
			lcpMs: auditValue(lhr, "largest-contentful-paint"),
			cls: auditValue(lhr, "cumulative-layout-shift"),
			tbtMs: auditValue(lhr, "total-blocking-time"),
		},
	};
}

export function summarizePage(path: string, outcomes: RunOutcome[]): PageSpeedRow {
	const runs = outcomes.flatMap((outcome) => (outcome.ok ? [outcome.metrics] : []));
	const problems = outcomes.flatMap((outcome) => (outcome.ok ? [] : [outcome.problem]));
	const pick = (key: keyof PageSpeedRun) => median(runs.map((run) => run[key]));
	return {
		path,
		validRuns: runs.length,
		runs,
		median: {
			performance: pick("performance"),
			seo: pick("seo"),
			accessibility: pick("accessibility"),
			lcpMs: pick("lcpMs"),
			cls: pick("cls"),
			tbtMs: pick("tbtMs"),
		},
		problems,
	};
}

export function median(values: Array<number | null>): number | null {
	const numbers = values.filter((value): value is number => typeof value === "number");
	if (numbers.length === 0) return null;
	const sorted = [...numbers].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** The metrics that have a limit. Performance has none: it's a weighted mix of these. */
export type LimitedMetric = "seo" | "accessibility" | "lcpMs" | "cls" | "tbtMs";

export interface LimitBreach {
	path: string;
	/** The metric past its limit, or null when the page had too few good runs to judge. */
	metric: LimitedMetric | null;
	message: string;
}

const LIMIT_CHECKS: Array<{
	metric: LimitedMetric;
	label: string;
	bound: "max" | "min";
	limit: (limits: PageSpeedLimits) => number;
	/** Formats with `digits` decimals; `digits` is the precision the limit is written in. */
	format: (value: number, digits: number) => string;
	digits: number;
}> = [
	{
		metric: "lcpMs",
		label: "LCP",
		bound: "max",
		limit: (l) => l.maxLcpMs,
		format: (v, d) => `${(v / 1000).toFixed(d)} s`,
		digits: 2,
	},
	{
		metric: "cls",
		label: "CLS",
		bound: "max",
		limit: (l) => l.maxCls,
		format: (v, d) => v.toFixed(d),
		digits: 3,
	},
	{
		metric: "tbtMs",
		label: "TBT",
		bound: "max",
		limit: (l) => l.maxTbtMs,
		format: (v, d) => `${v.toFixed(d)} ms`,
		digits: 0,
	},
	{
		metric: "seo",
		label: "SEO",
		bound: "min",
		limit: (l) => l.minSeo,
		format: (v, d) => v.toFixed(d),
		digits: 0,
	},
	{
		metric: "accessibility",
		label: "Accessibility",
		bound: "min",
		limit: (l) => l.minAccessibility,
		format: (v, d) => v.toFixed(d),
		digits: 0,
	},
];

/**
 * Compares each page's medians with its limits. A page with fewer than
 * `minRuns` good runs fails on that alone, since its medians can't be trusted.
 */
export function checkLimits(
	rows: PageSpeedRow[],
	limitsByPath: Record<string, PageSpeedLimits | undefined>,
	runsPerPage: number,
	minRuns: number,
): LimitBreach[] {
	return rows.flatMap((row): LimitBreach[] => {
		const page = `\`${row.path}\``;
		const limits = limitsByPath[row.path];
		if (!limits) {
			return [{ path: row.path, metric: null, message: `${page} has no limits set.` }];
		}
		if (row.validRuns < minRuns) {
			return [
				{
					path: row.path,
					metric: null,
					message: `${page}: only ${row.validRuns} of ${runsPerPage} runs counted, and it needs at least ${minRuns}.`,
				},
			];
		}
		return LIMIT_CHECKS.flatMap(
			({ metric, label, bound, limit, format, digits }): LimitBreach[] => {
				const value = row.median[metric];
				const allowed = limit(limits);
				const shown = () => formatPast(value ?? 0, allowed, format, digits);
				if (value === null) {
					return [
						{
							path: row.path,
							metric,
							message: `${page}: ${label} has no value from the runs that counted.`,
						},
					];
				}
				if (bound === "max" && value > allowed) {
					return [
						{
							path: row.path,
							metric,
							message: `${page}: ${label} ${shown()} is over its limit of ${format(allowed, digits)}.`,
						},
					];
				}
				if (bound === "min" && value < allowed) {
					return [
						{
							path: row.path,
							metric,
							message: `${page}: ${label} ${shown()} is under its floor of ${format(allowed, digits)}.`,
						},
					];
				}
				return [];
			},
		);
	});
}

/**
 * Adds decimals until the value no longer reads the same as its limit, so a
 * median just past it (1500.1 ms against 1500 ms) never shows as equal.
 */
function formatPast(
	value: number,
	limit: number,
	format: (value: number, digits: number) => string,
	digits: number,
): string {
	for (let d = digits; d < digits + 4; d++) {
		if (format(value, d) !== format(limit, d)) return format(value, d);
	}
	return format(value, digits + 4);
}

export function renderSummary(
	rows: PageSpeedRow[],
	origin: string,
	runsPerPage: number,
	breaches: LimitBreach[],
): string {
	const lines = [
		`### Page speed (median of ${runsPerPage} runs, mobile)`,
		"",
		`Lighthouse against ${origin}. The check fails when a page's median crosses one of its limits, set in \`packages/browser-contract/src/page-speed-limits.ts\`. Performance has no limit. SEO leaves out the crawlability check, since previews aren't meant to be indexed.`,
		"",
		"| Page | Performance | SEO | Accessibility | LCP | CLS | TBT |",
		"| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
	];
	for (const row of rows) {
		const { median: m } = row;
		const over = new Set(breaches.filter((b) => b.path === row.path).map((b) => b.metric));
		const cell = (metric: LimitedMetric, text: string) =>
			over.has(metric) ? `**${text}** ❌` : text;
		lines.push(
			`| \`${row.path}\` | ${score(m.performance)} | ${cell("seo", score(m.seo))} | ${cell("accessibility", score(m.accessibility))} | ${cell("lcpMs", seconds(m.lcpMs))} | ${cell("cls", shift(m.cls))} | ${cell("tbtMs", milliseconds(m.tbtMs))} |`,
		);
	}
	const notes = rows.flatMap((row) =>
		row.problems.length === 0
			? []
			: [
					`- \`${row.path}\`: ${row.validRuns} of ${runsPerPage} runs counted (${row.problems.join("; ")}).`,
				],
	);
	if (notes.length > 0) lines.push("", ...notes);
	if (breaches.length > 0) {
		lines.push("", "**Over the limits:**", "", ...breaches.map((b) => `- ${b.message}`));
	} else {
		lines.push("", "Every page is within its limits.");
	}
	lines.push("", "The full reports are in this run's `page-speed-reports` artifact.");
	return `${lines.join("\n")}\n`;
}

export interface PageSpeedMetric {
	median: number | null;
	/** One value per run that counted, in run order. */
	runs: Array<number | null>;
}

export interface PageSpeedMedians {
	/**
	 * The pull request's head commit, or null outside GitHub Actions. The preview
	 * is built from that commit merged into main, so the tree can differ.
	 */
	commit: string | null;
	/** The pull request number, or null outside a pull request run. */
	pullRequest: number | null;
	origin: string;
	runsPerPage: number;
	pages: Array<{
		path: string;
		validRuns: number;
		problems: string[];
		/** Scores are 0–100, LCP and TBT are milliseconds, CLS is unitless. */
		metrics: Record<keyof PageSpeedRun, PageSpeedMetric>;
	}>;
}

export interface RunSource {
	commit: string | null;
	pullRequest: number | null;
}

/**
 * Reads which commit and pull request a run belongs to. PAGE_SPEED_COMMIT and
 * PAGE_SPEED_PR take the workflow's pull request head and number; without
 * them, GITHUB_SHA is the best guess, and a local run has neither.
 */
export function runSourceFromEnv(env: Record<string, string | undefined>): RunSource {
	const pullRequest = Number(env.PAGE_SPEED_PR);
	return {
		commit: env.PAGE_SPEED_COMMIT || env.GITHUB_SHA || null,
		pullRequest: Number.isInteger(pullRequest) && pullRequest > 0 ? pullRequest : null,
	};
}

/** Reshapes the rows the summary table prints, so the file and the table share one set of numbers. */
export function buildMedians(
	rows: PageSpeedRow[],
	origin: string,
	runsPerPage: number,
	source: RunSource,
): PageSpeedMedians {
	return {
		...source,
		origin,
		runsPerPage,
		pages: rows.map((row) => ({
			path: row.path,
			validRuns: row.validRuns,
			problems: row.problems,
			metrics: Object.fromEntries(
				PAGE_SPEED_METRICS.map((key) => [
					key,
					{ median: row.median[key], runs: row.runs.map((run) => run[key]) },
				]),
			) as PageSpeedMedians["pages"][number]["metrics"],
		})),
	};
}

/**
 * Lighthouse copies the request headers it was given into the report's
 * settings, so the Access token would ship inside every saved report.
 */
export function withoutRequestHeaders(lhr: LighthouseResult): LighthouseResult {
	return { ...lhr, configSettings: { ...lhr.configSettings, extraHeaders: null } };
}

export function containsAny(text: string, secrets: string[]): boolean {
	return secrets.some((secret) => secret.length > 0 && text.includes(secret));
}

/** The query stays out of the name: artifact uploads refuse `?` in file names. */
export function reportBaseName(path: string, run: number): string {
	const route = path.split("?")[0];
	const slug = route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "-");
	return `${slug}-run-${run}`;
}

function categoryScore(lhr: LighthouseResult, id: string): number | null {
	const value = lhr.categories[id]?.score;
	return typeof value === "number" ? Math.round(value * 100) : null;
}

function auditValue(lhr: LighthouseResult, id: string): number | null {
	const value = lhr.audits[id]?.numericValue;
	return typeof value === "number" ? value : null;
}

function originOf(url: string | undefined): string | null {
	if (!url) return null;
	try {
		return new URL(url).origin;
	} catch {
		return null;
	}
}

function score(value: number | null): string {
	return value === null ? "–" : String(Math.round(value));
}

function seconds(ms: number | null): string {
	return ms === null ? "–" : `${(ms / 1000).toFixed(1)} s`;
}

function shift(value: number | null): string {
	return value === null ? "–" : value.toFixed(2);
}

function milliseconds(ms: number | null): string {
	return ms === null ? "–" : `${Math.round(ms)} ms`;
}
