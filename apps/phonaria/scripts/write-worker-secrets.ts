#!/usr/bin/env bun
/**
 * Write the Worker secrets present in the environment to a JSON file for
 * `wrangler deploy --secrets-file`, so they ship with the deployed version.
 * This replaces a separate `wrangler secret put` step for each secret. Adding
 * a secret means adding its name to `WORKER_SECRET_KEYS` and to the deploy
 * job's `env`.
 *
 * Unset or empty secrets are left out. `--secrets-file` is additive, so the
 * Worker keeps any value it already has, and a missing optional secret (such
 * as the OpenRouter key) never fails a deploy.
 *
 * The file lands in the gitignored `.wrangler/` of the ephemeral CI runner and
 * holds nothing but these values.
 */
import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** Every request-time secret the Worker reads. `write-dev-vars` preserves the same keys locally. */
export const WORKER_SECRET_KEYS = [
	"TURSO_DATABASE_URL",
	"TURSO_AUTH_TOKEN",
	"OPENROUTER_API_KEY",
] as const;

export const WORKER_SECRETS_FILE = ".wrangler/worker-secrets.json";

export function buildWorkerSecrets(env: NodeJS.ProcessEnv): {
	secrets: Record<string, string>;
	skipped: string[];
} {
	const secrets: Record<string, string> = {};
	const skipped: string[] = [];
	for (const key of WORKER_SECRET_KEYS) {
		const value = env[key]?.trim();
		if (value) secrets[key] = value;
		else skipped.push(key);
	}
	return { secrets, skipped };
}

function writeWorkerSecrets(appRoot = resolve(import.meta.dirname, "..")): void {
	const { secrets, skipped } = buildWorkerSecrets(process.env);
	const target = resolve(appRoot, WORKER_SECRETS_FILE);
	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(target, JSON.stringify(secrets), { mode: 0o600 });
	chmodSync(target, 0o600);

	const written = Object.keys(secrets);
	console.log(`Worker secrets: ${written.length > 0 ? written.join(", ") : "none"}`);
	if (skipped.length > 0) console.log(`Not set, left unchanged: ${skipped.join(", ")}`);
}

if (import.meta.main) {
	writeWorkerSecrets();
}
