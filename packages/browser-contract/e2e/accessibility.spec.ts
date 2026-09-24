import { expectNoAxeViolations } from "../src/a11y";
import { skipUnlessPracticeEnabled } from "../src/capabilities";
import { KNOWN_WORD } from "../src/constants";
import { expect, test } from "../src/fixtures";
import { notFoundHeading, textToTranscribe } from "../src/locators";

test.describe("Accessibility", () => {
	test("has no serious axe violations on the transcription landing page", async ({ page }) => {
		await page.goto("/");
		await expect(textToTranscribe(page)).toBeVisible();
		await expectNoAxeViolations(page);
	});

	test("keeps the transcription field labelled and submittable from the keyboard", async ({
		page,
	}) => {
		await page.goto("/");
		await textToTranscribe(page).pressSequentially(KNOWN_WORD);
		await page.keyboard.press("Enter");
		await expect(page.getByText(KNOWN_WORD, { exact: true }).first()).toBeVisible({
			timeout: 20_000,
		});
	});

	test("has no serious axe violations on Credits", async ({ page }) => {
		await page.goto("/credits");
		await expect(page.getByRole("heading", { name: "Credits & Sources" })).toBeVisible();
		await expectNoAxeViolations(page);
	});

	test("has no serious axe violations on the consonant chart", async ({ page }) => {
		await page.goto("/ipa-chart/consonants");
		await expect(page.getByRole("heading", { name: "Consonants" })).toBeVisible();
		await expectNoAxeViolations(page);
	});

	test("has no serious axe violations on the vowel chart", async ({ page }) => {
		await page.goto("/ipa-chart/vowels");
		await expect(page.getByRole("heading", { name: "Vowels" })).toBeVisible();
		await expectNoAxeViolations(page);
	});

	test("has no serious axe violations on the not-found page", async ({ page }) => {
		await page.goto("/does-not-exist");
		await expect(notFoundHeading(page)).toBeVisible();
		await expectNoAxeViolations(page);
	});

	test("has no serious axe violations on Practice when it is enabled", async ({ page }) => {
		skipUnlessPracticeEnabled();
		await page.goto("/practice");
		await expect(page.getByRole("heading", { name: "Practice" })).toBeVisible();
		await expectNoAxeViolations(page);
	});
});
