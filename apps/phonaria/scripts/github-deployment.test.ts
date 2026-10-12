import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
	buildDeploymentRequest,
	buildStatusRequest,
	finalState,
	runLogUrl,
} from "./github-deployment";

describe("buildDeploymentRequest", () => {
	it("deploys the given ref without merging or waiting on commit statuses", () => {
		expect(buildDeploymentRequest({ ref: "abc123", environment: "staging" })).toEqual({
			ref: "abc123",
			environment: "staging",
			description: "Cloudflare Worker deploy to staging",
			auto_merge: false,
			required_contexts: [],
			transient_environment: false,
			production_environment: false,
		});
	});

	it("marks previews transient and production as production", () => {
		expect(
			buildDeploymentRequest({ ref: "feature", environment: "preview", transient: true }),
		).toMatchObject({ transient_environment: true, production_environment: false });
		expect(
			buildDeploymentRequest({ ref: "abc123", environment: "production", production: true }),
		).toMatchObject({ transient_environment: false, production_environment: true });
	});

	it("rejects a blank ref or environment", () => {
		expect(() => buildDeploymentRequest({ ref: " ", environment: "staging" })).toThrow(/ref/);
		expect(() => buildDeploymentRequest({ ref: "abc123", environment: "" })).toThrow(/environment/);
	});
});

describe("finalState", () => {
	it("maps the Actions job status to a deployment state", () => {
		expect(finalState("success")).toBe("success");
		expect(finalState("failure")).toBe("failure");
		expect(finalState("cancelled")).toBe("inactive");
		expect(finalState("")).toBe("error");
	});
});

describe("buildStatusRequest", () => {
	const logUrl = runLogUrl({
		serverUrl: "https://github.com",
		repository: "rigomart/phonaria",
		runId: "42",
	});

	it("links the Actions run", () => {
		expect(logUrl).toBe("https://github.com/rigomart/phonaria/actions/runs/42");
		expect(buildStatusRequest({ state: "in_progress", logUrl })).toEqual({
			state: "in_progress",
			log_url: logUrl,
		});
	});

	it("only points at the environment URL once the deploy succeeded", () => {
		const environmentUrl = "https://phonaria-pr-7.mirdor-dev.workers.dev";
		expect(buildStatusRequest({ state: "success", logUrl, environmentUrl })).toEqual({
			state: "success",
			log_url: logUrl,
			environment_url: environmentUrl,
		});
		expect(buildStatusRequest({ state: "failure", logUrl, environmentUrl })).toEqual({
			state: "failure",
			log_url: logUrl,
		});
	});
});

describe("deploy workflows", () => {
	const repoRoot = resolve(import.meta.dirname, "../../..");
	const readWorkflow = (name: string) =>
		readFileSync(resolve(repoRoot, ".github/workflows", name), "utf8");
	const githubExpression = (expression: string) => `\${{ ${expression} }}`;
	const finish = (url: string) =>
		`github-deployment.ts finish "${githubExpression("steps.deployment.outputs.id")}" "${githubExpression("job.status")}" "${githubExpression(url)}"`;

	it("records preview, staging, and production deploys", () => {
		const preview = readWorkflow("preview.yml");
		const staging = readWorkflow("staging.yml");
		const production = readWorkflow("production.yml");

		expect(preview).toContain("deployments: write");
		expect(preview).toContain("github-deployment.ts start preview --transient");
		expect(preview).toContain(`DEPLOYMENT_REF: ${githubExpression("github.head_ref")}`);
		expect(preview).toContain(finish("steps.origin.outputs.url"));
		expect(staging).toContain("deployments: write");
		expect(staging).toContain("github-deployment.ts start staging)");
		expect(staging).toContain(finish("steps.origin.outputs.url"));
		expect(production).toContain("deployments: write");
		expect(production).toContain("github-deployment.ts start production --production");
		expect(production).toContain(finish("steps.origin.outputs.url"));
	});

	it("marks a closed PR's preview deployments inactive", () => {
		const cleanup = readWorkflow("cleanup-preview.yml");

		expect(cleanup).toContain("deployments: write");
		expect(cleanup).toContain(
			`HEAD_REF: ${githubExpression("github.event.pull_request.head.ref")}`,
		);
		expect(cleanup).toContain("environment: 'preview'");
		expect(cleanup).toContain("state: 'inactive'");
	});
});
