import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runGeneration } from "./generation";
import type { TtsProvider } from "./providers/types";

const directories: string[] = [];
async function directory() {
	const dir = await mkdtemp(path.join(tmpdir(), "phonaria-azure-"));
	directories.push(dir);
	return dir;
}
const provider: TtsProvider = {
	async synthesize(inputs) {
		return inputs.map(({ id }) => ({ id, audio: Buffer.from(`audio:${id}`) }));
	},
};
const settings = { voiceId: "en-US-JennyNeural", region: "eastus" };
const noWait = async () => {};
afterEach(async () => {
	vi.unstubAllEnvs();
	await Promise.all(directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("Azure catalog generation", () => {
	it("saves Ogg clips and refuses to mix formats on resume", async () => {
		const outputDir = await directory();
		await runGeneration({
			outputDir,
			dryRun: true,
			words: ["seat"],
			audioFormat: "ogg",
			...settings,
		});
		const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8"));
		expect(plan.settings.outputFormat).toBe("ogg-24khz-16bit-mono-opus");
		expect(plan.samples[0].file).toBe("audio/seat.ogg");
		await expect(runGeneration({ outputDir, resume: true, provider, ...settings })).rejects.toThrow(
			/settings/,
		);
		await runGeneration({ outputDir, resume: true, provider, audioFormat: "ogg", ...settings });
		expect(await readFile(path.join(outputDir, "audio/seat.ogg"), "utf8")).toBe("audio:seat");
	});
	it("records speaking speed and refuses to resume under a different speed", async () => {
		const outputDir = await directory();
		await runGeneration({
			outputDir,
			dryRun: true,
			words: ["adapt"],
			ratePercent: -20,
			...settings,
		});
		const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8"));
		expect(plan.settings.ratePercent).toBe(-20);
		await expect(
			runGeneration({ outputDir, resume: true, dryRun: true, ...settings }),
		).rejects.toThrow(/settings/);
		await runGeneration({ outputDir, resume: true, provider, ratePercent: -20, ...settings });
		expect(await readFile(path.join(outputDir, "audio/adapt.mp3"), "utf8")).toBe("audio:adapt");
	});
	it("plans all 400 words without credentials, calls, or audio files", async () => {
		vi.stubEnv("AZURE_SPEECH_KEY", "");
		const outputDir = await directory();
		await runGeneration({ outputDir, dryRun: true, ...settings });
		const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8"));
		expect(plan.samples).toHaveLength(400);
		expect(plan.samples.find(({ word }: { word: string }) => word === "adapt")).toMatchObject({
			ipa: "ə.ˈdæpt",
			status: "planned",
		});
		expect(await readdir(outputDir)).toEqual(["plan.json", "review.tsv"]);
		expect(await readFile(path.join(outputDir, "review.tsv"), "utf8")).toContain(
			"pronunciation_ok\tnatural\tclean_edges\tconsistent_level\taccepted\tnotes",
		);
	});
	it("resumes a dry-run plan and preserves completed files and review notes", async () => {
		const outputDir = await directory();
		await runGeneration({ outputDir, dryRun: true, words: ["seat", "seed"], ...settings });
		await runGeneration({ outputDir, resume: true, provider, wait: noWait, ...settings });
		await writeFile(path.join(outputDir, "review.tsv"), "my listening notes\n");
		await runGeneration({
			outputDir,
			resume: true,
			provider: {
				async synthesize() {
					throw new Error("must not regenerate");
				},
			},
			...settings,
		});
		expect(await readFile(path.join(outputDir, "audio/seat.mp3"), "utf8")).toBe("audio:seat");
		expect(await readFile(path.join(outputDir, "review.tsv"), "utf8")).toBe("my listening notes\n");
	});
	it("preserves successes on failure and resumes only unfinished words", async () => {
		const outputDir = await directory();
		const failing: TtsProvider = {
			async synthesize(inputs) {
				if (inputs[0].id === "seed") throw new Error("HTTP 429");
				return provider.synthesize(inputs);
			},
		};
		await expect(
			runGeneration({
				outputDir,
				words: ["seat", "seed", "ship"],
				provider: failing,
				wait: noWait,
				...settings,
			}),
		).rejects.toThrow("429");
		const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8"));
		expect(plan.samples.map(({ status }: { status: string }) => status)).toEqual([
			"generated",
			"failed",
			"planned",
		]);
		await runGeneration({
			outputDir,
			resume: true,
			provider: {
				async synthesize(inputs) {
					if (inputs[0].id === "seat") throw new Error("already complete");
					return provider.synthesize(inputs);
				},
			},
			wait: noWait,
			...settings,
		});
		expect(await readFile(path.join(outputDir, "audio/ship.mp3"), "utf8")).toBe("audio:ship");
	});
	it("rejects changed voices, damaged recordings, and overwrites before requesting audio", async () => {
		const outputDir = await directory();
		await runGeneration({ outputDir, words: ["seat"], provider, ...settings });
		const forbidden: TtsProvider = {
			async synthesize() {
				throw new Error("must not call Azure");
			},
		};
		await expect(
			runGeneration({ outputDir, words: ["seat"], provider: forbidden, ...settings }),
		).rejects.toThrow(/exists/);
		await expect(
			runGeneration({
				outputDir,
				resume: true,
				provider: forbidden,
				...settings,
				voiceId: "en-US-GuyNeural",
			}),
		).rejects.toThrow(/settings/);
		await writeFile(path.join(outputDir, "audio/seat.mp3"), "damaged");
		await expect(
			runGeneration({ outputDir, resume: true, provider: forbidden, ...settings }),
		).rejects.toThrow(/recording/i);
	});
	it("validates selection, pace, and credentials before writing files", async () => {
		const outputDir = await directory();
		vi.stubEnv("AZURE_SPEECH_KEY", "");
		await expect(runGeneration({ outputDir, words: ["seat"], ...settings })).rejects.toThrow(
			/AZURE_SPEECH_KEY/,
		);
		await expect(
			runGeneration({ outputDir, dryRun: true, words: ["unknown"], ...settings }),
		).rejects.toThrow(/catalog/);
		await expect(
			runGeneration({ outputDir, dryRun: true, requestsPerMinute: 0, ...settings }),
		).rejects.toThrow(/minute/);
		expect(await readdir(outputDir)).toEqual([]);
	});
	it("paces successive requests at no more than 20 per minute by default", async () => {
		const outputDir = await directory();
		const delays: number[] = [];
		await runGeneration({
			outputDir,
			words: ["seat", "seed", "ship"],
			provider,
			wait: async (ms) => {
				delays.push(ms);
			},
			...settings,
		});
		expect(delays).toEqual([3_100, 3_100]);
	});
	it("blocks another run while a request is in progress", async () => {
		const outputDir = await directory();
		await runGeneration({ outputDir, dryRun: true, words: ["seat"], ...settings });
		let release!: () => void;
		let entered!: () => void;
		const active = new Promise<void>((resolve) => {
			entered = resolve;
		});
		const held = new Promise<void>((resolve) => {
			release = resolve;
		});
		const first = runGeneration({
			outputDir,
			resume: true,
			...settings,
			provider: {
				async synthesize(inputs) {
					entered();
					await held;
					return provider.synthesize(inputs);
				},
			},
		});
		await active;
		try {
			await expect(
				runGeneration({ outputDir, resume: true, provider, ...settings }),
			).rejects.toThrow(/locked/);
		} finally {
			release();
			await first;
		}
	});
});
