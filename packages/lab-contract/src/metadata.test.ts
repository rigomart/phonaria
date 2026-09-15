import { describe, expect, it } from "vitest";
import type { LabContractTarget } from "./constants";
import { expectedCanonical, expectedRobots, expectedSitemapUrls } from "./metadata";

const target = {
	name: "cloudflare-production",
	baseUrl: "https://phonaria-lab.rigos.dev",
	expectedCanonicalOrigin: "https://phonaria-lab.rigos.dev",
	practiceEnabled: false,
	indexingEnabled: false,
	bucketAssetsAvailable: true,
	authentication: { type: "none" },
	capabilities: {
		controlledServiceFailure: false,
		controlledWordlistFailure: false,
		practiceSession: false,
	},
	skipReasons: {},
} satisfies LabContractTarget;

describe("metadata helpers", () => {
	it("builds canonical URLs without a trailing slash on the origin", () => {
		expect(expectedCanonical(target, "/")).toBe("https://phonaria-lab.rigos.dev");
		expect(expectedCanonical(target, "/credits")).toBe("https://phonaria-lab.rigos.dev/credits");
	});

	it("keeps production Lab non-indexed and omits Practice from the sitemap set", () => {
		expect(expectedRobots(target)).toBe("noindex, follow");
		expect(expectedSitemapUrls(target)).toEqual([
			"https://phonaria-lab.rigos.dev",
			"https://phonaria-lab.rigos.dev/ipa-chart/consonants",
			"https://phonaria-lab.rigos.dev/ipa-chart/vowels",
			"https://phonaria-lab.rigos.dev/credits",
		]);
		expect(expectedSitemapUrls(target).join(" ")).not.toContain("practice");
	});
});
