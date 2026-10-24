import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { EnglishPracticeSchwa } from "@phonaria/phonetics-data/languages/en/practice-schwa";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as excluded from "./excluded-words";
import { runGeneration } from "./generation";
import { AzureNetworkError, createAzureProvider } from "./providers/azure";
import type { TtsProvider } from "./providers/types";

// Lets a test plan words before they were excluded, as the saved top-10k plans did.
const exclusions = vi.hoisted(() => ({ on: true }));
vi.mock("./excluded-words", async (importOriginal) => {
	const actual = await importOriginal<typeof import("./excluded-words")>();
	return {
		...actual,
		getExcludedWordReason: (word: string) =>
			exclusions.on ? actual.getExcludedWordReason(word) : undefined,
	};
});

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
	exclusions.on = true;
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
	await Promise.all(directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("Azure catalog generation", () => {
	it("plans and resumes the 358 new Practice words with a single explicit reference", async () => {
		const outputDir = await directory();
		await runGeneration({ outputDir, dryRun: true, source: "practice", ...settings });
		const saved = await readFile(path.join(outputDir, "plan.json"), "utf8");
		const plan = JSON.parse(saved);
		expect(plan.source).toBe("practice");
		expect(plan.samples).toHaveLength(358);
		expect(new Set(plan.samples.map((sample: { word: string }) => sample.word)).size).toBe(358);
		expect(
			plan.samples.some((sample: { word: string }) => ["adapt", "adopt"].includes(sample.word)),
		).toBe(false);
		const pinned = new Map(EnglishPracticeSchwa.map(({ word, variant }) => [word, variant]));
		for (const sample of plan.samples) {
			expect(sample.variant, sample.word).toBe(pinned.get(sample.word));
			expect(sample.input.text.match(/<phoneme /g)).toHaveLength(1);
			expect(sample.status).toBe("planned");
		}
		await runGeneration({ outputDir, dryRun: true, resume: true, ...settings });
		expect(await readFile(path.join(outputDir, "plan.json"), "utf8")).toBe(saved);
		expect(await readdir(outputDir)).toEqual(["plan.json", "review.tsv"]);
	});
	it("saves and resumes a spelling source without widening the default catalog", async () => {
		const outputDir = await directory();
		await expect(
			runGeneration({ outputDir, dryRun: true, words: ["cause"], ...settings }),
		).rejects.toThrow(/catalog/);
		await runGeneration({
			outputDir,
			dryRun: true,
			source: "spelling",
			words: ["cause", "jeep", "rabbit"],
			...settings,
		});
		const saved = await readFile(path.join(outputDir, "plan.json"), "utf8");
		const plan = JSON.parse(saved);
		expect(plan.source).toBe("spelling");
		expect(plan.samples.map(({ input }: { input: { text: string } }) => input.text)).toEqual([
			'<phoneme alphabet="ipa" ph="kɔz">cause</phoneme>',
			'<phoneme alphabet="ipa" ph="dʒip">jeep</phoneme>',
			'<phoneme alphabet="ipa" ph="ˈɹæ.bət">rabbit</phoneme>',
		]);
		await runGeneration({ outputDir, dryRun: true, resume: true, ...settings });
		expect(await readFile(path.join(outputDir, "plan.json"), "utf8")).toBe(saved);
		await expect(
			runGeneration({ outputDir, dryRun: true, resume: true, source: "catalog", ...settings }),
		).rejects.toThrow(/source/);
		expect(await readdir(outputDir)).toEqual(["plan.json", "review.tsv"]);
	});
	it("plans a curated tier with rule inputs and records where each came from", async () => {
		const outputDir = await directory();
		await runGeneration({
			outputDir,
			dryRun: true,
			source: "top-1k",
			words: ["the", "people", "sometimes", "english"],
			...settings,
		});
		const saved = await readFile(path.join(outputDir, "plan.json"), "utf8");
		const plan = JSON.parse(saved);
		expect(plan.source).toBe("top-1k");
		expect(
			plan.samples.map(
				({ word, ipa, pronunciationChoice, syllables }: Record<string, unknown>) => ({
					word,
					ipa,
					pronunciation: (pronunciationChoice as { source: string }).source,
					syllables,
				}),
			),
		).toEqual([
			{ word: "the", ipa: "ðʌ", pronunciation: "rule", syllables: "one syllable" },
			{ word: "people", ipa: "ˈpi.pəl", pronunciation: "only", syllables: "rule" },
			{ word: "sometimes", ipa: "ˈsʌm.ˌtaɪmz", pronunciation: "reviewed", syllables: "rule" },
			{ word: "english", ipa: "ˈɪŋ.ɡlɪʃ", pronunciation: "rule", syllables: "rule" },
		]);
		await runGeneration({ outputDir, dryRun: true, resume: true, ...settings });
		expect(await readFile(path.join(outputDir, "plan.json"), "utf8")).toBe(saved);
	});
	it("writes the stress mark only on the reviewed one-syllable inputs, and records why", async () => {
		const outputDir = await directory();
		await runGeneration({ outputDir, dryRun: true, source: "top-10k", ...settings });
		const saved = await readFile(path.join(outputDir, "plan.json"), "utf8");
		const samples: Record<string, any>[] = JSON.parse(saved).samples;
		const stressed = samples.filter(({ stressWritten }) => stressWritten);
		expect(stressed.map(({ input }) => input.text)).toEqual([
			'<phoneme alphabet="ipa" ph="ˈaɪ">i</phoneme>',
			'<phoneme alphabet="ipa" ph="ˈit">eat</phoneme>',
		]);
		expect(stressed.map(({ ipa }) => ipa)).toEqual(["ˈaɪ", "ˈit"]);
		const oneSyllable = samples.filter(
			({ syllables, stressWritten }) => syllables === "one syllable" && !stressWritten,
		);
		expect(oneSyllable.length).toBeGreaterThan(1000);
		expect(oneSyllable.filter(({ input }) => input.text.includes("ˈ"))).toEqual([]);
		await runGeneration({ outputDir, dryRun: true, resume: true, ...settings });
		expect(await readFile(path.join(outputDir, "plan.json"), "utf8")).toBe(saved);
	}, 30_000);
	it("plans every labelled form of a word under its own file name", async () => {
		const outputDir = await directory();
		await runGeneration({
			outputDir,
			dryRun: true,
			source: "top-10k",
			words: ["read", "data"],
			audioFormat: "ogg",
			...settings,
		});
		const saved = await readFile(path.join(outputDir, "plan.json"), "utf8");
		const plan = JSON.parse(saved);
		expect(
			plan.samples.map(({ form, ipa, file, input }: Record<string, any>) => ({
				form,
				ipa,
				file,
				id: input.id,
			})),
		).toEqual([
			{ form: { label: "present tense" }, ipa: "ɹid", file: "audio/read.ogg", id: "read" },
			{ form: { n: 2, label: "past tense" }, ipa: "ɹɛd", file: "audio/read--2.ogg", id: "read--2" },
			{ form: undefined, ipa: "ˈdeɪt.ə", file: "audio/data.ogg", id: "data" },
			{
				form: { n: 2, label: "also said" },
				ipa: "ˈdæt.ə",
				file: "audio/data--2.ogg",
				id: "data--2",
			},
		]);
		expect(await readFile(path.join(outputDir, "review.tsv"), "utf8")).toContain(
			"audio/read--2.ogg\tread\tpast tense\t",
		);
		await runGeneration({ outputDir, dryRun: true, resume: true, audioFormat: "ogg", ...settings });
		expect(await readFile(path.join(outputDir, "plan.json"), "utf8")).toBe(saved);
	});
	it("saves each form's clip under its file name", async () => {
		const outputDir = await directory();
		await runGeneration({
			outputDir,
			source: "top-10k",
			words: ["read"],
			audioFormat: "ogg",
			provider,
			wait: noWait,
			...settings,
		});
		expect((await readdir(path.join(outputDir, "audio"))).sort()).toEqual([
			"read--2.ogg",
			"read.ogg",
		]);
		expect(await readFile(path.join(outputDir, "audio", "read--2.ogg"), "utf8")).toBe(
			"audio:read--2",
		);
	});
	it("refuses a recorded word in a curated tier", async () => {
		await expect(
			runGeneration({
				outputDir: await directory(),
				dryRun: true,
				source: "top-10k",
				words: ["seat"],
				...settings,
			}),
		).rejects.toThrow(/top-10k/);
	});
	it.each(["top-1k", "top-10k"] as const)(
		"plans no excluded word in the %s, and keeps short real words",
		async (source) => {
			const outputDir = await directory();
			await runGeneration({ outputDir, dryRun: true, source, ...settings });
			const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8"));
			const words = new Set(plan.samples.map(({ word }: { word: string }) => word));
			const listed = Object.values(excluded.excludedWords).flatMap((group) => Object.keys(group));
			expect(listed.filter((word) => words.has(word))).toEqual([]);
			expect(
				["a", "i", "ok", "us", "it", "do", "so", "etc"].filter((word) => !words.has(word)),
			).toEqual([]);
		},
	);
	it("resumes a saved plan with words excluded since, but won't plan them anew", async () => {
		const outputDir = await directory();
		const options = { source: "top-10k", ...settings } as const;
		exclusions.on = false;
		await runGeneration({ outputDir, words: ["usa", "the"], provider, wait: noWait, ...options });
		exclusions.on = true;
		const saved = await readFile(path.join(outputDir, "plan.json"), "utf8");
		await runGeneration({ outputDir, dryRun: true, resume: true, ...settings });
		expect(await readFile(path.join(outputDir, "plan.json"), "utf8")).toBe(saved);
		await expect(
			runGeneration({ outputDir: await directory(), dryRun: true, words: ["usa"], ...options }),
		).rejects.toThrow("Word is not in the top-10k source: usa");
		const next = await directory();
		await runGeneration({ outputDir: next, dryRun: true, skipGenerated: [outputDir], ...options });
		const plan = JSON.parse(await readFile(path.join(next, "plan.json"), "utf8"));
		expect(plan.skippedGenerated).toEqual([{ dir: path.relative(next, outputDir), samples: 1 }]);
		expect(plan.samples.map(({ word }: { word: string }) => word)).not.toContain("usa");
	});
	it("keeps hand-checked sources free of rule provenance", async () => {
		const outputDir = await directory();
		await runGeneration({ outputDir, dryRun: true, words: ["seat"], ...settings });
		const [sample] = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8")).samples;
		expect(sample).not.toHaveProperty("pronunciationChoice");
		expect(sample).not.toHaveProperty("syllables");
	});
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
	it("retries a sample after network errors and goes on", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const outputDir = await directory();
		const delays: number[] = [];
		let failures = 2;
		await runGeneration({
			outputDir,
			words: ["seat", "seed"],
			provider: {
				async synthesize(inputs) {
					if (inputs[0].id === "seed" && failures-- > 0)
						throw new AzureNetworkError("Azure request failed for seed");
					return provider.synthesize(inputs);
				},
			},
			wait: async (ms) => {
				delays.push(ms);
			},
			...settings,
		});
		expect(delays).toEqual([3_100, 15_000, 15_000]);
		expect(warn).toHaveBeenCalledTimes(2);
		expect(warn).toHaveBeenLastCalledWith("Azure request failed for seed; retry 2 of 2 in 15 s");
		const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8"));
		expect(plan.samples.map(({ status }: { status: string }) => status)).toEqual([
			"generated",
			"generated",
		]);
	});
	it.each([429, 500])("stops without retrying on HTTP %s", async (status) => {
		const outputDir = await directory();
		const fetcher = vi.fn().mockResolvedValue(new Response("", { status }));
		await expect(
			runGeneration({
				outputDir,
				words: ["seat"],
				provider: createAzureProvider({ apiKey: "key", region: "eastus", fetcher }),
				wait: noWait,
				...settings,
			}),
		).rejects.toThrow(`HTTP ${status}`);
		expect(fetcher).toHaveBeenCalledTimes(1);
		const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8"));
		expect(plan.samples[0].status).toBe("failed");
	});
	it("gives up after three network errors and keeps completed samples for resume", async () => {
		vi.spyOn(console, "warn").mockImplementation(() => {});
		const outputDir = await directory();
		const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
			if (String(init?.body).includes("sid")) throw new TypeError("fetch failed");
			return new Response(new Uint8Array([1]), { headers: { "Content-Type": "audio/mpeg" } });
		});
		await expect(
			runGeneration({
				outputDir,
				words: ["seat", "seed", "ship"],
				provider: createAzureProvider({ apiKey: "key", region: "eastus", fetcher }),
				wait: noWait,
				...settings,
			}),
		).rejects.toThrow("Azure request failed for seed; check connectivity or timeout");
		expect(fetcher).toHaveBeenCalledTimes(4);
		const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8"));
		expect(plan.samples.map(({ status }: { status: string }) => status)).toEqual([
			"generated",
			"failed",
			"planned",
		]);
		await runGeneration({ outputDir, resume: true, provider, wait: noWait, ...settings });
		expect(await readFile(path.join(outputDir, "audio/seat.mp3"))).toEqual(Buffer.from([1]));
		expect(await readFile(path.join(outputDir, "audio/seed.mp3"), "utf8")).toBe("audio:seed");
	});
	it("leaves out samples another plan generated, form by form", async () => {
		const top1k = await directory();
		const options = { source: "top-10k", audioFormat: "ogg", ...settings } as const;
		await expect(
			runGeneration({
				outputDir: top1k,
				words: ["read", "data"],
				provider: {
					async synthesize(inputs) {
						if (inputs[0].id === "read--2") throw new Error("HTTP 429");
						return provider.synthesize(inputs);
					},
				},
				wait: noWait,
				...options,
			}),
		).rejects.toThrow("429");
		const outputDir = await directory();
		await runGeneration({
			outputDir,
			dryRun: true,
			words: ["read", "data", "the"],
			skipGenerated: [top1k],
			...options,
		});
		const saved = await readFile(path.join(outputDir, "plan.json"), "utf8");
		const plan = JSON.parse(saved);
		expect(plan.skippedGenerated).toEqual([{ dir: path.relative(outputDir, top1k), samples: 1 }]);
		expect(plan.samples.map(({ file }: { file: string }) => file)).toEqual([
			"audio/read--2.ogg",
			"audio/data.ogg",
			"audio/data--2.ogg",
			"audio/the.ogg",
		]);
		await runGeneration({ outputDir, dryRun: true, resume: true, ...options, source: undefined });
		expect(await readFile(path.join(outputDir, "plan.json"), "utf8")).toBe(saved);
		await expect(
			runGeneration({
				outputDir,
				resume: true,
				skipGenerated: [top1k],
				...options,
				source: undefined,
			}),
		).rejects.toThrow(/skipped plans/);
		await rm(path.join(top1k, "audio/read.ogg"));
		await expect(
			runGeneration({ outputDir, dryRun: true, resume: true, ...options, source: undefined }),
		).rejects.toThrow(/missing or changed: .*read\.ogg/);
	});
	it("refuses to resume a plan missing a form it never skipped", async () => {
		const outputDir = await directory();
		const options = { source: "top-10k", audioFormat: "ogg", ...settings } as const;
		await runGeneration({ outputDir, dryRun: true, words: ["read", "data"], ...options });
		const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8"));
		plan.samples = plan.samples.filter(
			({ file }: { file: string }) => file !== "audio/read--2.ogg",
		);
		await writeFile(path.join(outputDir, "plan.json"), JSON.stringify(plan));
		await expect(
			runGeneration({ outputDir, dryRun: true, resume: true, ...options, source: undefined }),
		).rejects.toThrow(/missing audio\/read--2\.ogg/);
	});
	it("refuses to skip a plan made with other settings or requests", async () => {
		const other = await directory();
		await runGeneration({ outputDir: other, words: ["seat"], provider, wait: noWait, ...settings });
		const outputDir = await directory();
		await expect(
			runGeneration({
				outputDir,
				dryRun: true,
				words: ["seat", "seed"],
				skipGenerated: [other],
				ratePercent: -10,
				...settings,
			}),
		).rejects.toThrow(/different voice, rate or format/);
		const plan = JSON.parse(await readFile(path.join(other, "plan.json"), "utf8"));
		plan.samples[0].input.text = "seat";
		await writeFile(path.join(other, "plan.json"), JSON.stringify(plan));
		await expect(
			runGeneration({
				outputDir,
				dryRun: true,
				words: ["seat", "seed"],
				skipGenerated: [other],
				...settings,
			}),
		).rejects.toThrow(/requested differently/);
		expect(await readdir(outputDir)).toEqual([]);
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
