#!/usr/bin/env bun
/**
 * Build the Cloudflare workers.dev origin for a preview Worker
 * (`phonaria-lab-pr-<n>` or `phonaria-lab-staging`).
 *
 * `LAB_WORKERS_DEV_SUBDOMAIN` may be the account slug (`mirdor-dev`) or the
 * full workers.dev suffix (`mirdor-dev.workers.dev`). Always emit one
 * `*.workers.dev` hostname.
 */

export function resolvePreviewOrigin(workerName: string, subdomain?: string): string {
	const name = workerName.trim();
	if (!name) {
		throw new Error("Preview Worker name is required.");
	}

	let host = (subdomain ?? "").trim();
	if (!host) {
		return `https://${name}.workers.dev`;
	}

	host = host.replace(/^https?:\/\//, "").replace(/\/+$/, "");
	while (host.endsWith(".workers.dev")) {
		host = host.slice(0, -".workers.dev".length);
	}
	host = host.replace(/\.+$/, "");

	if (!host) {
		return `https://${name}.workers.dev`;
	}

	return `https://${name}.${host}.workers.dev`;
}

function runCli(): void {
	const [workerName, subdomain] = process.argv.slice(2);
	if (!workerName) {
		throw new Error("Usage: resolve-preview-origin.ts <worker-name> [subdomain]");
	}
	process.stdout.write(`${resolvePreviewOrigin(workerName, subdomain)}\n`);
}

if (import.meta.main) {
	runCli();
}
