import { HOME_TITLE } from "../src/constants";
import { expect, test } from "../src/fixtures";
import { notFoundHeading } from "../src/locators";

test.describe("Application routes", () => {
	test("serves the transcription landing page", { tag: "@smoke" }, async ({ page }) => {
		const response = await page.goto("/");
		expect(response?.status()).toBe(200);
		await expect(page.getByLabel("Text to transcribe")).toBeVisible();
		await expect(page).toHaveTitle(HOME_TITLE);
	});

	test("permanently redirects a shared /?q= link to its search", async ({ request }) => {
		const response = await request.get("/?q=hello", { maxRedirects: 0 });
		expect(response.status()).toBe(308);
		expect(response.headers().location).toBe("/search?q=hello");
	});

	test("keeps a shared query that looks like JSON as the same text", async ({ request }) => {
		const response = await request.get("/?q=%22null%22", { maxRedirects: 0 });
		expect(response.status()).toBe(308);
		expect(response.headers().location).toBe("/search?q=%22null%22");
	});

	test("sends a search with nothing to look up back to the homepage", async ({ request }) => {
		const response = await request.get("/search", { maxRedirects: 0 });
		expect(response.status()).toBe(307);
		expect(response.headers().location).toBe("/");
	});

	test("keeps search results out of indexes", async ({ page }) => {
		await page.goto("/search?q=hello");
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
	});

	test("permanently redirects the IPA chart entry to consonants", async ({ request }) => {
		const response = await request.get("/ipa-chart", { maxRedirects: 0 });
		expect(response.status()).toBe(308);
		expect(response.headers().location).toBe("/ipa-chart/consonants");
	});

	for (const [legacyPath, targetPath] of [
		["/en", "/"],
		["/es/transcription", "/"],
		["/en/credits", "/credits"],
		["/es/ipa-chart", "/ipa-chart/consonants"],
		["/en/ipa-chart?tab=vowels", "/ipa-chart/vowels"],
	] as const) {
		test(`permanently redirects legacy route ${legacyPath} without a chain`, async ({
			request,
		}) => {
			const response = await request.get(legacyPath, { maxRedirects: 0 });
			expect(response.status()).toBe(308);
			expect(new URL(response.headers().location).pathname).toBe(targetPath);
		});
	}

	for (const [oldUrl, mainUrl] of [
		["https://phonaria-lab.rigos.dev/en/credits", "https://phonaria.rigos.dev/credits"],
		[
			"https://phonaria-lab.rigos.dev/ipa-chart/consonants",
			"https://phonaria.rigos.dev/ipa-chart/consonants",
		],
		[
			"https://phonaria-lab.rigos.dev/ipa-chart/vowels",
			"https://phonaria.rigos.dev/ipa-chart/vowels",
		],
	] as const) {
		test(`redirects former-host URL ${oldUrl} directly to the main hostname`, async ({
			request,
			target,
		}) => {
			test.skip(
				target.name !== "cloudflare-production",
				"The former public hostname only exists in production.",
			);
			const response = await request.get(oldUrl, { maxRedirects: 0 });
			expect(response.status()).toBe(308);
			expect(response.headers().location).toBe(mainUrl);
		});
	}

	test("returns a real not-found page for unknown routes", async ({ page }) => {
		const response = await page.goto("/does-not-exist");
		expect(response?.status()).toBe(404);
		await expect(notFoundHeading(page)).toBeVisible();
		await expect(page.getByRole("link", { name: "Back to Phonaria" })).toBeVisible();
	});
});
