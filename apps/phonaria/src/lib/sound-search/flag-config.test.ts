import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repo = resolve(import.meta.dirname, "../../../../..");
const read = (path: string) => readFileSync(resolve(repo, path), "utf8");

/**
 * The flag is baked into the bundle at build time from the build's environment,
 * so each deploy workflow must set it to match the Worker vars in wrangler.jsonc.
 */
describe("FLAG_SOUND_SEARCH build configuration", () => {
	it.each([
		[".github/workflows/staging.yml", "1"],
		[".github/workflows/preview.yml", "1"],
		[".github/workflows/production.yml", "1"],
		[".github/workflows/pull_request.yml", "1"],
	])("%s builds with the flag set to %s", (workflow, value) => {
		expect(read(workflow)).toContain(`FLAG_SOUND_SEARCH: "${value}"`);
	});

	it("defaults manual staging deploys to on, like the staging Worker", () => {
		expect(read("apps/phonaria/scripts/deploy-staging.ts")).toContain(
			'FLAG_SOUND_SEARCH: baseEnv.FLAG_SOUND_SEARCH ?? "1"',
		);
	});

	it("inlines the flag into the client and Worker bundles", () => {
		expect(read("apps/phonaria/vite.config.mts")).toContain('"process.env.FLAG_SOUND_SEARCH"');
	});
});
