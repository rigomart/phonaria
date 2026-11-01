import { expect, test } from "../src/fixtures";
import { waitForHydration } from "../src/hydration";

test.describe("Navigation and theme", () => {
	test("moves between transcription, charts, credits, and home", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByLabel("Text to transcribe")).toBeVisible();

		const sounds = page.getByRole("button", { name: "Sounds", exact: true });
		const openSounds = async (link: string) => {
			await waitForHydration(sounds);
			await sounds.click();
			await page.getByRole("link", { name: link, exact: true }).click();
		};
		await openSounds("Consonant chart");
		await expect(page).toHaveURL(/\/ipa-chart\/consonants$/);
		await expect(page.getByRole("heading", { name: "Consonants" })).toBeVisible();

		await openSounds("Vowel chart");
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
