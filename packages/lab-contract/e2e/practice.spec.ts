import { skipUnlessPracticeDisabled, skipUnlessPracticeEnabled } from "../src/capabilities";
import { expect, test } from "../src/fixtures";
import { notFoundHeading } from "../src/locators";

test.describe("Practice disabled", () => {
	test.beforeEach(() => {
		skipUnlessPracticeDisabled();
	});

	test("hides the Practice nav link", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("navigation").getByRole("link", { name: "Practice" })).toHaveCount(
			0,
		);
	});

	test("returns not-found for the Practice index", async ({ page }) => {
		const response = await page.goto("/practice");
		expect(response?.status()).toBe(404);
		await expect(notFoundHeading(page)).toBeVisible();
	});

	test("returns not-found for a known Practice topic", async ({ page }) => {
		const response = await page.goto("/practice/schwa");
		expect(response?.status()).toBe(404);
		await expect(notFoundHeading(page)).toBeVisible();
	});

	test("returns not-found for an unknown Practice topic", async ({ page }) => {
		const response = await page.goto("/practice/not-a-topic");
		expect(response?.status()).toBe(404);
		await expect(notFoundHeading(page)).toBeVisible();
	});
});

test.describe("Practice enabled", () => {
	test.beforeEach(() => {
		skipUnlessPracticeEnabled();
	});

	test("shows Practice in navigation and lists Schwa", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("link", { name: "Practice" })).toBeVisible();
		await page.getByRole("link", { name: "Practice" }).click();
		await expect(page).toHaveURL(/\/practice$/);
		await expect(page.getByRole("heading", { name: "Practice" })).toBeVisible();
		await expect(page.getByRole("link", { name: /Schwa/ })).toBeVisible();
	});

	test("returns not-found for an unknown Practice topic", async ({ page }) => {
		const response = await page.goto("/practice/not-a-topic");
		expect(response?.status()).toBe(404);
		await expect(notFoundHeading(page)).toBeVisible();
	});

	test("completes one Schwa session with blank answers", async ({ page }) => {
		test.setTimeout(90_000);
		await page.goto("/practice/schwa");
		await expect(page.getByRole("heading", { name: "Schwa" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Start session" })).toBeEnabled({
			timeout: 30_000,
		});
		await page.getByRole("button", { name: "Start session" }).click();

		for (let round = 0; round < 4; round++) {
			await page.getByRole("button", { name: "Next word" }).click();
		}
		await page.getByRole("button", { name: "Finish session" }).click();
		await expect(page.getByRole("heading", { name: "0 of 5 answered" })).toBeVisible();
		await page.getByRole("button", { name: "Submit with 5 blanks" }).click();
		await expect(page.getByText("Session complete")).toBeVisible();
		await expect(page.getByRole("button", { name: "New session" })).toBeVisible();
	});
});
