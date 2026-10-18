import { SITE_NAME } from "@/lib/site";
import {
	LANGUAGE_SPREAD_IMAGE,
	LANGUAGE_SPREAD_PAGE_DESCRIPTION,
	LANGUAGE_SPREAD_PAGE_TITLE,
	LANGUAGE_SPREAD_PATH,
} from "./metadata";
import { SOURCES, STEPS } from "./story";

/**
 * schema.org `Article`: the page is one narrative read top to bottom, which is what
 * Article describes and what search engines read for it. `LearningResource` would
 * add nothing a crawler uses here.
 *
 * Step titles are left out: `articleSection` names a publication's section (e.g.
 * "Sports"), not a heading inside the article.
 */
export function buildLanguageSpreadStructuredData(siteUrl: string) {
	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: STEPS[0]?.title ?? LANGUAGE_SPREAD_PAGE_TITLE,
		alternativeHeadline: LANGUAGE_SPREAD_PAGE_TITLE,
		description: LANGUAGE_SPREAD_PAGE_DESCRIPTION,
		inLanguage: "en",
		about: {
			"@type": "Thing",
			name: "History of the English language",
			sameAs: "https://en.wikipedia.org/wiki/History_of_English",
		},
		isAccessibleForFree: true,
		url: `${siteUrl}${LANGUAGE_SPREAD_PATH}`,
		image: {
			"@type": "ImageObject",
			url: `${siteUrl}${LANGUAGE_SPREAD_IMAGE.path}`,
			width: LANGUAGE_SPREAD_IMAGE.width,
			height: LANGUAGE_SPREAD_IMAGE.height,
		},
		publisher: { "@type": "Organization", name: SITE_NAME, url: siteUrl },
		citation: SOURCES.map((source) => ({
			"@type": "CreativeWork",
			name: source.title,
			url: source.url,
		})),
	};
}

const SCRIPT_UNSAFE = /[<>&\u2028\u2029]/g;

/**
 * JSON for an inline `<script type="application/ld+json">`. Escaping `<` keeps a
 * `</script>` inside a string from closing the tag; the escapes parse back unchanged.
 */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(
		SCRIPT_UNSAFE,
		(char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
	);
}
