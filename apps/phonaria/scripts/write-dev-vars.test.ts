import { describe, expect, it } from "vitest";
import { ASSET_BUCKET_ORIGIN } from "../src/lib/security-headers";
import { buildDevVarsContents, parseDevVars } from "./write-dev-vars";

describe("write-dev-vars", () => {
	it("writes public keys from the environment", () => {
		const contents = buildDevVarsContents({
			SITE_URL: "https://phonaria-staging.example.test",
			FLAG_PRACTICE: "1",
			TURSO_DATABASE_URL: "libsql://should-not-copy.turso.io",
			TURSO_AUTH_TOKEN: "should-not-copy",
		});

		expect(contents).toContain("SITE_URL=https://phonaria-staging.example.test");
		expect(contents).toContain("FLAG_PRACTICE=1");
		expect(contents).toContain(`PUBLIC_BUCKET_URL=${ASSET_BUCKET_ORIGIN}`);
		expect(contents).not.toContain("TURSO_");
		expect(contents).not.toContain("should-not-copy");
	});

	it("lets an explicit public bucket URL override the default", () => {
		const contents = buildDevVarsContents({
			PUBLIC_BUCKET_URL: "https://assets.example.test",
		});

		expect(contents).toContain("PUBLIC_BUCKET_URL=https://assets.example.test");
		expect(contents).not.toContain(ASSET_BUCKET_ORIGIN);
	});

	it("preserves existing Turso secret lines without reading process.env", () => {
		const existing = parseDevVars(
			"SITE_URL=http://old.example\nTURSO_DATABASE_URL=libsql://lab.example\nTURSO_AUTH_TOKEN=token\n",
		);
		const contents = buildDevVarsContents({ SITE_URL: "http://localhost:3000" }, existing);

		expect(contents).toContain("SITE_URL=http://localhost:3000");
		expect(contents).toContain("TURSO_DATABASE_URL=libsql://lab.example");
		expect(contents).toContain("TURSO_AUTH_TOKEN=token");
		expect(contents).not.toContain("old.example");
	});
});
