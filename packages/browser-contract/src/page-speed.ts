import type { Result as LighthouseResult } from "lighthouse";

export const PAGE_SPEED_PAGES = [
	"/",
	"/sounds/th-thin",
	"/minimal-pairs/p-b",
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

export type RunOutcome = { ok: true; metrics: PageSpeedRun } | { ok: false; problem: string };

export interface PageSpeedRow {
	path: string;
	validRuns: number;
	median: PageSpeedRun;
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

export function renderSummary(rows: PageSpeedRow[], origin: string, runsPerPage: number): string {
	const lines = [
		`### Page speed (median of ${runsPerPage} runs, mobile)`,
		"",
		`Lighthouse against ${origin}. Report only: these numbers never fail the check. SEO leaves out the crawlability check, since previews aren't meant to be indexed.`,
		"",
		"| Page | Performance | SEO | Accessibility | LCP | CLS | TBT |",
		"| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
	];
	for (const row of rows) {
		const { median: m } = row;
		lines.push(
			`| \`${row.path}\` | ${score(m.performance)} | ${score(m.seo)} | ${score(m.accessibility)} | ${seconds(m.lcpMs)} | ${shift(m.cls)} | ${milliseconds(m.tbtMs)} |`,
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
	lines.push("", "The full reports are in this run's `page-speed-reports` artifact.");
	return `${lines.join("\n")}\n`;
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

export function reportBaseName(path: string, run: number): string {
	const slug = path === "/" ? "home" : path.replace(/^\//, "").replaceAll("/", "-");
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
