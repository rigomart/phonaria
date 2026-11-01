import { skipUnlessAboutDisabled, skipUnlessAboutEnabled } from "../src/capabilities";
import { ABOUT_PATH } from "../src/constants";
import { expect, test } from "../src/fixtures";
import { notFoundHeading } from "../src/locators";
import {
	canonicalHref,
	documentTitle,
	expectedCanonical,
	expectedRobots,
	fetchDocument,
	metaContent,
} from "../src/metadata";

test.describe("About disabled", () => {
	test.beforeEach(() => {
		skipUnlessAboutDisabled();
	});

	test("hides the About footer link", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("contentinfo").getByRole("link", { name: "About" })).toHaveCount(0);
	});

	test("returns not-found for the page", { tag: "@smoke" }, async ({ page }) => {
		const response = await page.goto(ABOUT_PATH);
		expect(response?.status()).toBe(404);
		await expect(notFoundHeading(page)).toBeVisible();
	});
});

test.describe("About enabled", () => {
	test.beforeEach(() => {
		skipUnlessAboutEnabled();
	});

	test("links the page from the footer", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByRole("contentinfo").getByRole("link", { name: "About" }),
		).toHaveAttribute("href", ABOUT_PATH);
	});

	test(
		"serves the page with server-rendered metadata",
		{ tag: "@smoke" },
		async ({ request, target }) => {
			const { response, html } = await fetchDocument(request, ABOUT_PATH);
			expect(response.status()).toBe(200);
			expect(documentTitle(html)).toBe("About - Phonaria");
			expect(metaContent(html, "description")).toBe(
				"Phonaria is a free set of tools for American English pronunciation. See what each tool does and how pronunciation improves, one sound at a time.",
			);
			expect(canonicalHref(html)).toBe(expectedCanonical(target, ABOUT_PATH));
			expect(metaContent(html, "robots")).toBe(expectedRobots(target));
		},
	);
});
