import { skipUnlessBucketAssets } from "../src/capabilities";
import {
	CONSONANT_BUTTON_NAME,
	CONSONANT_COUNT_COPY,
	VOWEL_BUTTON_NAME,
	VOWEL_COUNT_COPY,
} from "../src/constants";
import { expect, test } from "../src/fixtures";

test.describe("IPA charts", () => {
	test("renders consonant chart content and opens a phoneme popover", async ({ page }) => {
		await page.goto("/ipa-chart/consonants");
		await expect(page.getByText(CONSONANT_COUNT_COPY)).toBeVisible();
		await page.getByRole("button", { name: CONSONANT_BUTTON_NAME }).click();
		await expect(page.getByText("Voiceless bilabial plosive")).toBeVisible();
	});

	test("toggles diphthongs on the vowel chart", async ({ page }) => {
		await page.goto("/ipa-chart/vowels");
		await expect(page.getByText(VOWEL_COUNT_COPY)).toBeVisible();
		await expect(page.getByRole("button", { name: VOWEL_BUTTON_NAME })).toBeVisible();
		await expect(page.locator("[data-diphthong]")).toHaveCount(0);

		await page.getByText("Show diphthongs").click();
		await expect(page.locator("[data-diphthong]").first()).toBeVisible();
	});

	test("loads articulation media from the asset bucket", async ({ page }) => {
		skipUnlessBucketAssets();

		const diagramUrls: string[] = [];
		page.on("response", (response) => {
			if (response.url().includes("/diagrams/") && response.ok()) {
				diagramUrls.push(response.url());
			}
		});

		await page.goto("/ipa-chart/consonants");
		await page.getByRole("button", { name: CONSONANT_BUTTON_NAME }).click();
		await expect(page.getByLabel("Play p")).toBeEnabled();
		await expect.poll(() => diagramUrls.length).toBeGreaterThan(0);
	});
});
