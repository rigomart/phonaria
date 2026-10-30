import type { Locator, Page } from "@playwright/test";
import { SOUND_PAGE_COUNT, SOUNDS_PATH } from "../src/constants";
import { expect, test } from "../src/fixtures";
import { waitForHydration } from "../src/hydration";
import { notFoundHeading } from "../src/locators";

const CHART_PATH = "/ipa-chart/consonants";
const TH_TILE = "Voiceless dental fricative (θ)";
const TH_PAGE = "/sounds/th-thin";
const TH_HEADING = "/θ/, Voiceless dental fricative";

test.describe("Sound pages", () => {
	test("serves a sound's page", { tag: "@smoke" }, async ({ page }) => {
		const response = await page.goto(TH_PAGE);
		expect(response?.status()).toBe(200);
		await expect(page).toHaveTitle("The /θ/ sound (th in 'thin'): how to pronounce it - Phonaria");
		await expect(page.getByRole("heading", { level: 1, name: TH_HEADING })).toBeVisible();
		await expect(page.getByRole("link", { name: "All sounds" })).toHaveAttribute(
			"href",
			SOUNDS_PATH,
		);
	});

	test("lists every sound, each linked to its page", async ({ page }) => {
		const response = await page.goto(SOUNDS_PATH);
		expect(response?.status()).toBe(200);
		await expect(page.locator('main a[href^="/sounds/"]')).toHaveCount(SOUND_PAGE_COUNT);
		await expect(page.getByRole("link", { name: "/θ/ as in thin" })).toHaveAttribute(
			"href",
			TH_PAGE,
		);
	});

	test("returns not-found for an unknown sound", async ({ page }) => {
		const response = await page.goto("/sounds/nope");
		expect(response?.status()).toBe(404);
		await expect(notFoundHeading(page)).toBeVisible();
	});
});

async function openDetails(page: Page, tile: Locator) {
	await waitForHydration(tile);
	await tile.click();
	await expect(page.getByRole("dialog", { name: /Voiceless dental fricative$/ })).toBeVisible();
	await expect(page).toHaveURL(new RegExp(`${CHART_PATH}$`));
}

test.describe("Chart tiles link to sound pages", () => {
	test("a plain click opens the details without leaving the chart", async ({ page }) => {
		await page.goto(CHART_PATH);
		const tile = page.getByRole("button", { name: TH_TILE });
		await expect(tile).toHaveAttribute("href", TH_PAGE);
		await openDetails(page, tile);

		await page.getByRole("button", { name: "Full details for /θ/" }).click();
		await expect(page.getByRole("link", { name: "Open full page" })).toHaveAttribute(
			"href",
			TH_PAGE,
		);
	});

	test("with the side panel open, a plain click swaps its sound without leaving the chart", async ({
		page,
	}) => {
		await page.goto(CHART_PATH);
		await openDetails(page, page.getByRole("button", { name: TH_TILE }));
		await page.getByRole("button", { name: "Full details for /θ/" }).click();

		await page.getByRole("button", { name: "Voiced dental fricative (ð)" }).click();
		await expect(page.getByRole("dialog", { name: /Voiced dental fricative$/ })).toBeVisible();
		await expect(page.getByRole("link", { name: "Open full page" })).toHaveAttribute(
			"href",
			"/sounds/th-this",
		);
		await expect(page).toHaveURL(new RegExp(`${CHART_PATH}$`));
	});

	test("every chart's sounds link to their pages", async ({ page }) => {
		await page.goto(CHART_PATH);
		await expect(page.locator('main a[href^="/sounds/"]')).toHaveCount(24);

		await page.goto("/ipa-chart/vowels");
		await expect(page.getByRole("button", { name: /\(æ\)$/ })).toHaveAttribute(
			"href",
			"/sounds/ae-cat",
		);
		const diphthongs = page.getByRole("button", { name: "Diphthongs" });
		await waitForHydration(diphthongs);
		await diphthongs.click();
		await expect(page.locator('main a[href^="/sounds/"]')).toHaveCount(16);
		await expect(page.locator('[data-diphthong="AI"]')).toHaveAttribute("href", "/sounds/eye-time");

		await page.goto("/ipa-chart/frequency");
		await expect(page.locator('main ol a[href^="/sounds/"]')).toHaveCount(SOUND_PAGE_COUNT);
		await expect(page.getByRole("button", { name: /^\/ʃ\/ as in shop:/ })).toHaveAttribute(
			"href",
			"/sounds/sh-shop",
		);
	});

	test("Enter on a tile opens the details without leaving the chart", async ({ page }) => {
		await page.goto(CHART_PATH);
		const tile = page.getByRole("button", { name: TH_TILE });
		await waitForHydration(tile);
		await tile.focus();
		await page.keyboard.press("Enter");
		await expect(page.getByRole("dialog", { name: /Voiceless dental fricative$/ })).toBeVisible();
		await expect(page).toHaveURL(new RegExp(`${CHART_PATH}$`));
	});

	const modifiedClicks: [string, Parameters<Locator["click"]>[0]][] = [
		["cmd/ctrl-click", { modifiers: ["ControlOrMeta"] }],
		["middle-click", { button: "middle" }],
	];
	for (const [name, click] of modifiedClicks) {
		test(`a ${name} opens the sound's page in a new tab`, async ({ page, context }) => {
			await page.goto(CHART_PATH);
			const tile = page.getByRole("button", { name: TH_TILE });
			await waitForHydration(tile);

			const [newTab] = await Promise.all([context.waitForEvent("page"), tile.click(click)]);
			await expect(newTab).toHaveURL(new RegExp(`${TH_PAGE}$`));
			await expect(newTab.getByRole("heading", { level: 1, name: TH_HEADING })).toBeVisible();
			await expect(page).toHaveURL(new RegExp(`${CHART_PATH}$`));
			await expect(page.getByRole("dialog")).toHaveCount(0);
		});
	}

	test.describe("on a phone", () => {
		test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

		test("a tap opens the drawer, which links to the sound's page", async ({ page }) => {
			await page.goto(CHART_PATH);
			const tile = page.getByRole("button", { name: TH_TILE });
			await waitForHydration(tile);
			await tile.tap();
			await expect(page.getByRole("dialog", { name: /Voiceless dental fricative$/ })).toBeVisible();
			await expect(page).toHaveURL(new RegExp(`${CHART_PATH}$`));

			await page.getByRole("link", { name: "Open full page" }).tap();
			await expect(page).toHaveURL(new RegExp(`${TH_PAGE}$`));
			await expect(page.getByRole("heading", { level: 1, name: TH_HEADING })).toBeVisible();
		});
	});
});
