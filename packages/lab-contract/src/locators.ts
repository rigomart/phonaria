import type { Page } from "@playwright/test";

export function textToTranscribe(page: Page) {
	return page.getByLabel("Text to transcribe");
}

export function transcribeSubmit(page: Page) {
	return page.getByLabel("Transcribe text");
}

export function copyTranscription(page: Page) {
	return page.getByLabel("Copy IPA transcription");
}

export function retryButton(page: Page) {
	return page.getByRole("button", { name: "Retry" });
}

export function lookupAlert(page: Page) {
	return page.getByRole("alert");
}

export function notFoundHeading(page: Page) {
	return page.getByRole("heading", { name: "This page doesn't exist" });
}

export function transcribedWordLabel(page: Page, word: string) {
	return page.getByText(word, { exact: true }).first();
}

export function dictionaryMissBadge(page: Page) {
	return page.getByText("Not found", { exact: true });
}

export function phonemeDetailsButton(page: Page) {
	return page.getByRole("button", { name: /^Details for \// });
}
