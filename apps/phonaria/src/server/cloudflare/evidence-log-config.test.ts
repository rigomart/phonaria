import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseConfigFileTextToJson } from "typescript";
import { describe, expect, it } from "vitest";

type WranglerEnvironment = {
	main?: string;
	triggers?: { crons?: string[] };
	ratelimits?: { name: string; namespace_id: string; simple: { limit: number; period: number } }[];
};

const repo = resolve(import.meta.dirname, "../../../../..");
const read = (path: string) => readFileSync(resolve(repo, path), "utf8");
const configPath = resolve(repo, "apps/phonaria/wrangler.jsonc");
const parsed = parseConfigFileTextToJson(configPath, readFileSync(configPath, "utf8"));
if (parsed.error) throw new Error("wrangler.jsonc could not be parsed");
const config = parsed.config as WranglerEnvironment & {
	env: Record<"staging" | "preview" | "production", WranglerEnvironment>;
};

describe("evidence log Worker configuration", () => {
	it("rate limits logging at 20 a minute in local and every deployed environment", () => {
		for (const environment of [config, ...Object.values(config.env)]) {
			expect(
				environment.ratelimits?.find(({ name }) => name === "EVIDENCE_LOG_RATE_LIMIT"),
			).toMatchObject({ simple: { limit: 20, period: 60 } });
		}
	});

	it("starts from the entry that also handles the pruning Cron Trigger", () => {
		expect(config.main).toBe("./src/server.ts");
	});

	it("prunes daily wherever the evidence log can be written, and nowhere else", () => {
		expect(config.env.staging.triggers?.crons).toEqual(["17 3 * * *"]);
		expect(config.env.production.triggers?.crons).toEqual(["17 3 * * *"]);
		expect(config.env.preview.triggers).toBeUndefined();
		expect(config.triggers).toBeUndefined();
	});

	it("passes the evidence log secrets to staging deploys only", () => {
		const secrets = [
			"EVIDENCE_LOG_DATABASE_URL: ${{ secrets.EVIDENCE_LOG_DATABASE_URL }}",
			"EVIDENCE_LOG_AUTH_TOKEN: ${{ secrets.EVIDENCE_LOG_AUTH_TOKEN }}",
		];
		for (const secret of secrets) expect(read(".github/workflows/staging.yml")).toContain(secret);
		for (const workflow of ["preview.yml", "production.yml", "pull_request.yml"]) {
			expect(read(`.github/workflows/${workflow}`)).not.toContain("EVIDENCE_LOG");
		}
	});
});
