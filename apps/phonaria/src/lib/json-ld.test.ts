import { describe, expect, it } from "vitest";
import {
	buildBreadcrumbStructuredData,
	buildWebSiteStructuredData,
	serializeJsonLd,
} from "./json-ld";

const SITE_URL = "https://phonaria.example.test";

describe("serializeJsonLd", () => {
	it("escapes characters that could end the script tag", () => {
		const json = serializeJsonLd({ text: "</script><b>&\u2028" });
		expect(json).not.toMatch(/[<>&\u2028]/);
		expect(json).toBe('{"text":"\\u003c/script\\u003e\\u003cb\\u003e\\u0026\\u2028"}');
	});

	it("parses back to the same value", () => {
		const value = { text: "</script>", data: buildWebSiteStructuredData("Phonaria", SITE_URL) };
		expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
	});
});

describe("buildBreadcrumbStructuredData", () => {
	it("numbers the crumbs from 1 and gives each its absolute URL", () => {
		expect(
			buildBreadcrumbStructuredData(SITE_URL, [
				{ name: "Sounds", path: "/sounds" },
				{ name: "Voiceless TH /θ/", path: "/sounds/th-thin" },
			]),
		).toEqual({
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{ "@type": "ListItem", position: 1, name: "Sounds", item: `${SITE_URL}/sounds` },
				{
					"@type": "ListItem",
					position: 2,
					name: "Voiceless TH /θ/",
					item: `${SITE_URL}/sounds/th-thin`,
				},
			],
		});
	});
});
