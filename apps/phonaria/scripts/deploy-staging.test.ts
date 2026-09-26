import { describe, expect, it } from "vitest";
import { type DeploymentCommand, deployStaging } from "./deploy-staging";

describe("deployStaging", () => {
	it("builds and deploys the staging config with the account-scoped origin", () => {
		const commands: DeploymentCommand[] = [];

		deployStaging(
			{
				baseEnv: { SITE_INDEXING_ENABLED: "0" },
				subdomain: "mirdor-dev",
				wranglerArgs: ["--dry-run"],
			},
			(command) => commands.push(command),
		);

		const siteUrl = "https://phonaria-staging.mirdor-dev.workers.dev";
		expect(commands).toEqual([
			{
				command: "bun",
				args: ["./scripts/write-dev-vars.ts"],
				env: {
					SITE_INDEXING_ENABLED: "0",
					CLOUDFLARE_ENV: "staging",
					SITE_URL: siteUrl,
				},
			},
			{
				command: "vite",
				args: ["build"],
				env: {
					SITE_INDEXING_ENABLED: "0",
					CLOUDFLARE_ENV: "staging",
					SITE_URL: siteUrl,
				},
			},
			{
				command: "bun",
				args: ["./scripts/assert-generated-worker-name.ts", "phonaria-staging"],
				env: {
					SITE_INDEXING_ENABLED: "0",
					CLOUDFLARE_ENV: "staging",
					SITE_URL: siteUrl,
				},
			},
			{
				command: "wrangler",
				args: ["deploy", "--var", `SITE_URL:${siteUrl}`, "--dry-run"],
				env: {
					SITE_INDEXING_ENABLED: "0",
					CLOUDFLARE_ENV: "staging",
					SITE_URL: siteUrl,
				},
			},
		]);
		expect(commands.at(-1)?.args).not.toContain("--name");
	});

	it("reads STAGING_URL from the environment", () => {
		const commands: DeploymentCommand[] = [];

		deployStaging(
			{
				baseEnv: {
					STAGING_URL: "https://phonaria-staging.mirdor-dev.workers.dev",
				},
			},
			(command) => commands.push(command),
		);

		expect(commands[0]?.env.SITE_URL).toBe("https://phonaria-staging.mirdor-dev.workers.dev");
	});

	it.each([
		["--name", "another-worker"],
		["--name=another-worker"],
	])("rejects a Wrangler name override before running commands: %j", (...wranglerArgs) => {
		const commands: DeploymentCommand[] = [];

		expect(() =>
			deployStaging({ subdomain: "mirdor-dev", wranglerArgs }, (command) => commands.push(command)),
		).toThrow(/Worker name comes from wrangler.jsonc/);
		expect(commands).toEqual([]);
	});
});
