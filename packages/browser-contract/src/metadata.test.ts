import { describe, expect, it } from "vitest";
import type { ContractTarget } from "./constants";
import { expectedCanonical, expectedRobots, expectedSitemapUrls } from "./metadata";

const target = {
	name: "cloudflare-production",
	baseUrl: "https://phonaria.rigos.dev",
	expectedCanonicalOrigin: "https://phonaria.rigos.dev",
	practiceEnabled: false,
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

	it("keeps production indexed and omits Practice from the sitemap set", () => {
		expect(expectedRobots(target)).toBe("index, follow");
		expect(expectedSitemapUrls(target)).toEqual([
			"https://phonaria.rigos.dev",
			"https://phonaria.rigos.dev/ipa-chart/consonants",
			"https://phonaria.rigos.dev/ipa-chart/vowels",
			"https://phonaria.rigos.dev/credits",
		]);
		expect(expectedSitemapUrls(target).join(" ")).not.toContain("practice");
	});
});
