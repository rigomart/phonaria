import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repo = resolve(import.meta.dirname, "../../../../..");
const read = (path: string) => readFileSync(resolve(repo, path), "utf8");

/**
 * The flag is baked into the bundle at build time from the build's environment,
 * so each deploy workflow must set it to match the Worker vars in wrangler.jsonc.
 */
describe("FLAG_SPEECH build configuration", () => {
	it.each([
		[".github/workflows/staging.yml", "1"],
		[".github/workflows/preview.yml", "1"],
		[".github/workflows/production.yml", "0"],
		[".github/workflows/pull_request.yml", "0"],
	])("%s builds with the flag set to %s", (workflow, value) => {
		expect(read(workflow)).toContain(`FLAG_SPEECH: "${value}"`);
	});

	it("defaults manual staging deploys to on, like the staging Worker", () => {
		expect(read("apps/phonaria/scripts/deploy-staging.ts")).toContain(
			'FLAG_SPEECH: baseEnv.FLAG_SPEECH ?? "1"',
		);
	});

	it("inlines the flag into the client and Worker bundles", () => {
		expect(read("apps/phonaria/vite.config.mts")).toContain('"process.env.FLAG_SPEECH"');
	});

	it("passes the Azure secrets to staging and preview deploys only", () => {
		for (const workflow of [".github/workflows/staging.yml", ".github/workflows/preview.yml"]) {
			expect(read(workflow)).toContain("AZURE_SPEECH_KEY: ${{ secrets.AZURE_SPEECH_KEY }}");
			expect(read(workflow)).toContain("AZURE_SPEECH_REGION: ${{ secrets.AZURE_SPEECH_REGION }}");
		}
		expect(read(".github/workflows/production.yml")).not.toContain("AZURE_SPEECH");
	});
});
