import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";
import { clientHitFixtureIntent, serverHitFixtureIntent } from "./baseline-fixtures";
import type { ContractTarget } from "./constants";
import { BASELINE_RUNS, REGRESSION_THRESHOLD_PERCENT } from "./constants";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const COMMITTED_BASELINE_DIR = join(PACKAGE_ROOT, "baselines");

export interface TimingSummary {
	samplesMs: number[];
	medianMs: number;
	p95Ms: number;
}

export interface TranscriptionLaneTimings {
	client: TimingSummary;
	server: TimingSummary;
}

export interface BaselineRecord {
	target: string;
	baseUrl: string;
	collectedAt: string;
	regressionThresholdPercent: number;
	conditions: {
		browser: string;
		viewport: string;
		runs: number;
		pageLoad: string;
		transcriptionClient: string;
		transcriptionServer: string;
	};
	coldPageLoadMs: number;
	pageLoad: TimingSummary;
	transcription: TranscriptionLaneTimings;
}

export function summarize(samplesMs: number[]): TimingSummary {
	if (samplesMs.length === 0) {
		throw new Error("Cannot summarize an empty timing sample set.");
	}
	const sorted = [...samplesMs].sort((a, b) => a - b);
	return {
		samplesMs: samplesMs.map(roundMs),
		medianMs: roundMs(percentile(sorted, 50)),
		p95Ms: roundMs(percentile(sorted, 95)),
	};
}

function roundMs(value: number): number {
	return Math.round(value * 10) / 10;
}

export function committedBaselinePath(targetName: string): string {
	return join(COMMITTED_BASELINE_DIR, `${targetName}.json`);
}

export function readCommittedBaseline(targetName: string): BaselineRecord | null {
	try {
		return JSON.parse(readFileSync(committedBaselinePath(targetName), "utf8")) as BaselineRecord;
	} catch {
		return null;
	}
}

export function writeBaselineRecord(path: string, record: BaselineRecord): void {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(record, null, "\t")}\n`);
}

export function hasTranscriptionLanes(
	transcription: unknown,
): transcription is TranscriptionLaneTimings {
	if (typeof transcription !== "object" || transcription === null) return false;
	if (!("client" in transcription) || !("server" in transcription)) return false;
	const client = (transcription as TranscriptionLaneTimings).client;
	const server = (transcription as TranscriptionLaneTimings).server;
	return typeof client?.medianMs === "number" && typeof server?.medianMs === "number";
}

export function comparisonNotes(
	current: BaselineRecord,
	previous: BaselineRecord | null,
): string[] {
	if (!previous) {
		return ["No committed baseline exists yet; this run is the first recorded sample set."];
	}

	const notes = [
		deltaNote("cold page load", current.coldPageLoadMs, previous.coldPageLoadMs),
		deltaNote("warm page load", current.pageLoad.medianMs, previous.pageLoad.medianMs),
	];

	if (
		!hasTranscriptionLanes(previous.transcription) ||
		!hasTranscriptionLanes(current.transcription)
	) {
		notes.push(
			"Committed transcription baseline is not split into client and server lanes; lane comparison skipped.",
		);
		return notes;
	}

	notes.push(
		deltaNote(
			"transcription client",
			current.transcription.client.medianMs,
			previous.transcription.client.medianMs,
		),
		deltaNote(
			"transcription server",
			current.transcription.server.medianMs,
			previous.transcription.server.medianMs,
		),
	);
	return notes;
}

export async function measurePageLoadMs(page: Page, path: string): Promise<number> {
	const started = Date.now();
	await page.goto(path, { waitUntil: "load" });
	return Date.now() - started;
}

export async function measureTranscriptionMs(
	page: Page,
	fill: (page: Page) => Promise<void>,
	waitForResult: (page: Page) => Promise<void>,
): Promise<number> {
	await fill(page);
	const started = Date.now();
	await waitForResult(page);
	return Date.now() - started;
}

export function createBaselineRecord(
	target: ContractTarget,
	coldPageLoadMs: number,
	pageLoadSamples: number[],
	clientTranscriptionSamples: number[],
	serverTranscriptionSamples: number[],
): BaselineRecord {
	return {
		target: target.name,
		baseUrl: target.baseUrl,
		collectedAt: new Date().toISOString(),
		regressionThresholdPercent: REGRESSION_THRESHOLD_PERCENT,
		conditions: {
			browser: "chromium",
			viewport: "1280x720",
			runs: BASELINE_RUNS,
			pageLoad:
				"One cold navigation of `/`, then five warm navigations, measured as wall-clock time around page.goto({ waitUntil: 'load' }).",
			transcriptionClient: clientHitFixtureIntent(),
			transcriptionServer: serverHitFixtureIntent(),
		},
		coldPageLoadMs: roundMs(coldPageLoadMs),
		pageLoad: summarize(pageLoadSamples),
		transcription: {
			client: summarize(clientTranscriptionSamples),
			server: summarize(serverTranscriptionSamples),
		},
	};
}

function percentile(sorted: number[], pct: number): number {
	if (sorted.length === 1) return sorted[0] ?? 0;
	const index = Math.min(sorted.length - 1, Math.ceil((pct / 100) * sorted.length) - 1);
	return sorted[index] ?? 0;
}

function deltaNote(label: string, current: number, previous: number): string {
	const delta = previous === 0 ? 0 : ((current - previous) / previous) * 100;
	const direction = delta > 0 ? "slower" : "faster";
	return `${label} median ${current.toFixed(0)}ms vs committed ${previous.toFixed(0)}ms (${Math.abs(delta).toFixed(1)}% ${direction}; investigate above ${REGRESSION_THRESHOLD_PERCENT}%).`;
}
