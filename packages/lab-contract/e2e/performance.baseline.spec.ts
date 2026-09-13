import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { BASELINE_RUNS, KNOWN_WORD } from "../src/constants";
import { expect, test } from "../src/fixtures";
import { textToTranscribe, transcribeSubmit } from "../src/locators";
import {
	committedBaselinePath,
	comparisonNotes,
	createBaselineRecord,
	measurePageLoadMs,
	readCommittedBaseline,
	writeBaselineRecord,
} from "../src/perf";

test.describe("Performance baselines", () => {
	test("records repeatable page-load and transcription timings @baseline", async ({
		page,
		target,
	}, testInfo) => {
		test.setTimeout(180_000);

		const coldPageLoadMs = await measurePageLoadMs(page, "/");

		const pageLoadSamples: number[] = [];
		for (let run = 0; run < BASELINE_RUNS; run++) {
			pageLoadSamples.push(await measurePageLoadMs(page, "/"));
		}

		await page.goto("/");
		const transcriptionSamples: number[] = [];
		for (let run = 0; run < BASELINE_RUNS; run++) {
			await textToTranscribe(page).fill(KNOWN_WORD);
			const started = Date.now();
			await transcribeSubmit(page).click();
			await expect(page.getByText(KNOWN_WORD, { exact: true }).first()).toBeVisible({
				timeout: 20_000,
			});
			transcriptionSamples.push(Date.now() - started);
			await page.reload();
		}

		const record = createBaselineRecord(
			target,
			coldPageLoadMs,
			pageLoadSamples,
			transcriptionSamples,
		);
		expect(record.coldPageLoadMs).toBeGreaterThan(0);
		expect(record.pageLoad.samplesMs).toHaveLength(BASELINE_RUNS);
		expect(record.transcription.samplesMs).toHaveLength(BASELINE_RUNS);
		expect(record.pageLoad.medianMs).toBeGreaterThan(0);
		expect(record.transcription.medianMs).toBeGreaterThan(0);

		const outputPath = testInfo.outputPath("baseline.json");
		writeBaselineRecord(outputPath, record);
		await testInfo.attach("lab-contract-baseline", {
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
