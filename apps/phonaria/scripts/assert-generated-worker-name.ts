#!/usr/bin/env bun
/**
 * Read the Worker name Vite/Cloudflare flattened into the redirected
 * Wrangler config. Named environments are applied at `vite build` via
 * `CLOUDFLARE_ENV`, not by `wrangler deploy --env`.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const GENERATED_WRANGLER_JSON = "dist/server/wrangler.json";

export function readGeneratedWorkerName(wranglerJsonPath: string): string {
	const raw = readFileSync(wranglerJsonPath, "utf8");
	const parsed: unknown = JSON.parse(raw);
	if (
		typeof parsed !== "object" ||
		parsed === null ||
		!("name" in parsed) ||
		typeof parsed.name !== "string" ||
		parsed.name.length === 0
	) {
		throw new Error(`Generated Wrangler config at ${wranglerJsonPath} is missing a Worker name.`);
	}
	return parsed.name;
}

export function assertGeneratedWorkerName(actualName: string, expectedName: string): void {
	if (actualName !== expectedName) {
		throw new Error(
			`Generated Worker name is "${actualName}", expected "${expectedName}". Set CLOUDFLARE_ENV at vite build time so the redirected Wrangler config keeps the staging name.`,
		);
	}
}

function runCli(): void {
	const [expectedName, configPath] = process.argv.slice(2);
	const wranglerJsonPath = resolve(
		configPath ?? resolve(import.meta.dirname, "..", GENERATED_WRANGLER_JSON),
	);
	const actualName = readGeneratedWorkerName(wranglerJsonPath);
	if (!expectedName) {
		process.stdout.write(`${actualName}\n`);
		return;
	}
	assertGeneratedWorkerName(actualName, expectedName);
	process.stdout.write(`${actualName}\n`);
}

if (import.meta.main) {
	runCli();
}
