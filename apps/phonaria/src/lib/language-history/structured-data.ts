import { SITE_NAME } from "@/lib/site";
import {
	LANGUAGE_HISTORY_IMAGE,
	LANGUAGE_HISTORY_PAGE_DESCRIPTION,
	LANGUAGE_HISTORY_PAGE_TITLE,
	LANGUAGE_HISTORY_PATH,
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
export function buildLanguageHistoryStructuredData(siteUrl: string) {
	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: STEPS[0]?.title ?? LANGUAGE_HISTORY_PAGE_TITLE,
		alternativeHeadline: LANGUAGE_HISTORY_PAGE_TITLE,
		description: LANGUAGE_HISTORY_PAGE_DESCRIPTION,
		inLanguage: "en",
		about: {
			"@type": "Thing",
			name: "History of the English language",
			sameAs: "https://en.wikipedia.org/wiki/History_of_English",
		},
		isAccessibleForFree: true,
		url: `${siteUrl}${LANGUAGE_HISTORY_PATH}`,
		image: {
			"@type": "ImageObject",
			url: `${siteUrl}${LANGUAGE_HISTORY_IMAGE.path}`,
			width: LANGUAGE_HISTORY_IMAGE.width,
			height: LANGUAGE_HISTORY_IMAGE.height,
		},
		publisher: { "@type": "Organization", name: SITE_NAME, url: siteUrl },
		citation: SOURCES.map((source) => ({
			"@type": "CreativeWork",
			name: source.title,
			url: source.url,
		})),
	};
}
