import { describe, expect, it } from "vitest";
import type { ContractTarget } from "./constants";
import { expectedCanonical, expectedRobots, expectedSitemapUrls } from "./metadata";

const target = {
	name: "cloudflare-production",
	baseUrl: "https://phonaria.rigos.dev",
	expectedCanonicalOrigin: "https://phonaria.rigos.dev",
	practiceEnabled: false,
	languageHistoryEnabled: false,
	aboutEnabled: false,
	speechEnabled: false,
	indexingEnabled: true,
	bucketAssetsAvailable: true,
	authentication: { type: "none" },
	capabilities: {
		controlledServiceFailure: false,
		controlledWordlistFailure: false,
		practiceSession: false,
	},
	skipReasons: {},
} satisfies ContractTarget;

describe("metadata helpers", () => {
	it("builds canonical URLs without a trailing slash on the origin", () => {
		expect(expectedCanonical(target, "/")).toBe("https://phonaria.rigos.dev");
		expect(expectedCanonical(target, "/credits")).toBe("https://phonaria.rigos.dev/credits");
	});

	it("keeps production indexed, lists the minimal-pair and sound indexes and omits Practice from the sitemap set", () => {
		expect(expectedRobots(target)).toBe("index, follow");
		expect(expectedSitemapUrls(target)).toEqual([
			"https://phonaria.rigos.dev",
			"https://phonaria.rigos.dev/ipa-chart/consonants",
			"https://phonaria.rigos.dev/ipa-chart/vowels",
			"https://phonaria.rigos.dev/ipa-chart/frequency",
			"https://phonaria.rigos.dev/credits",
			"https://phonaria.rigos.dev/minimal-pairs",
			"https://phonaria.rigos.dev/sounds",
		]);
		expect(expectedSitemapUrls(target).join(" ")).not.toContain("practice");
	});

	it("adds About to the sitemap set only where its flag is on", () => {
		expect(expectedSitemapUrls(target)).not.toContain("https://phonaria.rigos.dev/about");
		expect(expectedSitemapUrls({ ...target, aboutEnabled: true })).toContain(
			"https://phonaria.rigos.dev/about",
		);
	});

	it("adds History to the sitemap set only where its flag is on", () => {
		expect(expectedSitemapUrls(target).join(" ")).not.toContain("language-history");
		expect(expectedSitemapUrls({ ...target, languageHistoryEnabled: true }).at(-1)).toBe(
			"https://phonaria.rigos.dev/history",
		);
	});
});
