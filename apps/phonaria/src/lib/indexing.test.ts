import { EnglishPhonemeContrasts, getLanguagePhonemeIds } from "@phonaria/phonetics-data";
import { afterEach, describe, expect, it } from "vitest";
import { formatRobotsTxt, getIndexablePaths, getRobotsPolicy, getSitemapUrls } from "./indexing";

afterEach(() => {
	delete process.env.SITE_URL;
	delete process.env.SITE_INDEXING_ENABLED;
	delete process.env.FLAG_LANGUAGE_HISTORY;
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
		process.env.FLAG_LANGUAGE_HISTORY = "0";
		const urls = getSitemapUrls();
		expect(urls.slice(0, 7)).toEqual([
			"https://phonaria.rigos.dev",
			"https://phonaria.rigos.dev/ipa-chart/consonants",
			"https://phonaria.rigos.dev/ipa-chart/vowels",
			"https://phonaria.rigos.dev/ipa-chart/frequency",
			"https://phonaria.rigos.dev/about",
			"https://phonaria.rigos.dev/credits",
			"https://phonaria.rigos.dev/minimal-pairs",
		]);
		expect(urls.some((url) => url.includes("/practice"))).toBe(false);
	});

	it("lists every contrast page, with or without speaking practice", () => {
		const contrastPaths = getIndexablePaths({ languageHistory: false }).filter((path) =>
			path.startsWith("/minimal-pairs/"),
		);
		expect(contrastPaths).toHaveLength(EnglishPhonemeContrasts.length);
		expect(contrastPaths).toContain("/minimal-pairs/th-s");
		expect(contrastPaths[0]).toBe("/minimal-pairs/p-b");
	});

	it("lists /sounds and every sound page", () => {
		const paths = getIndexablePaths({ languageHistory: false });
		expect(paths).toContain("/sounds");
		const soundPaths = paths.filter((path) => path.startsWith("/sounds/"));
		expect(soundPaths).toHaveLength(getLanguagePhonemeIds("en-us").length);
		expect(soundPaths).toContain("/sounds/th-thin");
	});

	it("adds History only when its flag is on", () => {
		expect(getIndexablePaths({ languageHistory: true })).toContain("/history");
		expect(getIndexablePaths({ languageHistory: false })).not.toContain("/history");
	});

	it("reads the History flag from the environment by default", () => {
		process.env.SITE_URL = "https://phonaria.rigos.dev";
		process.env.FLAG_LANGUAGE_HISTORY = "1";
		expect(getSitemapUrls()).toContain("https://phonaria.rigos.dev/history");
		process.env.FLAG_LANGUAGE_HISTORY = "0";
		expect(getSitemapUrls()).not.toContain("https://phonaria.rigos.dev/history");
	});
});
