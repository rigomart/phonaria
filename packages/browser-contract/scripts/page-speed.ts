#!/usr/bin/env bun
/**
 * Runs Lighthouse with its default mobile settings against a few pages of a
 * deployed target and writes a summary table plus every run's report.
 * Report only: it exits 0 whatever the numbers are, so it never fails a check.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import * as chromeLauncher from "chrome-launcher";
import lighthouse, { generateReport } from "lighthouse";
import {
	containsAny,
	PAGE_SPEED_CATEGORIES,
	PAGE_SPEED_PAGES,
	PAGE_SPEED_RUNS,
	PAGE_SPEED_SKIPPED_AUDITS,
	type PageSpeedRow,
	readRun,
	renderSummary,
	reportBaseName,
	type RunOutcome,
	summarizePage,
	withoutRequestHeaders,
} from "../src/page-speed";
import { extraHttpHeaders, loadTargetFromEnv } from "../src/target";

const outDir = resolve(process.env.PAGE_SPEED_OUT_DIR || "page-speed-reports");
const target = loadTargetFromEnv();
const headers = extraHttpHeaders(target);
const headerValues = Object.values(headers);
const origin = new URL(target.baseUrl).origin;

mkdirSync(outDir, { recursive: true });

const rows: PageSpeedRow[] = [];
for (const path of PAGE_SPEED_PAGES) {
	const outcomes: RunOutcome[] = [];
	for (let run = 1; run <= PAGE_SPEED_RUNS; run++) {
		console.log(`Lighthouse ${path} run ${run} of ${PAGE_SPEED_RUNS}`);
		outcomes.push(await measure(path, run));
	}
	rows.push(summarizePage(path, outcomes));
}

const summary = renderSummary(rows, origin, PAGE_SPEED_RUNS);
writeFileSync(join(outDir, "summary.md"), summary);
if (process.env.GITHUB_STEP_SUMMARY) {
	writeFileSync(process.env.GITHUB_STEP_SUMMARY, summary, { flag: "a" });
}
console.log(summary);

async function measure(path: string, run: number): Promise<RunOutcome> {
	let chrome: chromeLauncher.LaunchedChrome | undefined;
	let result: Awaited<ReturnType<typeof lighthouse>>;
	try {
		chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
		result = await lighthouse(`${origin}${path}`, {
			port: chrome.port,
			logLevel: "error",
			onlyCategories: [...PAGE_SPEED_CATEGORIES],
			skipAudits: PAGE_SPEED_SKIPPED_AUDITS,
			extraHeaders: headers,
		});
	} catch (error) {
		return { ok: false, problem: `run failed: ${describe(error)}` };
	} finally {
		chrome?.kill();
	}
	if (!result) return { ok: false, problem: "Lighthouse returned no result" };
	try {
		saveReports(path, run, result.lhr);
	} catch (error) {
		console.log(`::warning::Couldn't save the ${path} run ${run} report: ${describe(error)}`);
	}
	return readRun(result.lhr, origin);
}

function saveReports(path: string, run: number, lhr: Parameters<typeof withoutRequestHeaders>[0]) {
	const clean = withoutRequestHeaders(lhr);
	const json = JSON.stringify(clean, null, 2);
	const html = generateReport(clean, "html");
	if (containsAny(json, headerValues) || containsAny(html, headerValues)) {
		console.log(
			`::warning::Skipped saving the ${path} run ${run} report: it still held the Access token.`,
		);
		return;
	}
	const base = join(outDir, reportBaseName(path, run));
	writeFileSync(`${base}.json`, json);
	writeFileSync(`${base}.html`, html);
}

function describe(error: unknown): string {
	const message = (error instanceof Error ? error.message : String(error)).replace(/\s+/g, " ");
	return containsAny(message, headerValues) ? "an error that mentioned the Access token" : message;
}
