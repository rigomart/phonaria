#!/usr/bin/env bun

import { spawnSync } from "node:child_process";
import { resolveStagingOrigin, STAGING_WORKER_NAME } from "./resolve-staging-origin";

export type DeploymentCommand = {
	command: string;
	args: string[];
	env: NodeJS.ProcessEnv;
};

export type DeployStartStagingOptions = {
	baseEnv?: NodeJS.ProcessEnv;
	override?: string;
	subdomain?: string;
	wranglerArgs?: string[];
};

type CommandRunner = (command: DeploymentCommand) => void;

function runCommand({ command, args, env }: DeploymentCommand): void {
	const result = spawnSync(command, args, { env, stdio: "inherit" });
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(`${command} exited with status ${result.status ?? "unknown"}.`);
	}
}

export function deployStartStaging(
	{ baseEnv = process.env, override, subdomain, wranglerArgs = [] }: DeployStartStagingOptions = {},
	run: CommandRunner = runCommand,
): void {
	if (wranglerArgs.some((argument) => argument === "--name" || argument.startsWith("--name="))) {
		throw new Error("Worker name comes from wrangler.jsonc; --name overrides are not allowed.");
	}

	const siteUrl = resolveStagingOrigin(override, subdomain);
	const env = {
		...baseEnv,
		CLOUDFLARE_ENV: "staging",
		SITE_URL: siteUrl,
	};

	run({ command: "bun", args: ["./scripts/write-start-dev-vars.ts"], env });
	run({ command: "vite", args: ["build"], env });
	run({
		command: "bun",
		args: ["./scripts/assert-generated-worker-name.ts", STAGING_WORKER_NAME],
		env,
	});
	run({
		command: "wrangler",
		args: ["deploy", "--var", `SITE_URL:${siteUrl}`, ...wranglerArgs],
		env,
	});
}

if (import.meta.main) {
	deployStartStaging({
		override: process.env.LAB_START_STAGING_URL,
		subdomain: process.env.LAB_WORKERS_DEV_SUBDOMAIN,
		wranglerArgs: process.argv.slice(2),
	});
}
