import { afterEach, describe, expect, it, vi } from "vitest";
import { CREDITS_PAGE_DESCRIPTION, CREDITS_PAGE_TITLE } from "@/lib/credits-metadata";
import {
	CONSONANTS_PAGE_DESCRIPTION,
	CONSONANTS_PAGE_TITLE,
	FREQUENCY_PAGE_DESCRIPTION,
	IPA_CHART_CONSONANTS_PATH,
	IPA_CHART_FREQUENCY_PATH,
	IPA_CHART_VOWELS_PATH,
	VOWELS_PAGE_DESCRIPTION,
	VOWELS_PAGE_TITLE,
} from "@/lib/ipa-chart-metadata";
import {
	LANGUAGE_SPREAD_IMAGE,
	LANGUAGE_SPREAD_PAGE_DESCRIPTION,
	LANGUAGE_SPREAD_PAGE_TITLE,
} from "@/lib/language-spread/metadata";
import { PracticeActivity } from "@/lib/practice/activity";
import { getTopic } from "@/lib/practice/topics";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import {
	buildConsonantsHead,
	buildCreditsHead,
	buildFrequencyHead,
	buildHomeHead,
	buildLanguageSpreadHead,
	buildMinimalPairPracticeHead,
	buildPracticeIndexHead,
	buildPracticeTopicHead,
	buildRootHead,
	buildVowelsHead,
	consonantsDocumentTitle,
	creditsDocumentTitle,
	extractDocumentTitle,
	formatDocumentTitle,
	frequencyDocumentTitle,
	practiceDocumentTitle,
	tryGetDocumentMetadata,
	vowelsDocumentTitle,
} from "./document-head";

afterEach(() => {
	delete process.env.SITE_URL;
	delete process.env.SITE_INDEXING_ENABLED;
	delete process.env.GOOGLE_SITE_VERIFICATION;
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

describe("formatDocumentTitle", () => {
	it("uses the site name alone for the default document", () => {
		expect(formatDocumentTitle()).toBe(SITE_NAME);
	});

	it("applies the site title template", () => {
		expect(creditsDocumentTitle()).toBe(`${CREDITS_PAGE_TITLE} - ${SITE_NAME}`);
		expect(consonantsDocumentTitle()).toBe(`${CONSONANTS_PAGE_TITLE} - ${SITE_NAME}`);
		expect(vowelsDocumentTitle()).toBe(`${VOWELS_PAGE_TITLE} - ${SITE_NAME}`);
		expect(practiceDocumentTitle()).toBe(`${PracticeActivity.name} - ${SITE_NAME}`);
	});
});

describe("tryGetDocumentMetadata", () => {
	it("returns metadata when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		expect(tryGetDocumentMetadata()?.siteUrl).toBe("https://phonaria-staging.example.test");
	});

	it("returns undefined on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		expect(tryGetDocumentMetadata()).toBeUndefined();
	});

	it("rethrows on the server when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		expect(() => tryGetDocumentMetadata()).toThrow(/SITE_URL is not set/);
	});

	it("rethrows a malformed SITE_URL", () => {
		process.env.SITE_URL = "phonaria.rigos.dev";
		expect(() => tryGetDocumentMetadata()).toThrow(/not an absolute URL/);
	});

	it("rethrows a malformed SITE_URL on the client", () => {
		vi.stubGlobal("window", {} as Window);
		process.env.SITE_URL = "phonaria.rigos.dev";
		expect(() => tryGetDocumentMetadata()).toThrow(/not an absolute URL/);
	});
});

describe("extractDocumentTitle", () => {
	it("uses the deepest non-empty title from route matches", () => {
		expect(
			extractDocumentTitle([
				{ meta: [{ title: SITE_NAME }] },
				{ meta: [{ title: creditsDocumentTitle() }] },
			]),
		).toBe(creditsDocumentTitle());
	});

	it("falls back to the site name when matches have no title", () => {
		expect(extractDocumentTitle([{ meta: [{}] }])).toBe(SITE_NAME);
		expect(extractDocumentTitle([])).toBe(SITE_NAME);
	});
});

describe("buildRootHead", () => {
	it("links the browser tab icon from the Vite public root", () => {
		expect(buildRootHead().links).toContainEqual({
			rel: "icon",
			href: "/favicon.svg",
		});
	});

	it("keeps a title on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		expect(buildRootHead().meta).toContainEqual({ title: SITE_NAME });
		expect(buildRootHead().meta).toContainEqual({
			name: "description",
			content: SITE_DESCRIPTION,
		});
	});

	it("adds canonical SEO tags when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		expect(buildRootHead().meta).toContainEqual({
			property: "og:url",
			content: "https://phonaria-staging.example.test",
		});
	});
});

describe("buildHomeHead", () => {
	it("keeps the site title on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		const head = buildHomeHead();
		expect(head.meta).toContainEqual({ title: SITE_NAME });
		expect(head.meta).toContainEqual({
			name: "description",
			content: SITE_DESCRIPTION,
		});
		expect(head.links).toBeUndefined();
	});

	it("adds the home canonical when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const head = buildHomeHead();
		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test" },
		]);
	});

	it("uses the site name and description for social cards", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const { meta } = buildHomeHead();
		expect(meta).toContainEqual({ property: "og:type", content: "website" });
		expect(meta).toContainEqual({ property: "og:title", content: SITE_NAME });
		expect(meta).toContainEqual({ property: "og:description", content: SITE_DESCRIPTION });
		expect(meta).toContainEqual({ name: "twitter:title", content: SITE_NAME });
		expect(meta).toContainEqual({ name: "twitter:description", content: SITE_DESCRIPTION });
		expect(meta).toContainEqual({
			property: "og:image",
			content: "https://phonaria-staging.example.test/opengraph-image.jpg",
		});
	});
});

describe("buildCreditsHead", () => {
	it("keeps the Credits title on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		const head = buildCreditsHead();
		expect(head.meta).toContainEqual({ title: creditsDocumentTitle() });
		expect(head.meta).toContainEqual({
			name: "description",
			content: CREDITS_PAGE_DESCRIPTION,
		});
		expect(head.links).toBeUndefined();
	});

	it("adds the Credits canonical when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const head = buildCreditsHead();
		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test/credits" },
		]);
	});

	it("gives social cards the page's own title and description", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const { meta } = buildCreditsHead();
		expect(meta).toContainEqual({ property: "og:type", content: "website" });
		expect(meta).toContainEqual({ property: "og:title", content: CREDITS_PAGE_TITLE });
		expect(meta).toContainEqual({
			property: "og:description",
			content: CREDITS_PAGE_DESCRIPTION,
		});
		expect(meta).toContainEqual({ name: "twitter:title", content: CREDITS_PAGE_TITLE });
		expect(meta).toContainEqual({
			name: "twitter:description",
			content: CREDITS_PAGE_DESCRIPTION,
		});
		expect(meta).toContainEqual({
			property: "og:url",
			content: "https://phonaria-staging.example.test/credits",
		});
		expect(meta).not.toContainEqual(expect.objectContaining({ property: "og:image:alt" }));
	});
});

describe("buildConsonantsHead", () => {
	it("keeps the consonant chart title on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		const head = buildConsonantsHead();
		expect(head.meta).toContainEqual({ title: consonantsDocumentTitle() });
		expect(head.meta).toContainEqual({
			name: "description",
			content: CONSONANTS_PAGE_DESCRIPTION,
		});
		expect(head.links).toBeUndefined();
	});

	it("adds the consonant chart canonical when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const head = buildConsonantsHead();
		expect(head.links).toEqual([
			{
				rel: "canonical",
				href: `https://phonaria-staging.example.test${IPA_CHART_CONSONANTS_PATH}`,
			},
		]);
	});
});

describe("buildFrequencyHead", () => {
	it("titles, describes and canonicalizes the frequency page", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const head = buildFrequencyHead();
		expect(head.meta).toContainEqual({ title: frequencyDocumentTitle() });
		expect(head.meta).toContainEqual({ name: "description", content: FREQUENCY_PAGE_DESCRIPTION });
		expect(head.links).toEqual([
			{
				rel: "canonical",
				href: `https://phonaria-staging.example.test${IPA_CHART_FREQUENCY_PATH}`,
			},
		]);
	});
});

describe("buildVowelsHead", () => {
	it("keeps the vowel chart title on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		const head = buildVowelsHead();
		expect(head.meta).toContainEqual({ title: vowelsDocumentTitle() });
		expect(head.meta).toContainEqual({
			name: "description",
			content: VOWELS_PAGE_DESCRIPTION,
		});
		expect(head.links).toBeUndefined();
	});

	it("adds the vowel chart canonical when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const head = buildVowelsHead();
		expect(head.links).toEqual([
			{
				rel: "canonical",
				href: `https://phonaria-staging.example.test${IPA_CHART_VOWELS_PATH}`,
			},
		]);
	});
});

describe("buildPracticeIndexHead", () => {
	it("keeps the Practice title on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		const head = buildPracticeIndexHead();
		expect(head.meta).toContainEqual({ title: practiceDocumentTitle() });
		expect(head.meta).toContainEqual({
			name: "description",
			content: PracticeActivity.description,
		});
		expect(head.links).toBeUndefined();
	});

	it("always noindexes Practice even when site indexing is on", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		process.env.SITE_INDEXING_ENABLED = "1";
		const head = buildPracticeIndexHead();
		expect(head.meta).toContainEqual({ name: "robots", content: "noindex, follow" });
		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test/practice" },
		]);
	});
});

describe("buildPracticeTopicHead", () => {
	it("uses the topic display name and blurb", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const topic = getTopic("schwa");
		expect(topic).toBeDefined();
		const head = buildPracticeTopicHead(topic);
		expect(head.meta).toContainEqual({
			title: practiceDocumentTitle(`${topic?.display.name} — Practice`),
		});
		expect(head.meta).toContainEqual({
			name: "description",
			content: topic?.display.blurb,
		});
		expect(head.meta).toContainEqual({ name: "robots", content: "noindex, follow" });
		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test/practice/schwa" },
		]);
	});
});

describe("buildMinimalPairPracticeHead", () => {
	it("is a noindexed page at its own path", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		process.env.SITE_INDEXING_ENABLED = "1";
		const head = buildMinimalPairPracticeHead();
		expect(head.meta).toContainEqual({
			title: practiceDocumentTitle("Minimal pairs"),
		});
		expect(head.meta).toContainEqual({ name: "robots", content: "noindex, follow" });
		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test/minimal-pairs" },
		]);
	});
});

describe("buildLanguageSpreadHead", () => {
	it("keeps the title and description on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		const head = buildLanguageSpreadHead();
		expect(head.meta).toEqual([
			{ title: formatDocumentTitle(LANGUAGE_SPREAD_PAGE_TITLE) },
			{ name: "description", content: LANGUAGE_SPREAD_PAGE_DESCRIPTION },
		]);
		expect(head.links).toBeUndefined();
		expect(head.scripts).toBeUndefined();
	});

	it("keeps the document title within 60 characters", () => {
		expect(formatDocumentTitle(LANGUAGE_SPREAD_PAGE_TITLE).length).toBeLessThanOrEqual(60);
	});

	it("follows the site-wide indexing setting", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		expect(buildLanguageSpreadHead().meta).toContainEqual({
			name: "robots",
			content: "noindex, follow",
		});
		process.env.SITE_INDEXING_ENABLED = "1";
		expect(buildLanguageSpreadHead().meta).toContainEqual({
			name: "robots",
			content: "index, follow",
		});
	});

	it("describes the page as an article with its own card image", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const { meta, links } = buildLanguageSpreadHead();
		const imageUrl = `https://phonaria-staging.example.test${LANGUAGE_SPREAD_IMAGE.path}`;
		expect(links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test/language-spread" },
		]);
		expect(meta).toEqual(
			expect.arrayContaining([
				{ property: "og:type", content: "article" },
				{ property: "og:title", content: LANGUAGE_SPREAD_PAGE_TITLE },
				{ property: "og:description", content: LANGUAGE_SPREAD_PAGE_DESCRIPTION },
				{ property: "og:image", content: imageUrl },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{ property: "og:image:alt", content: LANGUAGE_SPREAD_IMAGE.alt },
				{ name: "twitter:title", content: LANGUAGE_SPREAD_PAGE_TITLE },
				{ name: "twitter:description", content: LANGUAGE_SPREAD_PAGE_DESCRIPTION },
				{ name: "twitter:image", content: imageUrl },
				{ name: "twitter:image:alt", content: LANGUAGE_SPREAD_IMAGE.alt },
			]),
		);
	});

	it("adds JSON-LD when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const scripts = buildLanguageSpreadHead().scripts;
		expect(scripts).toHaveLength(1);
		expect(scripts?.[0]?.type).toBe("application/ld+json");
		const data = JSON.parse(scripts?.[0]?.children ?? "");
		expect(data["@type"]).toBe("Article");
		expect(data.url).toBe("https://phonaria-staging.example.test/language-spread");
	});
});
