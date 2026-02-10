import { expect, test } from "@playwright/test";

test.describe("Transcription Flow", () => {
	test("user can transcribe text and see IPA output", async ({ page }) => {
		await page.goto("/en/transcription");

		// User types text
		const input = page.getByLabel("Text to transcribe");
		await input.fill("hello world");

		// User submits
		await page.locator("button[type='submit']").click();

		// User sees both words transcribed
		await expect(page.getByText("hello").first()).toBeVisible({ timeout: 15_000 });
		await expect(page.getByText("world").first()).toBeVisible();

		// IPA phoneme buttons are present (clickable phoneme symbols)
		const phonemeButtons = page.locator("button").filter({ hasText: /^[hɛloʊwɝd]$/ });
		await expect(phonemeButtons.first()).toBeVisible();
	});

	test("user can click a phoneme to see details", async ({ page }) => {
		await page.goto("/en/transcription");

		// Transcribe a simple word
		await page.getByLabel("Text to transcribe").fill("cat");
		await page.locator("button[type='submit']").click();

		// Wait for transcription
		await expect(page.getByText("cat").first()).toBeVisible({ timeout: 15_000 });

		// Click a phoneme button
		const phonemeButton = page
			.locator("button")
			.filter({ hasText: /^[kæt]$/ })
			.first();
		await phonemeButton.click();

		// User sees phoneme details (look for "Pronunciation" heading or articulation content)
		await expect(page.getByText(/pronunciation|how this sound/i).first()).toBeVisible({
			timeout: 5_000,
		});
	});

	test("copy button is available after transcription", async ({ page }) => {
		await page.goto("/en/transcription");

		await page.getByLabel("Text to transcribe").fill("test");
		await page.locator("button[type='submit']").click();

		await expect(page.getByText("test").first()).toBeVisible({ timeout: 15_000 });

		// Copy button should be visible and clickable
		const copyButton = page.getByRole("button", { name: /copy/i });
		await expect(copyButton).toBeVisible();
		await expect(copyButton).toBeEnabled();
	});
});
