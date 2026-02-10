import { expect, test } from "@playwright/test";

test.describe("Find by Sound Flow", () => {
	test("user can search words by phoneme pattern", async ({ page }) => {
		await page.goto("/en/find-by-sound");

		// User clicks a phoneme on the keyboard (e.g., /k/)
		const kButton = page.locator("button").filter({ hasText: /^k$/ }).first();
		await kButton.click();

		// User sees search results
		await expect(page.getByText(/results|found|words/i).first()).toBeVisible({ timeout: 10_000 });

		// Results should include words starting with /k/
		await expect(page.getByText(/cat|can|car|come|keep/i).first()).toBeVisible();
	});

	test("user can build multi-phoneme sequences", async ({ page }) => {
		await page.goto("/en/find-by-sound");

		// User builds /kæ/ sequence
		await page.locator("button").filter({ hasText: /^k$/ }).first().click();
		await page.waitForTimeout(500);

		await page.locator("button").filter({ hasText: /^æ$/ }).first().click();

		// Results should narrow to words with /kæ/ pattern
		await expect(page.getByText(/results|found/i).first()).toBeVisible({ timeout: 10_000 });
	});

	test("user can clear phoneme selection and start over", async ({ page }) => {
		await page.goto("/en/find-by-sound");

		// Select a phoneme
		await page.locator("button").filter({ hasText: /^p$/ }).first().click();
		await page.waitForTimeout(500);

		// Clear the selection
		const clearButton = page.getByRole("button", { name: /clear/i });
		await clearButton.click();

		// Empty state message should reappear
		await expect(page.getByText(/select|click|choose/i).first()).toBeVisible();
	});
});
