import { SITE_NAME } from "../src/constants";
import { expect, test } from "../src/fixtures";
import { notFoundHeading } from "../src/locators";

test.describe("Lab routes", () => {
	test("serves the transcription landing page", async ({ page }) => {
		const response = await page.goto("/");
		expect(response?.status()).toBe(200);
		await expect(page.getByLabel("Text to transcribe")).toBeVisible();
		await expect(page).toHaveTitle(SITE_NAME);
	});

	test("serves Credits", async ({ page }) => {
		const response = await page.goto("/credits");
		expect(response?.status()).toBe(200);
		await expect(page.getByRole("heading", { name: "Credits & Sources" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "Wiktionary" })).toBeVisible();
	});

	test("serves the consonant chart", async ({ page }) => {
		const response = await page.goto("/ipa-chart/consonants");
		expect(response?.status()).toBe(200);
		await expect(page.getByRole("heading", { name: "Consonants" })).toBeVisible();
	});

	test("serves the vowel chart", async ({ page }) => {
		const response = await page.goto("/ipa-chart/vowels");
		expect(response?.status()).toBe(200);
		await expect(page.getByRole("heading", { name: "Vowels" })).toBeVisible();
	});

	test("temporarily redirects the IPA chart entry to consonants", async ({ request }) => {
		const response = await request.get("/ipa-chart", { maxRedirects: 0 });
		expect(response.status()).toBe(307);
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
