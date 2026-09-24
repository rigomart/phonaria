#!/usr/bin/env bun
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
/**
 * Record Cloudflare Worker upload size, module count, and startup time
 * against the #200/#201 investigation guardrails.
 */
import { gzipSync } from "node:zlib";

export const GUARDRAILS = {
	uncompressedBytes: 5 * 1024 * 1024,
	gzipBytes: 1.5 * 1024 * 1024,
	modules: 75,
	startupMs: 100,
} as const;

export type WorkerMetrics = {
	uncompressedBytes: number;
	gzipBytes: number;
	modules: number;
	startupMs: number | null;
	comparedToGuardrails: {
		uncompressedBytes: "ok" | "investigate";
		gzipBytes: "ok" | "investigate";
		modules: "ok" | "investigate";
		startupMs: "ok" | "investigate" | "unavailable";
	};
};

export type WranglerUploadStats = {
	uncompressedBytes?: number;
	gzipBytes?: number;
	modules?: number;
	startupMs?: number;
};

const JS_MODULE = /\.(m?js|wasm)$/i;

export function parseWranglerOutput(output: string): WranglerUploadStats {
	const stats: WranglerUploadStats = {};
	const upload = output.match(
		/Total Upload:?\s*([\d.]+)\s*(KiB|MiB|kB|KB|MB)\s*\/ gzip:?\s*([\d.]+)\s*(KiB|MiB|kB|KB|MB)/i,
	);
	if (upload) {
		stats.uncompressedBytes = toBytes(Number(upload[1]), upload[2]);
		stats.gzipBytes = toBytes(Number(upload[3]), upload[4]);
	}
	const modules = output.match(/(\d+)\s+(?:extra\s+)?modules?/i);
	if (modules) {
		stats.modules = Number(modules[1]);
	}
	const startup = output.match(/Worker Startup Time:\s*([\d.]+)\s*ms/i);
	if (startup) {
		stats.startupMs = Number(startup[1]);
	}
	return stats;
}

export function measureWorkerDirectory(
	directory: string,
): Omit<WorkerMetrics, "comparedToGuardrails"> {
	const files = listFiles(directory).filter((file) => JS_MODULE.test(file));
	let uncompressedBytes = 0;
	let gzipBytes = 0;
	for (const file of files) {
		const contents = readFileSync(file);
		uncompressedBytes += contents.byteLength;
		gzipBytes += gzipSync(contents).byteLength;
	}
	return {
		uncompressedBytes,
		gzipBytes,
		modules: files.length,
		startupMs: null,
	};
}

export function compareToGuardrails(
	metrics: Omit<WorkerMetrics, "comparedToGuardrails">,
): WorkerMetrics["comparedToGuardrails"] {
	return {
		uncompressedBytes:
			metrics.uncompressedBytes <= GUARDRAILS.uncompressedBytes ? "ok" : "investigate",
		gzipBytes: metrics.gzipBytes <= GUARDRAILS.gzipBytes ? "ok" : "investigate",
		modules: metrics.modules <= GUARDRAILS.modules ? "ok" : "investigate",
		startupMs:
			metrics.startupMs == null
				? "unavailable"
				: metrics.startupMs <= GUARDRAILS.startupMs
					? "ok"
					: "investigate",
	};
}

export function formatWorkerMetricsReport(metrics: WorkerMetrics): string {
	const lines = [
		"Cloudflare Worker metrics vs #201 guardrails",
		`- uncompressed: ${formatMib(metrics.uncompressedBytes)} / 5.00 MiB (${metrics.comparedToGuardrails.uncompressedBytes})`,
		`- gzip: ${formatMib(metrics.gzipBytes)} / 1.50 MiB (${metrics.comparedToGuardrails.gzipBytes})`,
		`- modules: ${metrics.modules} / 75 (${metrics.comparedToGuardrails.modules})`,
		`- startup: ${metrics.startupMs == null ? "n/a (needs a real deploy)" : `${metrics.startupMs} ms`} / 100 ms (${metrics.comparedToGuardrails.startupMs})`,
	];
	return `${lines.join("\n")}\n`;
}

function toBytes(value: number, unit: string): number {
	const normalized = unit.toLowerCase();
	if (normalized === "mib" || normalized === "mb") return Math.round(value * 1024 * 1024);
	if (normalized === "kib" || normalized === "kb" || normalized === "kB".toLowerCase()) {
		return Math.round(value * 1024);
	}
	return Math.round(value);
}

function formatMib(bytes: number): string {
	return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

function listFiles(directory: string): string[] {
	const entries = readdirSync(directory, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const fullPath = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...listFiles(fullPath));
			continue;
		}
		if (entry.isFile()) files.push(fullPath);
	}
	return files;
}

function candidateDirectories(): string[] {
	return [
		resolve(import.meta.dirname, "../dist"),
		resolve(import.meta.dirname, "../.output"),
		resolve(import.meta.dirname, "../.wrangler/tmp"),
	];
}

function pickExistingDirectory(): string | undefined {
	const requested = process.env.WORKER_BUNDLE_DIR;
	if (requested && statSync(requested, { throwIfNoEntry: false })?.isDirectory()) {
		return requested;
	}
	return candidateDirectories().find((directory) =>
		Boolean(statSync(directory, { throwIfNoEntry: false })?.isDirectory()),
	);
}

function runCli(): void {
	const wranglerLog = process.env.WRANGLER_DEPLOY_LOG;
	const fromLog = wranglerLog ? parseWranglerOutput(readFileSync(wranglerLog, "utf8")) : {};
	const directory = pickExistingDirectory();
	const fromFiles = directory
		? measureWorkerDirectory(directory)
		: { uncompressedBytes: 0, gzipBytes: 0, modules: 0, startupMs: null };
	const combined = {
		uncompressedBytes: fromLog.uncompressedBytes ?? fromFiles.uncompressedBytes,
		gzipBytes: fromLog.gzipBytes ?? fromFiles.gzipBytes,
		modules: fromLog.modules ?? fromFiles.modules,
		startupMs: fromLog.startupMs ?? fromFiles.startupMs,
	};
	const metrics: WorkerMetrics = {
		...combined,
		comparedToGuardrails: compareToGuardrails(combined),
	};
	const report = formatWorkerMetricsReport(metrics);
	const outPath =
		process.env.WORKER_METRICS_OUT ?? resolve(import.meta.dirname, "../worker-metrics.json");
	mkdirSync(dirname(outPath), { recursive: true });
	writeFileSync(outPath, `${JSON.stringify({ guardrails: GUARDRAILS, metrics }, null, 2)}\n`);
	process.stdout.write(report);
	const failures = Object.values(metrics.comparedToGuardrails).filter(
		(value) => value === "investigate",
	);
	if (failures.length > 0) {
		process.exitCode = 1;
	}
}

if (import.meta.main) {
	runCli();
}
