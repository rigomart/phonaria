#!/usr/bin/env bun
/**
 * Write a Start/Wrangler `.dev.vars` file that contains only public Lab
 * configuration. Never copy the full process environment — that would leak
 * tokens into the prerender Worker.
 *
 * Also emit `public/_headers` so Cloudflare Static Assets attach the shared
 * CSP to prerendered HTML that does not go through Start middleware.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ASSET_BUCKET_ORIGIN, formatCloudflareHeadersFile } from "../src/lib/security-headers";

const PUBLIC_KEYS = [
	"SITE_URL",
	"SITE_INDEXING_ENABLED",
	"FLAG_PRACTICE",
	"PUBLIC_BUCKET_URL",
	"NEXT_PUBLIC_BUCKET_URL",
	"GOOGLE_SITE_VERIFICATION",
] as const;

const DEFAULTS: Partial<Record<(typeof PUBLIC_KEYS)[number], string>> = {
	PUBLIC_BUCKET_URL: ASSET_BUCKET_ORIGIN,
};

const lines = PUBLIC_KEYS.flatMap((key) => {
	const value = process.env[key] ?? DEFAULTS[key];
	return value ? [`${key}=${value}`] : [];
});

const target = resolve(import.meta.dirname, "../.dev.vars");
writeFileSync(target, `${lines.join("\n")}\n`);

const publicDir = resolve(import.meta.dirname, "../public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(resolve(publicDir, "_headers"), formatCloudflareHeadersFile());
