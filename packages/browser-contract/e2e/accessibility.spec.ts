import { expectNoAxeViolations } from "../src/a11y";
import { skipUnlessPracticeEnabled } from "../src/capabilities";
import { KNOWN_WORD } from "../src/constants";
import { expect, test } from "../src/fixtures";
import { waitForHydration } from "../src/hydration";
import { notFoundHeading, textToTranscribe } from "../src/locators";

test.describe("Accessibility", () => {
	test(
		"has no serious axe violations on the transcription landing page",
		{ tag: "@smoke" },
		async ({ page }) => {
			await page.goto("/");
			await expect(textToTranscribe(page)).toBeVisible();
			await expectNoAxeViolations(page);
		},
	);

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

	test("skips past the header with the first Tab", async ({ page }) => {
		await page.goto("/sounds");
		const skipLink = page.getByRole("link", { name: "Skip to content", exact: true });
		await waitForHydration(skipLink);
		await page.keyboard.press("Tab");
		await expect(skipLink).toBeFocused();
		await page.keyboard.press("Enter");
		const main = page.locator("main");
		await expect(main).toBeFocused();
		await page.keyboard.press("Tab");
		await expect(main, "a click inside main must not focus it").not.toHaveAttribute("tabindex");
	});

	test("focuses the new page's heading after following a link from the keyboard", async ({
		page,
	}) => {
		await page.goto("/sounds");
		const link = page.locator('main a[href="/sounds/th-thin"]');
		await waitForHydration(link);
		await link.focus();
		await page.keyboard.press("Enter");
		await expect(
			page.getByRole("heading", { level: 1, name: "Voiceless TH", exact: true }),
		).toBeFocused();
	});

	test("has no serious axe violations on Credits", async ({ page }) => {
		await page.goto("/credits");
		await expect(page.getByRole("heading", { name: "Credits & Sources" })).toBeVisible();
		await expectNoAxeViolations(page);
	});

	test("has no serious axe violations on a minimal-pair contrast page", async ({ page }) => {
		await page.goto("/minimal-pairs/th-s");
		await expect(
			page.getByRole("heading", { level: 1, name: "θ vs s: think vs sink" }),
		).toBeVisible();
		await expectNoAxeViolations(page);
	});

	test("has no serious axe violations on a sound page", async ({ page }) => {
		await page.goto("/sounds/th-thin");
		await expect(
			page.getByRole("heading", { level: 1, name: "Voiceless TH", exact: true }),
		).toBeVisible();
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
