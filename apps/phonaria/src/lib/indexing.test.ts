import { afterEach, describe, expect, it } from "vitest";
import { formatRobotsTxt, getRobotsPolicy, getSitemapUrls } from "./indexing";

afterEach(() => {
	delete process.env.SITE_URL;
	delete process.env.SITE_INDEXING_ENABLED;
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

	it("lists the indexable application URLs and omits Practice", () => {
		process.env.SITE_URL = "https://phonaria.rigos.dev";
		const urls = getSitemapUrls();
		expect(urls.slice(0, 5)).toEqual([
			"https://phonaria.rigos.dev",
			"https://phonaria.rigos.dev/ipa-chart/consonants",
			"https://phonaria.rigos.dev/ipa-chart/vowels",
			"https://phonaria.rigos.dev/ipa-chart/frequency",
			"https://phonaria.rigos.dev/credits",
		]);
		expect(urls.some((url) => url.includes("/practice"))).toBe(false);
	});

	it("lists one page per American English sound", () => {
		process.env.SITE_URL = "https://phonaria.rigos.dev";
		const soundUrls = getSitemapUrls().slice(5);
		expect(soundUrls).toHaveLength(40);
		expect(soundUrls).toContain("https://phonaria.rigos.dev/ipa-chart/t");
		expect(soundUrls).toContain("https://phonaria.rigos.dev/ipa-chart/oi");
	});
});
