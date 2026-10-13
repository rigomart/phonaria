import { skipUnlessBucketAssets } from "../src/capabilities";
import {
	CONSONANT_SOUND_NAME,
	CONSONANT_COUNT_COPY,
	VOWEL_SOUND_NAME,
	VOWEL_COUNT_COPY,
} from "../src/constants";
import { expect, test } from "../src/fixtures";
import { notFoundHeading } from "../src/locators";

test.describe("IPA charts", () => {
	test("renders consonant chart content and opens a sound's page", async ({ page }) => {
		await page.goto("/ipa-chart/consonants");
		await expect(page.getByText(CONSONANT_COUNT_COPY)).toBeVisible();
		await page.getByRole("link", { name: CONSONANT_SOUND_NAME }).click();
		await expect(page).toHaveURL(/\/ipa-chart\/p$/);
		await expect(page.getByRole("heading", { level: 1 })).toHaveText("/p/");
		await expect(page.getByText("Voiceless bilabial plosive")).toBeVisible();
	});

	test("opens a diphthong's page and moves to a neighbouring sound", async ({ page }) => {
		await page.goto("/ipa-chart/ai");
		await expect(page.getByRole("heading", { level: 1 })).toHaveText("/aɪ/");
		const vowels = page.getByRole("navigation", { name: "Vowel sounds" });
		await expect(vowels.locator('[aria-current="page"]')).toHaveText("aɪ");
		await vowels.getByRole("link", { name: /^Close-mid back rounded to/ }).click();
		await expect(page).toHaveURL(/\/ipa-chart\/ou$/);
		await expect(page.getByRole("heading", { level: 1 })).toHaveText("/oʊ/");
	});

	test("opens a transcribed sound's page from its popover", async ({ page }) => {
		await page.goto("/?q=hello");
		await page.getByRole("button", { name: "Details for /h/" }).first().click();
		await page.getByRole("link", { name: "Voiceless glottal fricative, open its page" }).click();
		await expect(page).toHaveURL(/\/ipa-chart\/h$/);
		await expect(page.getByRole("heading", { level: 1 })).toHaveText("/h/");
	});

	test("toggles diphthongs on the vowel chart", async ({ page }) => {
		await page.goto("/ipa-chart/vowels");
		await expect(page.getByText(VOWEL_COUNT_COPY)).toBeVisible();
		await expect(page.getByRole("link", { name: VOWEL_SOUND_NAME })).toBeVisible();
		await expect(page.locator("[data-diphthong]")).toHaveCount(0);

		await page.getByText("Show diphthongs").click();
		await expect(page.locator("[data-diphthong]").first()).toBeVisible();
	});

	test("loads articulation media from the asset bucket", { tag: "@smoke" }, async ({ page }) => {
		skipUnlessBucketAssets();

		const diagramUrls: string[] = [];
		page.on("response", (response) => {
			if (response.url().includes("/diagrams/") && response.ok()) {
				diagramUrls.push(response.url());
			}
		});

		await page.goto("/ipa-chart/p");
		await expect(page.getByLabel("Play p")).toBeEnabled({ timeout: 10_000 });
		await expect.poll(() => diagramUrls.length).toBeGreaterThan(0);
	});

	test("returns not-found for unknown chart and articulation routes", async ({ page }) => {
		for (const path of [
			"/ipa-chart/not-a-chart",
			"/ipa-chart/x",
			"/ipa-chart/articulation/missing",
		]) {
			const response = await page.goto(path);
			expect(response?.status()).toBe(404);
			await expect(notFoundHeading(page)).toBeVisible();
		}
	});
});
