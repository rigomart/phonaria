import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../../..");

function readWorkflow(name: string): string {
	return readFileSync(resolve(repoRoot, ".github/workflows", name), "utf8");
}

function githubExpression(expression: string): string {
	return `\${{ ${expression} }}`;
}

describe("Cloudflare preview cleanup workflow", () => {
	it("shares a PR-scoped concurrency group with preview deployment", () => {
		const deployWorkflow = readWorkflow("lab-start.yml");
		const cleanupWorkflow = readWorkflow("cleanup-preview.yml");
		const pullRequestNumber = githubExpression("github.event.pull_request.number");
		const group = `lab-start-${githubExpression("github.event.pull_request.number || github.ref")}`;

		expect(deployWorkflow).toContain(`group: ${group}`);
		expect(cleanupWorkflow).toContain(`group: lab-start-${pullRequestNumber}`);
	});

	it("deletes only the closed PR Worker and treats an absent Worker as clean", () => {
		const workflow = readWorkflow("cleanup-preview.yml");

		expect(workflow).toContain("types: [closed]");
		expect(workflow).toContain(
			`WORKER_NAME: phonaria-lab-pr-${githubExpression("github.event.pull_request.number")}`,
		);
		expect(workflow).toContain("/workers/scripts/$WORKER_NAME?force=true");
		expect(workflow).toMatch(/404\)\s+echo "\$WORKER_NAME was already absent\."/);
		expect(workflow).not.toContain("actions/checkout");
		expect(workflow).not.toContain("--env preview");
	});
});
