import type { Page } from "@playwright/test";
import { getTarget } from "./target";

/** Abort same-origin POSTs so a missing-word lookup cannot reach the transcription service. */
export async function abortOriginPosts(page: Page): Promise<void> {
	const origin = new URL(getTarget().baseUrl).origin;
	await page.route("**/*", async (route) => {
		const request = route.request();
		if (request.method() === "POST" && new URL(request.url()).origin === origin) {
			await route.abort("failed");
			return;
		}
		await route.continue();
	});
}

export async function allowOriginPosts(page: Page): Promise<void> {
	await page.unroute("**/*");
}
