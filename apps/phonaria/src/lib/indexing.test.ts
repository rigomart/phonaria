import { afterEach, describe, expect, it } from "vitest";
import { formatRobotsTxt, getIndexablePaths, getRobotsPolicy, getSitemapUrls } from "./indexing";

afterEach(() => {
	delete process.env.SITE_URL;
	delete process.env.SITE_INDEXING_ENABLED;
	delete process.env.FLAG_LANGUAGE_SPREAD;
});

describe("indexing helpers", () => {
	it("omits the sitemap when indexing is off", () => {
		process.env.SITE_URL = "https://phonaria.rigos.dev";
		const policy = getRobotsPolicy();
		expect(policy.rules).toEqual({ userAgent: "*", allow: "/" });
		expect(policy.sitemap).toBeUndefined();
		expect(formatRobotsTxt(policy).toLowerCase()).not.toContain("sitemap");
		expect(formatRobotsTxt(policy).toLowerCase()).not.toContain("disallow");
	});

	it("links the sitemap when indexing is on", () => {
		process.env.SITE_URL = "https://phonaria.rigos.dev";
		process.env.SITE_INDEXING_ENABLED = "1";
		expect(formatRobotsTxt()).toContain("Sitemap: https://phonaria.rigos.dev/sitemap.xml");
	});

	it("lists the indexable application URLs and omits Practice", () => {
		process.env.SITE_URL = "https://phonaria.rigos.dev";
		process.env.FLAG_LANGUAGE_SPREAD = "0";
		expect(getSitemapUrls()).toEqual([
			"https://phonaria.rigos.dev",
			"https://phonaria.rigos.dev/ipa-chart/consonants",
			"https://phonaria.rigos.dev/ipa-chart/vowels",
			"https://phonaria.rigos.dev/ipa-chart/frequency",
			"https://phonaria.rigos.dev/credits",
		]);
	});

	it("adds Language Spread only when its flag is on", () => {
		expect(getIndexablePaths({ languageSpread: true })).toContain("/language-spread");
		expect(getIndexablePaths({ languageSpread: false })).not.toContain("/language-spread");
	});

	it("reads the Language Spread flag from the environment by default", () => {
		process.env.SITE_URL = "https://phonaria.rigos.dev";
		process.env.FLAG_LANGUAGE_SPREAD = "1";
		expect(getSitemapUrls()).toContain("https://phonaria.rigos.dev/language-spread");
		process.env.FLAG_LANGUAGE_SPREAD = "0";
		expect(getSitemapUrls()).not.toContain("https://phonaria.rigos.dev/language-spread");
	});
});
