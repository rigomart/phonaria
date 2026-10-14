import { expect, test } from "../src/fixtures";

test.describe("Navigation and theme", () => {
	test("moves between transcription, charts, credits, and home", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByLabel("Text to transcribe")).toBeVisible();

		// The header's IPA Chart link opens the consonant chart; chart pages show section tabs.
		await expect(async () => {
			await page.getByRole("link", { name: "IPA Chart", exact: true }).click();
			await expect(page).toHaveURL(/\/ipa-chart\/consonants$/, { timeout: 1_000 });
		}).toPass({ timeout: 10_000 });
		await expect(page.getByRole("heading", { name: "Consonants" })).toBeVisible();

		await expect(async () => {
			await page.getByRole("link", { name: "Vowels", exact: true }).click();
			await expect(page).toHaveURL(/\/ipa-chart\/vowels$/, { timeout: 1_000 });
		}).toPass({ timeout: 15_000 });

		await page.getByRole("link", { name: "Credits" }).click();
		await expect(page).toHaveURL(/\/credits$/);
		await expect(page.getByRole("heading", { name: "Credits & Sources" })).toBeVisible();

		await page.getByRole("link", { name: "Phonaria", exact: true }).click();
		await expect(page).toHaveURL(/\/$/);
		await expect(page.getByLabel("Text to transcribe")).toBeVisible();
	});

	test("persists the dark theme across reload and navigation", async ({ page }) => {
		await page.goto("/");
		// The header's theme button steps System → Light → Dark; keep clicking until it reports Dark.
		const themeButton = page.getByRole("button", { name: /^Theme: / });
		await expect(async () => {
			await themeButton.click();
			await expect(page.getByRole("button", { name: /^Theme: Dark\./ })).toBeVisible({
				timeout: 1_000,
			});
		}).toPass({ timeout: 10_000 });
		await expect(page.locator("html")).toHaveClass(/dark/);

		await page.reload();
		await expect(page.locator("html")).toHaveClass(/dark/);

		await page.getByRole("link", { name: "Credits" }).click();
		await expect(page.locator("html")).toHaveClass(/dark/);
	});
});
