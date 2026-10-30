import { skipUnlessSpeechDisabled, skipUnlessSpeechEnabled } from "../src/capabilities";
import { MINIMAL_PAIR_CONTRAST_COUNT } from "../src/constants";
import { expect, test } from "../src/fixtures";
import { notFoundHeading } from "../src/locators";

test.describe("Minimal-pair pages", () => {
	test("lists every contrast, each linked to its page", async ({ page }) => {
		const response = await page.goto("/minimal-pairs");
		expect(response?.status()).toBe(200);
		await expect(page.getByRole("heading", { level: 1, name: "Minimal pairs" })).toBeVisible();
		await expect(page.locator('main a[href^="/minimal-pairs/"]')).toHaveCount(
			MINIMAL_PAIR_CONTRAST_COUNT,
		);
		await expect(page.getByRole("link", { name: "thin and sin" })).toHaveAttribute(
			"href",
			"/minimal-pairs/th-s",
		);
	});

	test("permanently redirects an old ?contrast= link to the contrast's page", async ({
		request,
	}) => {
		const response = await request.get("/minimal-pairs?contrast=th-s", { maxRedirects: 0 });
		expect(response.status()).toBe(308);
		const location = new URL(response.headers().location, "https://phonaria.invalid");
		expect(`${location.pathname}${location.search}`).toBe("/minimal-pairs/th-s");
	});

	test("links a contrast's sounds to their pages and to other contrasts with them", async ({
		page,
	}) => {
		await page.goto("/minimal-pairs/th-s");
		const pairs = page.getByRole("table", { name: "Minimal pairs for /θ/ and /s/" });
		await expect(pairs.getByRole("link", { name: /^\/θ\// })).toHaveAttribute(
			"href",
			"/sounds/th-thin",
		);
		await expect(pairs.getByRole("link", { name: /^\/s\// })).toHaveAttribute(
			"href",
			"/sounds/s-sun",
		);
		const moreWithTh = page.getByRole("region", { name: "More contrasts with /θ/" });
		await expect(moreWithTh.getByRole("link", { name: /^\/θ\/ vs \/t\// })).toHaveAttribute(
			"href",
			"/minimal-pairs/th-t",
		);
		await expect(
			page.getByRole("region", { name: "More contrasts with /s/" }).getByRole("link"),
		).toHaveCount(2);
	});

	test("returns not-found for an unknown contrast", async ({ page }) => {
		const response = await page.goto("/minimal-pairs/th-zz");
		expect(response?.status()).toBe(404);
		await expect(notFoundHeading(page)).toBeVisible();
	});
});

test.describe("A contrast page with speaking practice off", () => {
	test.beforeEach(() => {
		skipUnlessSpeechDisabled();
	});

	test(
		"lists the pairs with play buttons and no microphone",
		{ tag: "@smoke" },
		async ({ page }) => {
			const response = await page.goto("/minimal-pairs/th-s");
			expect(response?.status()).toBe(200);
			await expect(page.getByRole("heading", { level: 1, name: "/θ/ vs /s/" })).toBeVisible();
			const pairs = page.getByRole("table", { name: "Minimal pairs for /θ/ and /s/" });
			await expect(pairs.locator("tbody tr")).toHaveCount(11);
			for (const word of ["think", "sink", "tenth", "tense"]) {
				await expect(pairs.getByRole("button", { name: `Hear ${word}` })).toHaveAttribute(
					"data-status",
					"idle",
				);
			}
			await expect(page.getByRole("button", { name: "Record" })).toHaveCount(0);
			await expect(page.getByRole("heading", { name: "Say a word" })).toHaveCount(0);
		},
	);
});

test.describe("A contrast page with speaking practice on", () => {
	test.beforeEach(() => {
		skipUnlessSpeechEnabled();
	});

	test("adds practice on one of the contrast's words above the pairs", async ({ page }) => {
		await page.goto("/minimal-pairs/th-s");
		await expect(page.getByRole("heading", { name: "Say a word" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Record" })).toBeVisible();
		await expect(page).toHaveURL(/\/minimal-pairs\/th-s\?word=\w+/);
		await expect(
			page.getByRole("table", { name: "Minimal pairs for /θ/ and /s/" }).getByRole("button", {
				name: "Hear think",
			}),
		).toBeVisible();
	});
});
