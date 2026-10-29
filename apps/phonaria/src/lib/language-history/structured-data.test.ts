import { describe, expect, it } from "vitest";
import { LANGUAGE_HISTORY_PAGE_DESCRIPTION, LANGUAGE_HISTORY_PAGE_TITLE } from "./metadata";
import { SOURCES, STEPS } from "./story";
import { buildLanguageHistoryStructuredData, serializeJsonLd } from "./structured-data";

const SITE_URL = "https://phonaria.example.test";

describe("buildLanguageHistoryStructuredData", () => {
	const data = buildLanguageHistoryStructuredData(SITE_URL);

	it("describes the page as a free English-language article", () => {
		expect(data).toMatchObject({
			"@context": "https://schema.org",
			"@type": "Article",
			headline: STEPS[0]?.title,
			alternativeHeadline: LANGUAGE_HISTORY_PAGE_TITLE,
			description: LANGUAGE_HISTORY_PAGE_DESCRIPTION,
			inLanguage: "en",
			about: { "@type": "Thing", name: "History of the English language" },
			isAccessibleForFree: true,
		});
	});

	it("uses absolute URLs for the page, its image and the publisher", () => {
		expect(data.url).toBe(`${SITE_URL}/history`);
		expect(data.image).toEqual({
			"@type": "ImageObject",
			url: `${SITE_URL}/og/history.jpg`,
			width: 1200,
			height: 630,
		});
		expect(data.publisher).toEqual({ "@type": "Organization", name: "Phonaria", url: SITE_URL });
	});

	it("cites every source listed on the page", () => {
		expect(data.citation).toHaveLength(SOURCES.length);
		expect(data.citation[0]).toEqual({
			"@type": "CreativeWork",
			name: SOURCES[0]?.title,
			url: SOURCES[0]?.url,
		});
		for (const citation of data.citation) {
			expect(citation.url).toMatch(/^https:\/\//);
		}
	});
});

describe("serializeJsonLd", () => {
	it("escapes characters that could end the script tag", () => {
		const json = serializeJsonLd({ text: "</script><b>&\u2028" });
		expect(json).not.toMatch(/[<>&\u2028]/);
		expect(json).toBe('{"text":"\\u003c/script\\u003e\\u003cb\\u003e\\u0026\\u2028"}');
	});

	it("parses back to the same value", () => {
		const value = { text: "</script>", data: buildLanguageHistoryStructuredData(SITE_URL) };
		expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
	});
});
