import { afterEach, beforeEach, describe, expect, it } from "vitest";
import sitemap from "./sitemap";

beforeEach(() => {
	process.env.SITE_URL = "https://phonaria.rigos.dev";
});

afterEach(() => {
	delete process.env.SITE_URL;
});

describe("sitemap", () => {
	it("lists exactly the indexable pages on the configured origin", () => {
		expect(sitemap().map((entry) => entry.url)).toEqual([
			"https://phonaria.rigos.dev",
			"https://phonaria.rigos.dev/ipa-chart/consonants",
			"https://phonaria.rigos.dev/ipa-chart/vowels",
			"https://phonaria.rigos.dev/credits",
		]);
	});

	it("omits practice pages", () => {
		for (const entry of sitemap()) {
			expect(entry.url).not.toContain("practice");
		}
	});

	it("omits the /ipa-chart redirect", () => {
		const urls = sitemap().map((entry) => entry.url);
		expect(urls).not.toContain("https://phonaria.rigos.dev/ipa-chart");
	});
});
