import { expect, test } from "../src/fixtures";

test.describe("Navigation and theme", () => {
	test("moves between transcription, charts, credits, and home", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByLabel("Text to transcribe")).toBeVisible();

		await page.getByRole("button", { name: "IPA Chart" }).click();
		await page.getByRole("link", { name: "Consonants" }).click();
		await expect(page).toHaveURL(/\/ipa-chart\/consonants$/);
		await expect(page.getByRole("heading", { name: "Consonants" })).toBeVisible();

		await page.getByRole("button", { name: "IPA Chart" }).click();
		await page.getByRole("link", { name: "Vowels" }).click();
		await expect(page).toHaveURL(/\/ipa-chart\/vowels$/);

		await page.getByRole("link", { name: "Credits" }).click();
		await expect(page).toHaveURL(/\/credits$/);
		await expect(page.getByRole("heading", { name: "Credits & Sources" })).toBeVisible();

		await page.getByRole("link", { name: "Phonaria", exact: true }).click();
		await expect(page).toHaveURL(/\/$/);
		await expect(page.getByLabel("Text to transcribe")).toBeVisible();
	});

	test("persists the dark theme across reload and navigation", async ({ page }) => {
		await page.goto("/");
		await page.getByLabel("Toggle theme").click();
		await page.getByRole("menuitem", { name: "Dark" }).click();
		await expect(page.locator("html")).toHaveClass(/dark/);

		await page.reload();
		await expect(page.locator("html")).toHaveClass(/dark/);

		await page.getByRole("link", { name: "Credits" }).click();
		await expect(page.locator("html")).toHaveClass(/dark/);
	});
});
