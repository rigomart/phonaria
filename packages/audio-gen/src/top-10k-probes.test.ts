import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runGeneration } from "./generation";
import { probeGroups, probeReasons } from "./top-10k-probes";

// Plans as before the top-10k upload; the live manifest leaves no curated word to plan.
vi.mock("@phonaria/phonetics-data/data/en/word-audio", async () => ({
	EnglishWordAudio: (await import("./fixtures/recorded-before-top-10k")).wordAudioBeforeTop10k,
}));

const directories: string[] = [];
afterEach(async () => {
	await Promise.all(directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("top-10k probes", () => {
	it("plans every probe word, each form, with the reasons it was picked", async () => {
		const outputDir = await mkdtemp(path.join(tmpdir(), "phonaria-probes-"));
		directories.push(outputDir);
		await runGeneration({
			outputDir,
			dryRun: true,
			source: "top-10k-probes",
			voiceId: "en-US-JennyNeural",
			audioFormat: "ogg",
		});
		const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8"));
		const reasons = probeReasons();
		expect(new Set(plan.samples.map(({ word }: { word: string }) => word))).toEqual(
			new Set(reasons.keys()),
		);
		for (const sample of plan.samples) expect(sample.pickedFor).toEqual(reasons.get(sample.word));
		const files = plan.samples.map(({ file }: { file: string }) => file);
		expect(files).toContain("audio/read--2.ogg");
		expect(files).toContain("audio/either--2.ogg");
		expect(plan.samples.length).toBeGreaterThanOrEqual(100);
		expect(plan.samples.length).toBeLessThanOrEqual(140);
	});

	it("covers each risk group with words split and picked by the rules", async () => {
		for (const { reason, words } of probeGroups) expect(words.length, reason).toBeGreaterThan(0);
		const outputDir = await mkdtemp(path.join(tmpdir(), "phonaria-probes-"));
		directories.push(outputDir);
		await runGeneration({
			outputDir,
			dryRun: true,
			source: "top-10k-probes",
			voiceId: "en-US-JennyNeural",
			audioFormat: "ogg",
		});
		const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8"));
		const splits = plan.samples.filter((sample: { pickedFor: string[]; syllables: string }) =>
			sample.pickedFor.some((reason) => reason.startsWith("rule split")),
		);
		for (const sample of splits) expect(sample.syllables, sample.word).toBe("rule");
		const picks = plan.samples.filter((sample: { pickedFor: string[] }) =>
			sample.pickedFor.some((reason) => reason.startsWith("rule keeps")),
		);
		for (const sample of picks) expect(sample.pronunciationChoice.source, sample.word).toBe("rule");
	});
});
