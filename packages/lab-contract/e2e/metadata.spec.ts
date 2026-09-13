import { SITE_DESCRIPTION, SITE_NAME } from "../src/constants";
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
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
	},
	{
		path: "/credits",
		title: "Credits & Sources - Phonaria Lab",
		description: "Credits and sources for Phonaria resources, data, and media.",
	},
	{
		path: "/ipa-chart/consonants",
		title: "Consonants — IPA Chart - Phonaria Lab",
		description: "Interactive IPA chart for American English consonants.",
	},
	{
		path: "/ipa-chart/vowels",
		title: "Vowels — IPA Chart - Phonaria Lab",
		description: "Interactive IPA chart for American English vowels.",
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

	test("keeps robots.txt crawlable and only links the sitemap when indexing is on", async ({
		request,
		target,
	}) => {
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
	});

	test("lists exactly the indexable Lab URLs and omits Practice", async ({ request, target }) => {
		const response = await request.get("/sitemap.xml");
		expect(response.status()).toBe(200);
		const xml = await response.text();
		for (const url of expectedSitemapUrls(target)) {
			expect(xml).toContain(`<loc>${url}</loc>`);
		}
		expect(xml).not.toContain("/practice");
		expect(xml).not.toContain("/ipa-chart</loc>");
		expect(xml.match(/<loc>/g)?.length).toBe(expectedSitemapUrls(target).length);
	});
});
