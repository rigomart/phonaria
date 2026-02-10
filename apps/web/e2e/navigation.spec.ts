import { expect, test } from "@playwright/test";

test.describe("Navigation Flow", () => {
	test("user can navigate between main pages", async ({ page }) => {
		// Start at transcription page
		await page.goto("/en/transcription");
		await expect(page.getByLabel("Text to transcribe")).toBeVisible();

		// Navigate to IPA Chart via header link
		await page.getByRole("link", { name: /ipa/i }).first().click();
		await expect(page).toHaveURL("/en/ipa-chart");

		// Navigate to Insights
		await page
			.getByRole("link", { name: /insights/i })
			.first()
			.click();
		await expect(page).toHaveURL("/en/insights");

		// Navigate back to landing
		await page.getByText("Phonaria").first().click();
		await expect(page).toHaveURL("/en");
	});

	test("user can switch locale", async ({ page }) => {
		await page.goto("/en/transcription");

		// Click the language switcher (aria-label="Language")
		await page.getByRole("button", { name: "Language" }).click();

		// Select Spanish
		await page.getByRole("menuitem", { name: /spanish/i }).click();

		// URL should change to Spanish locale
		await expect(page).toHaveURL(/\/es\/transcription/);

		// Page content should be in Spanish
		await expect(page.getByLabel(/texto.*transcribir/i)).toBeVisible();
	});
});
