#!/usr/bin/env bun
/**
 * Write a Start/Wrangler `.dev.vars` file that contains only public application
 * configuration. Never copy the full process environment — that would leak
 * tokens into the prerender Worker.
 *
 * Existing Worker secret lines (`WORKER_SECRET_KEYS`) are preserved so local `dev:start` can keep
 * request-time bindings that were added manually. Those keys are never copied
 * from `process.env`.
 *
 * Also emit `public/_headers` so Cloudflare Static Assets attach the shared
 * CSP to prerendered HTML that does not go through Start middleware.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ASSET_BUCKET_ORIGIN, formatCloudflareHeadersFile } from "../src/lib/security-headers";
import { WORKER_SECRET_KEYS } from "./write-worker-secrets";

export const PUBLIC_KEYS = [
	"SITE_URL",
	"SITE_INDEXING_ENABLED",
	"FLAG_PRACTICE",
	"FLAG_SPELLING_CONTEXT",
	"PUBLIC_BUCKET_URL",
	"GOOGLE_SITE_VERIFICATION",
] as const;

export const PRESERVED_SECRET_KEYS = WORKER_SECRET_KEYS;

const DEFAULTS: Partial<Record<(typeof PUBLIC_KEYS)[number], string>> = {
	PUBLIC_BUCKET_URL: ASSET_BUCKET_ORIGIN,
};

export function parseDevVars(contents: string): Record<string, string> {
	const values: Record<string, string> = {};
	for (const line of contents.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const separator = trimmed.indexOf("=");
		if (separator <= 0) continue;
		const key = trimmed.slice(0, separator);
		const value = trimmed.slice(separator + 1);
		values[key] = value;
	}
	return values;
}

export function buildDevVarsContents(
	env: NodeJS.ProcessEnv,
	existing: Record<string, string> = {},
): string {
	const lines = PUBLIC_KEYS.flatMap((key) => {
		const value = env[key] ?? DEFAULTS[key];
		return value ? [`${key}=${value}`] : [];
	});

	for (const key of PRESERVED_SECRET_KEYS) {
		const value = existing[key];
		if (value) {
			lines.push(`${key}=${value}`);
		}
	}

	return `${lines.join("\n")}\n`;
}

function writeStartDevVars(labRoot = resolve(import.meta.dirname, "..")): void {
	const target = resolve(labRoot, ".dev.vars");
	const existing = existsSync(target) ? parseDevVars(readFileSync(target, "utf8")) : {};
	writeFileSync(target, buildDevVarsContents(process.env, existing));

	const publicDir = resolve(labRoot, "public");
	mkdirSync(publicDir, { recursive: true });
	writeFileSync(resolve(publicDir, "_headers"), formatCloudflareHeadersFile());
}

if (import.meta.main) {
	writeStartDevVars();
}
