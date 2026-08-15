import { afterEach, beforeEach, describe, expect, it } from "vitest";
import robots from "./robots";

beforeEach(() => {
	process.env.SITE_URL = "https://phonaria.rigos.dev";
});

afterEach(() => {
	delete process.env.SITE_URL;
	delete process.env.SITE_INDEXING_ENABLED;
});

describe("robots", () => {
	it("allows crawling and points at the sitemap when indexing is enabled", () => {
		process.env.SITE_INDEXING_ENABLED = "1";
		const result = robots();
		expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
		expect(result.sitemap).toBe("https://phonaria.rigos.dev/sitemap.xml");
	});

	it("still allows crawling when indexing is disabled, so the noindex tag is seen", () => {
		const result = robots();
		expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
		expect(JSON.stringify(result)).not.toContain("disallow");
	});

	it("omits the sitemap when indexing is disabled", () => {
		process.env.SITE_INDEXING_ENABLED = "false";
		expect(robots().sitemap).toBeUndefined();
	});
});
