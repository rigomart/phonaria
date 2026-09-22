import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { BASELINE_RUNS, CLIENT_HIT_WORD, SERVER_HIT_WORD } from "../src/constants";
import { expect, test } from "../src/fixtures";
import {
	dictionaryMissBadge,
	phonemeDetailsButton,
	textToTranscribe,
	transcribedWordLabel,
	transcribeSubmit,
} from "../src/locators";
import {
	committedBaselinePath,
	comparisonNotes,
	createBaselineRecord,
	measurePageLoadMs,
	measureTranscriptionMs,
	readCommittedBaseline,
	writeBaselineRecord,
} from "../src/perf";

test.describe("Performance baselines", () => {
	test("records page-load and split transcription lane timings @baseline", async ({
		page,
		target,
	}, testInfo) => {
		test.setTimeout(240_000);

		const coldPageLoadMs = await measurePageLoadMs(page, "/");

		const pageLoadSamples: number[] = [];
		for (let run = 0; run < BASELINE_RUNS; run++) {
			pageLoadSamples.push(await measurePageLoadMs(page, "/"));
		}

		await page.goto("/");
		await warmClientWordList(page);
		const clientTranscriptionSamples = await collectLaneSamples(page, CLIENT_HIT_WORD);

		await warmSuccessfulLookup(page, SERVER_HIT_WORD);
		const serverTranscriptionSamples = await collectLaneSamples(page, SERVER_HIT_WORD);

		const record = createBaselineRecord(
			target,
			coldPageLoadMs,
			pageLoadSamples,
			clientTranscriptionSamples,
			serverTranscriptionSamples,
		);
		expect(record.coldPageLoadMs).toBeGreaterThan(0);
		expect(record.pageLoad.samplesMs).toHaveLength(BASELINE_RUNS);
		expect(record.transcription.client.samplesMs).toHaveLength(BASELINE_RUNS);
		expect(record.transcription.server.samplesMs).toHaveLength(BASELINE_RUNS);
		expect(record.pageLoad.medianMs).toBeGreaterThan(0);
		expect(record.transcription.client.medianMs).toBeGreaterThan(0);
		expect(record.transcription.server.medianMs).toBeGreaterThan(0);

		const outputPath = testInfo.outputPath("baseline.json");
		writeBaselineRecord(outputPath, record);
		await testInfo.attach("browser-contract-baseline", {
			path: outputPath,
			contentType: "application/json",
		});

		const latestDir = join(testInfo.project.outputDir, "..");
		mkdirSync(latestDir, { recursive: true });
		writeBaselineRecord(join(testInfo.project.outputDir, "baseline.json"), record);

		if (process.env.LAB_CONTRACT_WRITE_BASELINE === "1") {
			writeBaselineRecord(committedBaselinePath(target.name), record);
		}

		const previous = readCommittedBaseline(target.name);
		const notes = comparisonNotes(record, previous);
		await testInfo.attach("baseline-comparison", {
			body: notes.join("\n"),
			contentType: "text/plain",
		});

		// Ordinary network variance must not fail the contract. Downstream
		// qualification tickets compare these numbers against the 20% threshold.
		expect(notes.length).toBeGreaterThan(0);
	});
});

async function warmClientWordList(page: Page): Promise<void> {
	await warmSuccessfulLookup(page, CLIENT_HIT_WORD);
}

async function warmSuccessfulLookup(page: Page, word: string): Promise<void> {
	await textToTranscribe(page).fill(word);
	await transcribeSubmit(page).click();
	await expectSuccessfulTranscription(page, word);
	await page.reload();
}

async function collectLaneSamples(page: Page, word: string): Promise<number[]> {
	const samples: number[] = [];
	for (let run = 0; run < BASELINE_RUNS; run++) {
		const elapsed = await measureTranscriptionMs(
			page,
			async (nextPage) => {
				await textToTranscribe(nextPage).fill(word);
			},
			async (nextPage) => {
				await transcribeSubmit(nextPage).click();
				await expect(transcribedWordLabel(nextPage, word)).toBeVisible({
					timeout: 20_000,
				});
			},
		);
		await expectSuccessfulTranscription(page, word);
		samples.push(elapsed);
		await page.reload();
	}
	return samples;
}

async function expectSuccessfulTranscription(page: Page, word: string): Promise<void> {
	await expect(transcribedWordLabel(page, word)).toBeVisible();
	await expect(dictionaryMissBadge(page)).toHaveCount(0);
	await expect(phonemeDetailsButton(page).first()).toBeVisible();
}
