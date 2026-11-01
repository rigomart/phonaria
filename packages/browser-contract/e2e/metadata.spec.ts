import {
	HOME_TITLE,
	MINIMAL_PAIR_CONTRAST_COUNT,
	MINIMAL_PAIRS_PATH,
	SITE_NAME,
	SOUND_PAGE_COUNT,
	SOUNDS_PATH,
} from "../src/constants";
import { expect, test } from "../src/fixtures";
import {
	canonicalHref,
	documentTitle,
	expectedCanonical,
	expectedRobots,
	expectedSitemapUrls,
	fetchDocument,
	metaContent,
} from "../src/metadata";

const PUBLIC_ROUTES = [
	{
		path: "/",
		title: HOME_TITLE,
		description:
			"See how any English word or sentence is pronounced in American English, in IPA, sound by sound, with recordings. Plus an IPA chart and all 40 sounds.",
	},
	{
		path: "/credits",
		title: "Credits & Sources - Phonaria",
		description: "Credits and sources for Phonaria resources, data, and media.",
	},
	{
		path: "/ipa-chart/consonants",
		title: "American English IPA chart: consonants - Phonaria",
		description:
			"All 24 consonant sounds of American English in an IPA chart, by where and how they're made. Tap one to see how it's made, its spellings and example words.",
	},
	{
		path: "/ipa-chart/vowels",
		title: "American English IPA chart: vowels - Phonaria",
		description:
			"All 16 vowel sounds of American English in an IPA chart, by where the tongue sits. Tap one to see how it's made, its spellings and example words.",
	},
	{
		path: "/ipa-chart/frequency",
		title: "How common each American English sound is - Phonaria",
		description:
			"How often each of the 40 sounds of American English comes up in everyday speech. The schwa /ə/ is the most common, at 7.9%.",
	},
	{
		path: "/minimal-pairs",
		title: "Minimal pairs for American English: ship vs sheep and more - Phonaria",
		description:
			"254 word pairs with recordings that differ by one sound, like ship and sheep or light and right, across 27 American English sound contrasts.",
	},
	{
		path: "/minimal-pairs/th-s",
		title: "Think vs sink: /θ/ and /s/ minimal pairs with audio - Phonaria",
		description:
			"Hear the difference between think and sink, thin and sin, and 9 more word pairs that differ only by the voiceless TH /θ/ and S /s/ sounds, with recordings.",
	},
	{
		path: "/sounds",
		title: "The 40 sounds of American English, with IPA and examples - Phonaria",
		description:
			"All 24 consonants and 16 vowels of American English, each with its IPA symbol, how it's made, how it's spelled, example words and minimal pairs.",
	},
	{
		path: "/sounds/th-thin",
		title: "How to pronounce the voiceless TH sound /θ/ (as in 'thin') - Phonaria",
		description:
			"How to say the voiceless TH sound /θ/ in 'thin' and 'think': how it's made, how it's spelled, and minimal pairs like three vs tree and think vs sink.",
	},
] as const;

test.describe("Metadata, robots, and sitemap", () => {
	for (const route of PUBLIC_ROUTES) {
		test(`serves server-rendered metadata for ${route.path}`, async ({ request, target }) => {
			const { response, html } = await fetchDocument(request, route.path);
			expect(response.status()).toBe(200);
			expect(documentTitle(html)).toBe(route.title);
			expect(metaContent(html, "description")).toBe(route.description);
			expect(canonicalHref(html)).toBe(expectedCanonical(target, route.path));
			expect(metaContent(html, "robots")).toBe(expectedRobots(target));
		});
	}

	test("serves pages in American English over HTTPS-only for a year", async ({ request }) => {
		const { response, html } = await fetchDocument(request, "/");
		expect(response.headers()["strict-transport-security"]).toBe("max-age=31536000");
		expect(html).toMatch(/<html lang="en-US"/);
	});

	test("titles a not-found page without a social card", async ({ request }) => {
		const { response, html } = await fetchDocument(request, "/sounds/nope");
		expect(response.status()).toBe(404);
		expect(documentTitle(html)).toBe(`Page not found - ${SITE_NAME}`);
		expect(html).not.toMatch(/(property|name)="(og|twitter):/);
	});

	test(
		"keeps robots.txt crawlable and only links the sitemap when indexing is on",
		{ tag: "@smoke" },
		async ({ request, target }) => {
			const response = await request.get("/robots.txt");
			expect(response.status()).toBe(200);
			const body = await response.text();
			expect(body).toMatch(/User-Agent:\s*\*/i);
			expect(body).toMatch(/Allow:\s*\//i);
			expect(body.toLowerCase()).not.toContain("disallow");
			if (target.indexingEnabled) {
				expect(body).toContain(`${target.expectedCanonicalOrigin}/sitemap.xml`);
			} else {
				expect(body.toLowerCase()).not.toContain("sitemap");
			}
		},
	);

	test("lists exactly the indexable application URLs and omits Practice", async ({
		request,
		target,
	}) => {
		const response = await request.get("/sitemap.xml");
		expect(response.status()).toBe(200);
		const xml = await response.text();
		for (const url of expectedSitemapUrls(target)) {
			expect(xml).toContain(`<loc>${url}</loc>`);
		}
		expect(xml).not.toContain("/practice");
		expect(xml).not.toContain("/ipa-chart</loc>");
		const contrastPages = `${target.expectedCanonicalOrigin}${MINIMAL_PAIRS_PATH}/`;
		expect(xml).toContain(`<loc>${contrastPages}th-s</loc>`);
		expect(xml.split(`<loc>${contrastPages}`).length - 1).toBe(MINIMAL_PAIR_CONTRAST_COUNT);
		const soundPages = `${target.expectedCanonicalOrigin}${SOUNDS_PATH}/`;
		expect(xml).toContain(`<loc>${soundPages}th-thin</loc>`);
		expect(xml.split(`<loc>${soundPages}`).length - 1).toBe(SOUND_PAGE_COUNT);
		expect(xml.match(/<loc>/g)?.length).toBe(
			expectedSitemapUrls(target).length + MINIMAL_PAIR_CONTRAST_COUNT + SOUND_PAGE_COUNT,
		);
	});
});
