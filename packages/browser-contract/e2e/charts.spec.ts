import { skipUnlessBucketAssets } from "../src/capabilities";
import {
	CONSONANT_BUTTON_NAME,
	CONSONANT_COUNT_COPY,
	VOWEL_BUTTON_NAME,
	VOWEL_COUNT_COPY,
} from "../src/constants";
import { expect, test } from "../src/fixtures";
import { notFoundHeading } from "../src/locators";

test.describe("IPA charts", () => {
	test("renders consonant chart content and opens a sound's details", async ({ page }) => {
		await page.goto("/ipa-chart/consonants");
		await expect(page.getByText(CONSONANT_COUNT_COPY)).toBeVisible();
		await page.getByRole("button", { name: CONSONANT_BUTTON_NAME }).click();
		await expect(page.getByText("Voiceless bilabial plosive")).toBeVisible();
		await expect(page).toHaveURL(/\/ipa-chart\/consonants\?sound=P$/);
		await expect(page.getByRole("button", { name: CONSONANT_BUTTON_NAME })).toHaveAttribute(
			"aria-current",
			"true",
		);
	});

	test("selects a diphthong from the URL and shows its layer", async ({ page }) => {
		await page.goto("/ipa-chart/vowels?sound=AI");
		await expect(page.locator('[data-diphthong="AI"]')).toHaveAttribute("aria-current", "true");
		await expect(page.locator("aside h2")).toHaveText("/aɪ/");
	});

	test("opens a transcribed sound in the IPA chart", async ({ page }) => {
		await page.goto("/?q=hello");
		await page.getByRole("button", { name: "Details for /h/" }).first().click();
		await page.getByRole("link", { name: /open in the IPA chart/ }).click();
		await expect(page).toHaveURL(/\/ipa-chart\/consonants\?sound=H$/);
		await expect(
			page.getByRole("button", { name: /Voiceless glottal fricative \(h\)/ }),
		).toHaveAttribute("aria-current", "true");
	});

	test("toggles diphthongs on the vowel chart", async ({ page }) => {
		await page.goto("/ipa-chart/vowels");
		await expect(page.getByText(VOWEL_COUNT_COPY)).toBeVisible();
		await expect(page.getByRole("button", { name: VOWEL_BUTTON_NAME })).toBeVisible();
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

		await page.goto("/ipa-chart/consonants");
		await expect(async () => {
			await page.getByRole("button", { name: CONSONANT_BUTTON_NAME }).click();
			await expect(page.getByLabel("Play p")).toBeEnabled({ timeout: 1_000 });
		}).toPass({ timeout: 10_000 });
		await expect.poll(() => diagramUrls.length).toBeGreaterThan(0);
	});

	test("returns not-found for unknown chart and articulation routes", async ({ page }) => {
		for (const path of ["/ipa-chart/not-a-chart", "/ipa-chart/articulation/missing"]) {
			const response = await page.goto(path);
			expect(response?.status()).toBe(404);
			await expect(notFoundHeading(page)).toBeVisible();
		}
	});
});
