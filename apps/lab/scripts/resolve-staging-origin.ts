#!/usr/bin/env bun
/**
 * Stable staging origin for Lab Start.
 *
 * Prefer `LAB_START_STAGING_URL` when it is the real workers.dev host.
 * The wrangler default `https://phonaria-lab-staging.workers.dev` is a
 * placeholder and must be rewritten with the account subdomain.
 */
import { resolvePreviewOrigin } from "./resolve-preview-origin";

export const STAGING_WORKER_NAME = "phonaria-lab-staging";
export const PLACEHOLDER_STAGING_ORIGIN = "https://phonaria-lab-staging.workers.dev";

export function resolveStagingOrigin(override?: string, subdomain?: string): string {
	const trimmed = (override ?? "").trim().replace(/\/+$/, "");
	if (trimmed && trimmed !== PLACEHOLDER_STAGING_ORIGIN) {
		return trimmed;
	}
	return resolvePreviewOrigin(STAGING_WORKER_NAME, subdomain);
}

function runCli(): void {
	const [override, subdomain] = process.argv.slice(2);
	process.stdout.write(`${resolveStagingOrigin(override, subdomain)}\n`);
}

if (import.meta.main) {
	runCli();
}
