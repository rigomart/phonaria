import {
	INPUT_MAX_LENGTH,
	KNOWN_PHRASE,
	KNOWN_WORD,
	LOOKUP_ERROR_COPY,
	MISSING_WORD,
	SPELLING_CORRECTION,
	SPELLING_TYPO,
} from "../src/constants";
import { abortOriginPosts, allowOriginPosts } from "../src/failure";
import { expect, test } from "../src/fixtures";
import {
	clearTranscription,
	copyTranscription,
	lookupAlert,
	retryButton,
	spellingSuggestion,
	textToTranscribe,
	transcribeSubmit,
	wordDefinitionTrigger,
} from "../src/locators";

function searchQuery(page: { url: () => string }) {
	return new URL(page.url()).searchParams.get("q");
}

test.describe("Transcription", () => {
	test("transcribes a known phrase and exposes copy plus phoneme details", async ({ page }) => {
		await page.goto("/");
		await textToTranscribe(page).fill(KNOWN_PHRASE);
		await transcribeSubmit(page).click();

		await expect(page.getByText(KNOWN_WORD, { exact: true }).first()).toBeVisible({
			timeout: 20_000,
		});
		await expect(page.getByText("world", { exact: true }).first()).toBeVisible();
		await expect(copyTranscription(page)).toBeVisible();
		await expect(copyTranscription(page)).toBeEnabled();

		await page
			.getByRole("button", { name: /^Details for \// })
			.first()
			.click();
		await expect(page.getByRole("button", { name: /^Play / }).first()).toBeVisible();
	});

	test("shows a Not found badge for a missing dictionary word", async ({ page }) => {
		await page.goto("/");
		await textToTranscribe(page).fill(MISSING_WORD);
		await transcribeSubmit(page).click();

		await expect(page.getByText("Not found").first()).toBeVisible({ timeout: 20_000 });
		await expect(page.getByText(MISSING_WORD, { exact: true }).first()).toBeVisible();
		await expect(spellingSuggestion(page)).toHaveCount(0);
	});

	test("invalidates an edited spelling suggestion, then accepts a fresh offer", async ({
		page,
	}) => {
		await page.goto("/");
		await textToTranscribe(page).fill(SPELLING_TYPO);
		await transcribeSubmit(page).click();

		await expect(page.getByText("Not found").first()).toBeVisible({ timeout: 20_000 });
		const offer = spellingSuggestion(page);
		await expect(offer).toBeVisible({ timeout: 20_000 });
		await expect(offer).toContainText(`Did you mean ${SPELLING_CORRECTION}`);

		await textToTranscribe(page).fill(`${SPELLING_TYPO} again`);
		await expect(offer).toHaveCount(0);
		await textToTranscribe(page).fill(`  ${SPELLING_TYPO}  `);
		await transcribeSubmit(page).click();
		await expect(offer).toBeVisible({ timeout: 20_000 });
		await offer.click();

		await expect(textToTranscribe(page)).toHaveValue(SPELLING_CORRECTION);
		await expect(page.getByText("Not found")).toHaveCount(0);
		await expect(page.getByText(SPELLING_CORRECTION, { exact: true }).first()).toBeVisible({
			timeout: 20_000,
		});
		await expect(page.getByRole("button", { name: /^Details for \// }).first()).toBeVisible();
		await expect(spellingSuggestion(page)).toHaveCount(0);
	});

	test("enforces the visible 200-character input limit", async ({ page }) => {
		await page.goto("/");
		const input = textToTranscribe(page);
		const countVisibleFrom = Math.ceil(INPUT_MAX_LENGTH * 0.8);
		await input.fill("a".repeat(countVisibleFrom - 1));
		await expect(page.getByText(`${countVisibleFrom - 1}/${INPUT_MAX_LENGTH}`)).toHaveCount(0);
		await input.fill("a".repeat(countVisibleFrom));
		await expect(page.getByText(`${countVisibleFrom}/${INPUT_MAX_LENGTH}`)).toBeVisible();
		await input.fill("a".repeat(INPUT_MAX_LENGTH + 25));
		await expect(input).toHaveValue("a".repeat(INPUT_MAX_LENGTH));
		await expect(page.getByText(`${INPUT_MAX_LENGTH}/${INPUT_MAX_LENGTH}`)).toBeVisible();
	});

	test("keeps example chips available from the empty state", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("button", { name: "Hello world" })).toBeVisible();
		await page.getByRole("button", { name: "Hello world" }).click();
		await expect.poll(() => searchQuery(page)).toBe("Hello world");
		await expect(textToTranscribe(page)).toHaveValue("Hello world");
		await expect(page.getByText(KNOWN_WORD, { exact: true }).first()).toBeVisible({
			timeout: 20_000,
		});
	});

	test("opens a shared query and clears it", async ({ page }) => {
		await page.goto(`/?q=${KNOWN_WORD}`);
		const input = textToTranscribe(page);
		await expect(input).toHaveValue(KNOWN_WORD);
		await expect(page.getByText(KNOWN_WORD, { exact: true }).first()).toBeVisible({
			timeout: 20_000,
		});
		await expect(page.getByText(`${KNOWN_WORD.length}/${INPUT_MAX_LENGTH}`)).toHaveCount(0);
		await expect(page.getByRole("button", { name: "Hello world" })).toHaveCount(0);

		await clearTranscription(page).click();
		await expect(input).toHaveValue("");
		await expect(input).toBeFocused();
		await expect(page.getByRole("button", { name: "Hello world" })).toBeVisible();
		await expect.poll(() => searchQuery(page)).toBeNull();

		await input.fill(KNOWN_WORD);
		await input.press("Escape");
		await expect(input).toHaveValue("");
		await expect(input).toBeFocused();
		await expect.poll(() => searchQuery(page)).toBeNull();
	});

	test("pushes a history entry per submission and restores it on back", async ({ page }) => {
		await page.goto("/");
		const input = textToTranscribe(page);
		await input.fill(KNOWN_WORD);
		await transcribeSubmit(page).click();
		await expect.poll(() => searchQuery(page)).toBe(KNOWN_WORD);
		await expect(page.getByText(KNOWN_WORD, { exact: true }).first()).toBeVisible({
			timeout: 20_000,
		});

		await input.fill(KNOWN_PHRASE);
		await transcribeSubmit(page).click();
		await expect.poll(() => searchQuery(page)).toBe(KNOWN_PHRASE);
		await expect(page.getByText("world", { exact: true }).first()).toBeVisible({
			timeout: 20_000,
		});

		await transcribeSubmit(page).click();
		await page.goBack();
		await expect.poll(() => searchQuery(page)).toBe(KNOWN_WORD);
		await expect(input).toHaveValue(KNOWN_WORD);

		await page.getByRole("link", { name: "Transcription" }).click();
		await expect.poll(() => searchQuery(page)).toBeNull();
		await expect(input).toHaveValue("");
		await expect(page.getByRole("button", { name: "Hello world" })).toBeVisible();
	});

	test("restores the submitted text when Back returns to an edited draft", async ({ page }) => {
		await page.goto("/");
		const input = textToTranscribe(page);
		await input.fill(KNOWN_WORD);
		await transcribeSubmit(page).click();
		await expect.poll(() => searchQuery(page)).toBe(KNOWN_WORD);
		await expect(page.getByText(KNOWN_WORD, { exact: true }).first()).toBeVisible({
			timeout: 20_000,
		});

		await input.fill("world");
		await expect(input).toHaveValue("world");
		await expect.poll(() => searchQuery(page)).toBe(KNOWN_WORD);

		await page.getByRole("link", { name: "Credits" }).click();
		await expect(page.getByRole("heading", { name: "Credits & Sources" })).toBeVisible();
		await page.goBack();

		await expect.poll(() => searchQuery(page)).toBe(KNOWN_WORD);
		await expect(input).toHaveValue(KNOWN_WORD);
		await expect(page.getByText(KNOWN_WORD, { exact: true }).first()).toBeVisible();
	});

	test("clears a punctuation-only query when the Transcription link drops q", async ({ page }) => {
		await page.goto("/?q=!!!");
		const input = textToTranscribe(page);
		await expect(input).toHaveValue("!!!");
		await expect(page.getByRole("button", { name: "Hello world" })).toHaveCount(0);

		await page.getByRole("link", { name: "Transcription" }).click();
		await expect.poll(() => searchQuery(page)).toBeNull();
		await expect(input).toHaveValue("");
		await expect(page.getByRole("button", { name: "Hello world" })).toBeVisible();
	});

	test("re-enables the field when Clear interrupts a repeated lookup", async ({ page }) => {
		await page.goto("/");
		const input = textToTranscribe(page);
		await input.fill(MISSING_WORD);
		await transcribeSubmit(page).click();
		await expect(page.getByText("Not found").first()).toBeVisible({ timeout: 20_000 });

		let releaseHold = () => {};
		const hold = new Promise<void>((resolve) => {
			releaseHold = resolve;
		});
		const origin = new URL(page.url()).origin;
		await page.route("**/*", async (route) => {
			const request = route.request();
			const holdsLookup = request.method() === "POST" && new URL(request.url()).origin === origin;
			if (!holdsLookup) {
				await route.continue();
				return;
			}
			await hold;
			try {
				await route.abort("failed");
			} catch {
				// Clear already moved on, and Playwright may have settled this route.
			}
		});

		try {
			await page.evaluate(() => {
				const button = document.querySelector(
					'button[aria-label="Transcribe text"]',
				) as HTMLButtonElement | null;
				button?.click();
			});
			await expect(input).toBeDisabled();
			await clearTranscription(page).click();
			await expect(input).toBeEnabled();
			await expect(input).toHaveValue("");
			await expect(input).toBeFocused();
		} finally {
			releaseHold();
			await page.unroute("**/*");
		}
	});

	test("opens Wiktionary definitions for a spelled known word", async ({ page }) => {
		await page.goto("/");
		const input = textToTranscribe(page);
		await input.click();
		await input.pressSequentially(KNOWN_WORD);
		await expect(transcribeSubmit(page)).toBeEnabled();
		await transcribeSubmit(page).click();

		const trigger = wordDefinitionTrigger(page, KNOWN_WORD);
		await expect(trigger).toBeVisible({ timeout: 20_000 });
		await trigger.click();

		await expect(page.getByText(/greeting/i).first()).toBeVisible({ timeout: 15_000 });
		await expect(page.getByText(/Hello, everyone/i)).toBeVisible();
		await expect(page.getByText("Definitions from Wiktionary")).toBeVisible();
		await expect(page.getByText("We couldn't load that definition")).toHaveCount(0);
		await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
	});
});

test.describe("Transcription retryable failures", () => {
	test("shows the service error copy, retry, and stale result when POSTs fail", async ({
		page,
		target,
	}) => {
		test.skip(
			!target.capabilities.controlledServiceFailure,
			target.skipReasons.controlledServiceFailure ??
				"Controlled transcription service failure is not available on this target.",
		);

		await page.goto("/");
		await textToTranscribe(page).fill(KNOWN_WORD);
		await transcribeSubmit(page).click();
		await expect(page.getByText(KNOWN_WORD, { exact: true }).first()).toBeVisible({
			timeout: 20_000,
		});

		await abortOriginPosts(page);

		await textToTranscribe(page).fill(MISSING_WORD);
		await transcribeSubmit(page).click();

		await expect(lookupAlert(page)).toContainText(LOOKUP_ERROR_COPY.service);
		await expect(retryButton(page)).toBeVisible();
		await expect(
			page.getByText(`Showing your last transcription for "${KNOWN_WORD}".`),
		).toBeVisible();

		await retryButton(page).click();
		await expect(lookupAlert(page)).toContainText(LOOKUP_ERROR_COPY.service);

		await allowOriginPosts(page);
		await retryButton(page).click();
		await expect(page.getByText("Not found").first()).toBeVisible({ timeout: 20_000 });
	});

	test("exercises word-list failure copy when a stable seam exists", async ({ target }) => {
		test.skip(
			!target.capabilities.controlledWordlistFailure,
			target.skipReasons.controlledWordlistFailure ??
				"Controlled word-list failure is not available on this target.",
		);
		throw new Error(
			`Target "${target.name}" enables controlledWordlistFailure, but the contract does not yet have a framework-neutral seam to abort the word list. Add that seam before flipping the capability.`,
		);
	});
});
