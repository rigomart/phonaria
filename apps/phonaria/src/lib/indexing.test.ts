import { afterEach, describe, expect, it } from "vitest";
import { formatRobotsTxt, getRobotsPolicy, getSitemapUrls } from "./indexing";

afterEach(() => {
	delete process.env.SITE_URL;
	delete process.env.SITE_INDEXING_ENABLED;
});

describe("indexing helpers", () => {
	it("omits the sitemap when indexing is off", () => {
		process.env.SITE_URL = "https://phonaria-lab.rigos.dev";
		const policy = getRobotsPolicy();
		expect(policy.rules).toEqual({ userAgent: "*", allow: "/" });
		expect(policy.sitemap).toBeUndefined();
		expect(formatRobotsTxt(policy).toLowerCase()).not.toContain("sitemap");
		expect(formatRobotsTxt(policy).toLowerCase()).not.toContain("disallow");
	});

	it("lists the indexable application URLs and omits Practice", () => {
		process.env.SITE_URL = "https://phonaria-lab.rigos.dev";
		expect(getSitemapUrls()).toEqual([
			"https://phonaria-lab.rigos.dev",
			"https://phonaria-lab.rigos.dev/ipa-chart/consonants",
			"https://phonaria-lab.rigos.dev/ipa-chart/vowels",
			"https://phonaria-lab.rigos.dev/credits",
		]);
	});
});
