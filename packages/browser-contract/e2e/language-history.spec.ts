import {
	skipUnlessLanguageHistoryDisabled,
	skipUnlessLanguageHistoryEnabled,
} from "../src/capabilities";
import { expect, test } from "../src/fixtures";
import { notFoundHeading } from "../src/locators";

test.describe("History disabled", () => {
	test.beforeEach(() => {
		skipUnlessLanguageHistoryDisabled();
	});

	test("hides the History nav link", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("navigation").getByRole("link", { name: "History" })).toHaveCount(
			0,
		);
	});

	test("returns not-found for the page", { tag: "@smoke" }, async ({ page }) => {
		const response = await page.goto("/history");
		expect(response?.status()).toBe(404);
		await expect(notFoundHeading(page)).toBeVisible();
	});
});

test.describe("History enabled", () => {
	test.beforeEach(() => {
		skipUnlessLanguageHistoryEnabled();
	});

	test("links the page from the main nav", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "History" }),
		).toHaveAttribute("href", "/history");
	});

	test("opens the story with the map and the era", { tag: "@smoke" }, async ({ page }) => {
		const response = await page.goto("/history");
		expect(response?.status()).toBe(200);
		await expect(
			page.getByRole("heading", { level: 1, name: "The story of English" }),
		).toBeVisible();
		await expect(page.getByRole("region", { name: /Map of where languages spread/ })).toBeVisible();
		await expect(page.locator("[data-era]")).toHaveText("~4000 BCE");
	});

	test("advances the era as the story scrolls", async ({ page }) => {
		await page.goto("/history");
		// The camera settles only once the page has hydrated and is listening for scrolls.
		await expect(page.locator('[data-camera="settled"]')).toBeAttached();
		await page.locator("[data-step=vikings]").evaluate((step) => step.scrollIntoView());
		await expect(page.locator("[data-era]")).toHaveText("~800 CE");
		await expect(page.locator('[data-stop="old-norse"][data-revealed]')).toBeAttached();
	});
});
