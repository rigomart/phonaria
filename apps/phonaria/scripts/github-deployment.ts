#!/usr/bin/env bun
/**
 * Record a Cloudflare Worker deploy as a GitHub Deployment, so previews,
 * staging, and production show up under the repository's Environments.
 *
 *   github-deployment.ts start <environment> [--transient] [--production]
 *     Create a deployment for DEPLOYMENT_REF (default GITHUB_SHA), mark it
 *     in_progress, and print its id.
 *   github-deployment.ts finish <id> <job-status> [environment-url]
 *     Map the job status (success, failure, cancelled) to a final
 *     deployment status linked to this Actions run.
 *
 * Needs GITHUB_TOKEN with `deployments: write`, plus the GITHUB_* variables
 * that Actions sets on every runner.
 */

export type DeploymentState = "in_progress" | "success" | "failure" | "error" | "inactive";

export type DeploymentRequest = {
	ref: string;
	environment: string;
	description: string;
	auto_merge: false;
	required_contexts: string[];
	transient_environment: boolean;
	production_environment: boolean;
};

export type DeploymentStatusRequest = {
	state: DeploymentState;
	log_url: string;
	environment_url?: string;
	auto_inactive?: boolean;
};

export type RunContext = {
	apiUrl: string;
	serverUrl: string;
	repository: string;
	runId: string;
};

export function buildDeploymentRequest(options: {
	ref: string;
	environment: string;
	transient?: boolean;
	production?: boolean;
}): DeploymentRequest {
	const ref = options.ref.trim();
	const environment = options.environment.trim();
	if (!ref) throw new Error("Deployment ref is required.");
	if (!environment) throw new Error("Deployment environment is required.");

	return {
		ref,
		environment,
		description: `Cloudflare Worker deploy to ${environment}`,
		// The Worker is built from this exact ref; never merge the default branch in.
		auto_merge: false,
		// Validation already gated the deploy job; do not wait on commit statuses.
		required_contexts: [],
		transient_environment: options.transient ?? false,
		production_environment: options.production ?? false,
	};
}

export function finalState(jobStatus: string): DeploymentState {
	switch (jobStatus.trim().toLowerCase()) {
		case "success":
			return "success";
		case "failure":
			return "failure";
		// A newer push cancelled this run; its deployment never went live.
		case "cancelled":
			return "inactive";
		default:
			return "error";
	}
}

export function runLogUrl(context: Pick<RunContext, "serverUrl" | "repository" | "runId">): string {
	return `${context.serverUrl}/${context.repository}/actions/runs/${context.runId}`;
}

export function buildStatusRequest(options: {
	state: DeploymentState;
	logUrl: string;
	environmentUrl?: string;
}): DeploymentStatusRequest {
	const request: DeploymentStatusRequest = { state: options.state, log_url: options.logUrl };
	const environmentUrl = options.environmentUrl?.trim();
	if (environmentUrl && options.state === "success") {
		request.environment_url = environmentUrl;
	}
	return request;
}

async function githubRequest<T>(
	context: RunContext,
	token: string,
	path: string,
	body: unknown,
): Promise<T> {
	const response = await fetch(`${context.apiUrl}/repos/${context.repository}${path}`, {
		method: "POST",
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			"X-GitHub-Api-Version": "2022-11-28",
		},
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		throw new Error(`GitHub ${path} failed with ${response.status}: ${await response.text()}`);
	}
	return (await response.json()) as T;
}

function requireEnv(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) throw new Error(`${name} is required.`);
	return value;
}

function readRunContext(): RunContext {
	return {
		apiUrl: process.env.GITHUB_API_URL?.trim() || "https://api.github.com",
		serverUrl: process.env.GITHUB_SERVER_URL?.trim() || "https://github.com",
		repository: requireEnv("GITHUB_REPOSITORY"),
		runId: requireEnv("GITHUB_RUN_ID"),
	};
}

async function runCli(): Promise<void> {
	const [command, ...args] = process.argv.slice(2);
	const token = requireEnv("GITHUB_TOKEN");
	const context = readRunContext();
	const logUrl = runLogUrl(context);

	if (command === "start") {
		const flags = new Set(args.filter((arg) => arg.startsWith("--")));
		const [environment] = args.filter((arg) => !arg.startsWith("--"));
		if (!environment) {
			throw new Error(
				"Usage: github-deployment.ts start <environment> [--transient] [--production]",
			);
		}
		const deployment = await githubRequest<{ id: number }>(
			context,
			token,
			"/deployments",
			buildDeploymentRequest({
				ref: process.env.DEPLOYMENT_REF?.trim() || requireEnv("GITHUB_SHA"),
				environment,
				transient: flags.has("--transient"),
				production: flags.has("--production"),
			}),
		);
		await githubRequest(
			context,
			token,
			`/deployments/${deployment.id}/statuses`,
			buildStatusRequest({ state: "in_progress", logUrl }),
		);
		process.stdout.write(`${deployment.id}\n`);
		return;
	}

	if (command === "finish") {
		const [id, jobStatus, environmentUrl] = args;
		if (!id || !jobStatus) {
			throw new Error("Usage: github-deployment.ts finish <id> <job-status> [environment-url]");
		}
		const state = finalState(jobStatus);
		await githubRequest(
			context,
			token,
			`/deployments/${id}/statuses`,
			buildStatusRequest({ state, logUrl, environmentUrl }),
		);
		process.stdout.write(`Deployment ${id}: ${state}\n`);
		return;
	}

	throw new Error("Usage: github-deployment.ts <start|finish> ...");
}

if (import.meta.main) {
	await runCli();
}
