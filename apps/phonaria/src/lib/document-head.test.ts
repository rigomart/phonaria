import { afterEach, describe, expect, it, vi } from "vitest";
import { ABOUT_PAGE_DESCRIPTION } from "@/lib/about/metadata";
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
	LANGUAGE_HISTORY_IMAGE,
	LANGUAGE_HISTORY_PAGE_DESCRIPTION,
	LANGUAGE_HISTORY_PAGE_TITLE,
} from "@/lib/language-history/metadata";
import { getContrastPage } from "@/lib/minimal-pairs";
import { PracticeActivity } from "@/lib/practice/activity";
import { getTopic } from "@/lib/practice/topics";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { SOUNDS_PAGE_DESCRIPTION, soundPageDescription, soundPageTitle } from "@/lib/sound-pages";
import {
	buildConsonantsHead,
	buildAboutHead,
	buildCreditsHead,
	buildFrequencyHead,
	buildHomeHead,
	buildLanguageHistoryHead,
	buildMinimalPairContrastHead,
	buildMinimalPairsHead,
	buildPracticeIndexHead,
	buildPracticeTopicHead,
	buildRootHead,
	buildSoundHead,
	buildSoundsIndexHead,
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
	it("links square tab icons that search engines accept, plus the SVG for browsers", () => {
		const links = buildRootHead().links;
		expect(links).toContainEqual({
			rel: "icon",
			href: "/favicon.ico",
			sizes: "16x16 32x32 48x48",
		});
		expect(links).toContainEqual({
			rel: "icon",
			href: "/favicon-48x48.png",
			type: "image/png",
			sizes: "48x48",
		});
		expect(links).toContainEqual({
			rel: "icon",
			href: "/favicon.svg",
			type: "image/svg+xml",
			sizes: "any",
		});
		expect(links).toContainEqual({ rel: "apple-touch-icon", href: "/apple-touch-icon.png" });
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

	it("sends robots but no social tags, so a page without its own head shares no card", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const { meta } = buildRootHead();
		expect(meta).toContainEqual({ name: "robots", content: "noindex, follow" });
		expect(meta).not.toContainEqual(
			expect.objectContaining({ property: expect.stringMatching(/^og:/) }),
		);
		expect(meta).not.toContainEqual(
			expect.objectContaining({ name: expect.stringMatching(/^twitter:/) }),
		);
	});

	it("titles a not-found page", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		expect(buildRootHead({ notFound: true }).meta).toContainEqual({
			title: "Page not found - Phonaria",
		});
	});
});

const HOME_TITLE = "English to IPA transcription for American English";
const HOME_DESCRIPTION =
	"See how any English word or sentence is pronounced in American English, in IPA, sound by sound, with recordings. Plus an IPA chart and all 40 sounds.";

describe("buildHomeHead", () => {
	it("keeps the home title on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		const head = buildHomeHead();
		expect(head.meta).toEqual([
			{ title: `${HOME_TITLE} - Phonaria` },
			{ name: "description", content: HOME_DESCRIPTION },
		]);
		expect(head.links).toBeUndefined();
		expect(head.scripts).toBeUndefined();
	});

	it("adds the home canonical when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const head = buildHomeHead();
		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test" },
		]);
	});

	it("uses the home title and description for social cards", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const { meta } = buildHomeHead();
		expect(meta).toContainEqual({ property: "og:type", content: "website" });
		expect(meta).toContainEqual({ property: "og:title", content: HOME_TITLE });
		expect(meta).toContainEqual({ property: "og:description", content: HOME_DESCRIPTION });
		expect(meta).toContainEqual({ name: "twitter:title", content: HOME_TITLE });
		expect(meta).toContainEqual({ name: "twitter:description", content: HOME_DESCRIPTION });
		expect(meta).toContainEqual({
			property: "og:image",
			content: "https://phonaria-staging.example.test/opengraph-image.jpg",
		});
	});

	it("describes the site as a WebSite at the home canonical", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const { scripts } = buildHomeHead();
		expect(scripts).toHaveLength(1);
		expect(scripts?.[0]?.type).toBe("application/ld+json");
		expect(JSON.parse(scripts?.[0]?.children ?? "")).toEqual({
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: "Phonaria",
			url: "https://phonaria-staging.example.test",
		});
	});
});

describe("buildAboutHead", () => {
	it("is indexable with its canonical and social card when indexing is on", () => {
		process.env.SITE_URL = "https://phonaria.rigos.dev";
		process.env.SITE_INDEXING_ENABLED = "1";
		const { meta, links } = buildAboutHead();
		expect(links).toEqual([{ rel: "canonical", href: "https://phonaria.rigos.dev/about" }]);
		expect(meta).toContainEqual({ name: "robots", content: "index, follow" });
		expect(meta).toContainEqual({ name: "description", content: ABOUT_PAGE_DESCRIPTION });
		expect(meta).toContainEqual({ property: "og:title", content: "About" });
		expect(meta).toContainEqual({
			property: "og:url",
			content: "https://phonaria.rigos.dev/about",
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

describe("chart heads", () => {
	it("use the words people search for, with counts from the data", () => {
		const titleAndDescription = ({ meta }: { meta: unknown[] }) => meta.slice(0, 2);
		expect(titleAndDescription(buildConsonantsHead())).toEqual([
			{ title: "American English IPA chart: consonants - Phonaria" },
			{
				name: "description",
				content:
					"All 24 consonant sounds of American English in an IPA chart, by where and how they're made. Tap one to see how it's made, its spellings and example words.",
			},
		]);
		expect(titleAndDescription(buildVowelsHead())).toEqual([
			{ title: "American English IPA chart: vowels - Phonaria" },
			{
				name: "description",
				content:
					"All 16 vowel sounds of American English in an IPA chart, by where the tongue sits. Tap one to see how it's made, its spellings and example words.",
			},
		]);
		expect(titleAndDescription(buildFrequencyHead())).toEqual([
			{ title: "How common each American English sound is - Phonaria" },
			{
				name: "description",
				content:
					"How often each of the 40 sounds of American English comes up in everyday speech. The schwa /ə/ is the most common, at 7.9%.",
			},
		]);
	});
});

describe("buildSoundHead", () => {
	it("keeps the sound's title and description on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		const head = buildSoundHead("TH");
		expect(head.meta).toEqual([
			{ title: formatDocumentTitle(soundPageTitle("TH")) },
			{ name: "description", content: soundPageDescription("TH") },
		]);
		expect(head.links).toBeUndefined();
	});

	it("titles, describes and canonicalizes the sound's page by its slug", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const { meta, links } = buildSoundHead("TH");
		expect(meta).toContainEqual({
			title: "How to pronounce the voiceless TH sound /θ/ (as in 'thin') - Phonaria",
		});
		expect(meta).toContainEqual({ property: "og:title", content: soundPageTitle("TH") });
		expect(meta).toContainEqual({
			property: "og:description",
			content: soundPageDescription("TH"),
		});
		expect(meta).toContainEqual({
			property: "og:url",
			content: "https://phonaria-staging.example.test/sounds/th-thin",
		});
		expect(links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test/sounds/th-thin" },
		]);
	});

	it("follows the site-wide indexing setting", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		process.env.SITE_INDEXING_ENABLED = "1";
		expect(buildSoundHead("AX").meta).toContainEqual({ name: "robots", content: "index, follow" });
	});

	it("places the sound under Sounds in a breadcrumb", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const { scripts } = buildSoundHead("TH");
		expect(JSON.parse(scripts?.[0]?.children ?? "")).toEqual({
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Sounds",
					item: "https://phonaria-staging.example.test/sounds",
				},
				{
					"@type": "ListItem",
					position: 2,
					name: "Voiceless TH /θ/",
					item: "https://phonaria-staging.example.test/sounds/th-thin",
				},
			],
		});
	});
});

describe("buildSoundsIndexHead", () => {
	it("titles, describes and canonicalizes the list of sounds", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const { meta, links } = buildSoundsIndexHead();
		expect(meta).toContainEqual({
			title: "The 40 sounds of American English, with IPA and examples - Phonaria",
		});
		expect(meta).toContainEqual({
			name: "description",
			content:
				"All 24 consonants and 16 vowels of American English, each with its IPA symbol, how it's made, how it's spelled, example words and minimal pairs.",
		});
		expect(meta).toContainEqual({ name: "description", content: SOUNDS_PAGE_DESCRIPTION });
		expect(links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test/sounds" },
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
			title: `${topic?.display.name} - Practice - ${SITE_NAME}`,
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

describe("buildMinimalPairsHead", () => {
	it("follows the site-wide indexing setting at its own path", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		process.env.SITE_INDEXING_ENABLED = "1";
		const head = buildMinimalPairsHead();
		expect(head.meta).toContainEqual({
			title: "Minimal pairs for American English: ship vs sheep and more - Phonaria",
		});
		expect(head.meta).toContainEqual({
			name: "description",
			content:
				"254 word pairs with recordings that differ by one sound, like ship and sheep or light and right, across 27 American English sound contrasts.",
		});
		expect(head.scripts).toBeUndefined();
		expect(head.meta).toContainEqual({ name: "robots", content: "index, follow" });
		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test/minimal-pairs" },
		]);
	});
});

describe("buildMinimalPairContrastHead", () => {
	it("leads with the headline pair, and is indexable at the contrast's path", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		process.env.SITE_INDEXING_ENABLED = "1";
		const head = buildMinimalPairContrastHead(getContrastPage("th-s"));
		expect(head.meta).toContainEqual({
			title: "Think vs sink: /θ/ and /s/ minimal pairs with audio - Phonaria",
		});
		expect(head.meta).toContainEqual({
			name: "description",
			content:
				"Hear the difference between think and sink, thin and sin, and 9 more word pairs that differ only by the voiceless TH /θ/ and S /s/ sounds, with recordings.",
		});
		expect(head.meta).toContainEqual({ name: "robots", content: "index, follow" });
		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test/minimal-pairs/th-s" },
		]);
	});

	it("keeps the title on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		const head = buildMinimalPairContrastHead(getContrastPage("p-b"));
		expect(head.meta).toContainEqual({
			title: "Pat vs bat: /p/ and /b/ minimal pairs with audio - Phonaria",
		});
		expect(head.links).toBeUndefined();
		expect(head.scripts).toBeUndefined();
	});

	it("names first the sound in the headline's first word", () => {
		const head = buildMinimalPairContrastHead(getContrastPage("i-ix"));
		expect(head.meta).toContainEqual({
			title: "Ship vs sheep: /ɪ/ and /i/ minimal pairs with audio - Phonaria",
		});
		expect(head.meta).toContainEqual({
			name: "description",
			content:
				"Hear the difference between ship and sheep, sit and seat, and 13 more word pairs that differ only by the short I /ɪ/ and long E /i/ sounds, with recordings.",
		});
	});

	it("places the contrast under Minimal pairs in a breadcrumb", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const { scripts } = buildMinimalPairContrastHead(getContrastPage("i-ix"));
		expect(JSON.parse(scripts?.[0]?.children ?? "").itemListElement).toEqual([
			{
				"@type": "ListItem",
				position: 1,
				name: "Minimal pairs",
				item: "https://phonaria-staging.example.test/minimal-pairs",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "/ɪ/ vs /i/: ship vs sheep",
				item: "https://phonaria-staging.example.test/minimal-pairs/i-ix",
			},
		]);
	});
});

describe("buildLanguageHistoryHead", () => {
	it("keeps the title and description on the client when production SITE_URL is missing", () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubGlobal("window", {} as Window);
		const head = buildLanguageHistoryHead();
		expect(head.meta).toEqual([
			{ title: formatDocumentTitle(LANGUAGE_HISTORY_PAGE_TITLE) },
			{ name: "description", content: LANGUAGE_HISTORY_PAGE_DESCRIPTION },
		]);
		expect(head.links).toBeUndefined();
		expect(head.scripts).toBeUndefined();
	});

	it("keeps the document title within 60 characters", () => {
		expect(formatDocumentTitle(LANGUAGE_HISTORY_PAGE_TITLE).length).toBeLessThanOrEqual(60);
	});

	it("follows the site-wide indexing setting", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		expect(buildLanguageHistoryHead().meta).toContainEqual({
			name: "robots",
			content: "noindex, follow",
		});
		process.env.SITE_INDEXING_ENABLED = "1";
		expect(buildLanguageHistoryHead().meta).toContainEqual({
			name: "robots",
			content: "index, follow",
		});
	});

	it("describes the page as an article with its own card image", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const { meta, links } = buildLanguageHistoryHead();
		const imageUrl = `https://phonaria-staging.example.test${LANGUAGE_HISTORY_IMAGE.path}`;
		expect(links).toEqual([
			{ rel: "canonical", href: "https://phonaria-staging.example.test/history" },
		]);
		expect(meta).toEqual(
			expect.arrayContaining([
				{ property: "og:type", content: "article" },
				{ property: "og:title", content: LANGUAGE_HISTORY_PAGE_TITLE },
				{ property: "og:description", content: LANGUAGE_HISTORY_PAGE_DESCRIPTION },
				{ property: "og:image", content: imageUrl },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{ property: "og:image:alt", content: LANGUAGE_HISTORY_IMAGE.alt },
				{ name: "twitter:title", content: LANGUAGE_HISTORY_PAGE_TITLE },
				{ name: "twitter:description", content: LANGUAGE_HISTORY_PAGE_DESCRIPTION },
				{ name: "twitter:image", content: imageUrl },
				{ name: "twitter:image:alt", content: LANGUAGE_HISTORY_IMAGE.alt },
			]),
		);
	});

	it("adds JSON-LD when SITE_URL is set", () => {
		process.env.SITE_URL = "https://phonaria-staging.example.test";
		const scripts = buildLanguageHistoryHead().scripts;
		expect(scripts).toHaveLength(1);
		expect(scripts?.[0]?.type).toBe("application/ld+json");
		const data = JSON.parse(scripts?.[0]?.children ?? "");
		expect(data["@type"]).toBe("Article");
		expect(data.url).toBe("https://phonaria-staging.example.test/history");
	});
});
