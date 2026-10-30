import { expect, type Locator } from "@playwright/test";

/**
 * Waits until React has hydrated the element. Sound tiles are links to their
 * pages, so a click that lands before hydration follows the link instead of
 * opening the details.
 */
export async function waitForHydration(locator: Locator): Promise<void> {
	await expect
		.poll(() =>
			locator.evaluate((element) =>
				Object.keys(element).some((key) => key.startsWith("__reactProps")),
			),
		)
		.toBe(true);
}
