import {
	skipUnlessLanguageSpreadDisabled,
	skipUnlessLanguageSpreadEnabled,
} from "../src/capabilities";
import { expect, test } from "../src/fixtures";
import { notFoundHeading } from "../src/locators";

test.describe("Language Spread disabled", () => {
	test.beforeEach(() => {
		skipUnlessLanguageSpreadDisabled();
	});

	test("hides the Language Spread nav link", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByRole("navigation").getByRole("link", { name: "Language Spread" }),
		).toHaveCount(0);
	});

	test("returns not-found for the page", { tag: "@smoke" }, async ({ page }) => {
		const response = await page.goto("/language-spread");
		expect(response?.status()).toBe(404);
		await expect(notFoundHeading(page)).toBeVisible();
	});
});

test.describe("Language Spread enabled", () => {
	test.beforeEach(() => {
		skipUnlessLanguageSpreadEnabled();
	});

	test("links the page from the main nav", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Language Spread" }),
		).toHaveAttribute("href", "/language-spread");
	});

	test("opens the story with the map and the era", { tag: "@smoke" }, async ({ page }) => {
		const response = await page.goto("/language-spread");
		expect(response?.status()).toBe(200);
		await expect(
			page.getByRole("heading", { level: 1, name: "How languages spread" }),
		).toBeVisible();
		await expect(page.getByRole("region", { name: /Map of where languages spread/ })).toBeVisible();
		await expect(page.locator("[data-era]")).toHaveText("~70,000 years ago");
	});

	test("advances the era as the story scrolls", async ({ page }) => {
		await page.goto("/language-spread");
		// The camera settles only once the page has hydrated and is listening for scrolls.
		await expect(page.locator('[data-camera="settled"]')).toBeAttached();
		await page.locator("[data-step=bantu]").evaluate((step) => step.scrollIntoView());
		await expect(page.locator("[data-era]")).toHaveText("~3000 BCE");
		await expect(page.locator('[data-stop="bantu"][data-revealed]')).toBeAttached();
	});
});
