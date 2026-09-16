import { describe, expect, it } from "vitest";
import * as startModule from "./start";

const { resolveLegacyRedirect } = startModule;

describe("legacy request redirects", () => {
	it("exposes a response builder for request middleware", () => {
		expect(
			(startModule as unknown as Record<string, unknown>).getLegacyRedirectResponse,
		).toBeTypeOf("function");
	});

	it("builds a permanent redirect response with the resolved location", () => {
		const response = startModule.getLegacyRedirectResponse(
			new Request("https://phonaria-lab.rigos.dev/en/credits"),
		);

		expect(response?.status).toBe(308);
		expect(response?.headers.get("location")).toBe("https://phonaria.rigos.dev/credits");
	});

	it("does not build a response for a current route", () => {
		expect(
			startModule.getLegacyRedirectResponse(
				new Request("https://phonaria.rigos.dev/ipa-chart/consonants"),
			),
		).toBeUndefined();
	});

	it.each([
		["/credits?from=bookmark", "/credits?from=bookmark"],
		["/ipa-chart/consonants", "/ipa-chart/consonants"],
		["/ipa-chart/vowels", "/ipa-chart/vowels"],
	])("moves old-host request %s directly to the main hostname", (oldPath, mainPath) => {
		expect(
			resolveLegacyRedirect(new Request(`https://phonaria-lab.rigos.dev${oldPath}`))?.href,
		).toBe(`https://phonaria.rigos.dev${mainPath}`);
	});

	it.each([
		["/en", "/"],
		["/es/", "/"],
		["/en/transcription", "/"],
		["/es/transcription/", "/"],
		["/en/credits", "/credits"],
		["/es/credits/", "/credits"],
	])("maps legacy locale path %s to %s", (legacyPath, currentPath) => {
		expect(
			resolveLegacyRedirect(new Request(`https://phonaria.rigos.dev${legacyPath}`))?.href,
		).toBe(`https://phonaria.rigos.dev${currentPath}`);
	});

	it("maps the legacy vowel query to the dedicated vowel chart without a redirect chain", () => {
		expect(
			resolveLegacyRedirect(new Request("https://phonaria-lab.rigos.dev/es/ipa-chart?tab=vowels"))
				?.href,
		).toBe("https://phonaria.rigos.dev/ipa-chart/vowels");
	});

	it.each([
		"https://phonaria.rigos.dev/en/ipa-chart",
		"https://phonaria.rigos.dev/es/ipa-chart?tab=consonants",
	])("maps the legacy default chart to the consonant page", (legacyUrl) => {
		expect(resolveLegacyRedirect(new Request(legacyUrl))?.href).toBe(
			"https://phonaria.rigos.dev/ipa-chart/consonants",
		);
	});

	it("leaves current main-hostname routes alone", () => {
		expect(
			resolveLegacyRedirect(new Request("https://phonaria.rigos.dev/ipa-chart/vowels")),
		).toBeUndefined();
	});
});
