import {
	INPUT_MAX_LENGTH,
	KNOWN_PHRASE,
	KNOWN_WORD,
	LOOKUP_ERROR_COPY,
	MISSING_WORD,
} from "../src/constants";
import { abortOriginPosts, allowOriginPosts } from "../src/failure";
import { expect, test } from "../src/fixtures";
import {
	copyTranscription,
	lookupAlert,
	retryButton,
	textToTranscribe,
	transcribeSubmit,
	wordDefinitionTrigger,
} from "../src/locators";

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
	});

	test("enforces the visible 200-character input limit", async ({ page }) => {
		await page.goto("/");
		const input = textToTranscribe(page);
		await input.fill("a".repeat(INPUT_MAX_LENGTH + 25));
		await expect(input).toHaveValue("a".repeat(INPUT_MAX_LENGTH));
		await expect(page.getByText(`${INPUT_MAX_LENGTH}/${INPUT_MAX_LENGTH}`)).toBeVisible();
	});

	test("keeps example chips available from the empty state", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("button", { name: "Hello world" })).toBeVisible();
		await page.getByRole("button", { name: "Hello world" }).click();
		await expect(page.getByText(KNOWN_WORD, { exact: true }).first()).toBeVisible({
			timeout: 20_000,
		});
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
