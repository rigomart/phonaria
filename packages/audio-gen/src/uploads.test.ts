import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runGeneration } from "./generation";
import { manifestFromUploads, readUploadedBatch } from "./manifest";
import type { TtsProvider } from "./providers/types";
import { writeReviewSheet } from "./review-sheet";
import {
	buildUploadKey,
	parseUploadArguments,
	prepareUploads,
	recordPublished,
	runUpload,
	uploadArguments,
	type UploadOptions,
} from "./uploads";

const temporary: string[] = [];
afterEach(async () => {
	await Promise.all(temporary.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

const audioFor = (id: string) => `fixture audio for ${id}`;
const provider: TtsProvider = {
	async synthesize(inputs) {
		return inputs.map(({ id }) => ({ id, audio: Buffer.from(audioFor(id)) }));
	},
};
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

type FixtureSample = {
	word: string;
	ipa: string;
	form?: object;
	file: string;
	status: string;
	sha256: string;
	input: { id: string; text: string };
};

/** Writes a batch's marks into its review.tsv, by file. */
async function mark(dir: string, marks: Record<string, string>) {
	const file = path.join(dir, "review.tsv");
	const [header, ...rows] = (await readFile(file, "utf8")).trimEnd().split("\n");
	const accepted = header.split("\t").indexOf("accepted");
	const marked = rows.map((row) => {
		const cells = row.split("\t");
		if (marks[cells[0]] !== undefined) cells[accepted] = marks[cells[0]];
		return cells.join("\t");
	});
	await writeFile(file, `${[header, ...marked].join("\n")}\n`);
}

/**
 * A generated, checked batch whose sheet lists its first clip, marked yes: what upload
 * accepts. Each test then breaks one part of it.
 */
async function batch({
	extension = "ogg",
	source = "catalog" as const,
	words = ["seat", "seed"],
}: { extension?: string; source?: "catalog" | "top-10k"; words?: string[] } = {}) {
	const outputDir = await mkdtemp(path.join(os.tmpdir(), "phonaria-upload-test-"));
	temporary.push(outputDir);
	const quiet = vi.spyOn(console, "log").mockImplementation(() => {});
	await runGeneration({
		outputDir,
		source,
		words,
		audioFormat: extension,
		voiceId: "en-US-JennyNeural",
		provider,
		wait: async () => {},
	});
	quiet.mockRestore();
	const plan = JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8")) as {
		version: number;
		targetAccent: string;
		settings: { outputFormat: string };
		samples: FixtureSample[];
	};
	const save = () => writeFile(path.join(outputDir, "plan.json"), JSON.stringify(plan));
	const writeChecks = (files = plan.samples.map(({ file }) => file)) =>
		writeFile(
			path.join(outputDir, "checks.json"),
			JSON.stringify({
				clips: files.map((file) => ({ file, scoring: "scored", checks: {}, failed: [] })),
			}),
		);
	await writeChecks();
	const [first] = plan.samples;
	await adoptSheet(outputDir, [first.file]);
	await mark(outputDir, { [first.file]: "yes" });
	return { outputDir, plan, save, writeChecks };
}

/** Takes these files as the batch's sheet, bound to its plan and checks as they are now. */
async function adoptSheet(dir: string, files: readonly string[]) {
	const list = path.join(dir, "list.tsv");
	await writeFile(list, `file\treason\n${files.map((file) => `${file}\tlisted`).join("\n")}\n`);
	await writeReviewSheet(dir, { adopt: list, force: true, pronunciationsOf: () => undefined });
}

async function fixture(extension = "ogg") {
	const { outputDir, plan, save } = await batch({ extension });
	const options: UploadOptions = { outputDirs: [outputDir], accent: "en-us", voice: "jenny" };
	const runner = vi.fn<(executable: string, args: string[]) => Promise<void>>().mockResolvedValue();
	const fetcher = vi.fn<typeof fetch>().mockImplementation(async (url) => {
		const name = String(url).split("/").at(-1) as string;
		const uploaded = runner.mock.calls.some(([, args]) => args[3].endsWith(`/${name}`));
		return new Response(
			null,
			uploaded
				? {
						status: 200,
						headers: {
							"content-type": extension === "ogg" ? "audio/ogg" : "audio/mpeg",
							"content-length": String(Buffer.byteLength(audioFor(name.split(".")[0]))),
						},
					}
				: { status: 404 },
		);
	});
	const log = vi.fn();
	return { outputDir, options, plan, save, runner, fetcher, log };
}

async function records(outputDir: string) {
	const files = (await readdir(outputDir)).filter(
		(name) => name.startsWith("upload-") && name.endsWith(".json"),
	);
	return Promise.all(
		files.map(async (name) => JSON.parse(await readFile(path.join(outputDir, name), "utf8"))),
	);
}

describe("upload keys and arguments", () => {
	it("uses the manifest's lowercase voice folder and preserves MP3 extensions", () => {
		expect(buildUploadKey("en-us", "jenny", "coffee", "ogg")).toBe(
			"audio/en-us/words/jenny/coffee.ogg",
		);
		expect(buildUploadKey("en-us", "aria", "dogs", "mp3")).toBe("audio/en-us/words/aria/dogs.mp3");
		expect(buildUploadKey("en-us", "jenny", "read--2", "ogg")).toBe(
			"audio/en-us/words/jenny/read--2.ogg",
		);
	});
	it.each([
		["../en-us", "jenny", "coffee", "ogg"],
		["en-us", "Jenny", "coffee", "ogg"],
		["en-us", "jenny", "../coffee", "ogg"],
		["en-us", "jenny", "coffee", "wav"],
		["en-us", "jenny", "coffee-2", "ogg"],
	])("rejects unsafe or unsupported key parts: %s %s %s %s", (...parts) => {
		expect(() => buildUploadKey(...(parts as [string, string, string, string]))).toThrow();
	});
	it("parses explicit upload options without environment credentials", () => {
		expect(
			parseUploadArguments([
				"--out=/tmp/audio output",
				"--out=/tmp/retakes",
				"--accent=en-us",
				"--voice=jenny",
				"--dry-run",
				"--overwrite",
				"--skip-recorded",
				"--bucket=other-bucket",
				"--concurrency=3",
			]),
		).toEqual({
			outputDirs: ["/tmp/audio output", "/tmp/retakes"],
			accent: "en-us",
			voice: "jenny",
			dryRun: true,
			overwrite: true,
			skipRecorded: true,
			bucket: "other-bucket",
			concurrency: 3,
		});
		expect(
			parseUploadArguments(["--out=/tmp/audio", "--accent=en-us", "--voice=jenny"]),
		).toMatchObject({ bucket: "rigos-assets", concurrency: 8 });
	});
	it.each([
		"--concurrency=0",
		"--concurrency=33",
		"--concurrency=1.5",
		"--concurrency=1e1",
		"--bucket=x/y",
		"--voice=Jenny",
		"--out=",
		"--out=/tmp/audio",
		"--unknown",
		"--accent=en-us",
	])("rejects invalid or repeated options: %s", (arg) => {
		expect(() =>
			parseUploadArguments(["--out=/tmp/audio", "--accent=en-us", "--voice=jenny", arg]),
		).toThrow();
	});
	it("requires the output directory, accent, and voice", () => {
		expect(() => parseUploadArguments(["--out=/tmp/audio"])).toThrow(/Usage/);
	});
	it("constructs separate process arguments, always remote, including paths with shell characters", () => {
		const clip = {
			key: "audio/en-us/words/jenny/coffee.ogg",
			file: "/tmp/audio $(ignored)/coffee.ogg",
			contentType: "audio/ogg",
			size: 3,
			sha256: "abc",
		};
		expect(uploadArguments("rigos-assets", clip)).toEqual([
			"r2",
			"object",
			"put",
			"rigos-assets/audio/en-us/words/jenny/coffee.ogg",
			"--file=/tmp/audio $(ignored)/coffee.ogg",
			"--content-type=audio/ogg",
			"--remote",
		]);
	});
});

describe("upload plan validation", () => {
	it("selects only exact files named by the completed plan", async () => {
		const f = await fixture();
		await writeFile(path.join(f.outputDir, "audio/extra.ogg"), "not planned");
		const { clips, leftOut } = await prepareUploads(f.options);
		expect(clips.map(({ key }) => key)).toEqual([
			"audio/en-us/words/jenny/seat.ogg",
			"audio/en-us/words/jenny/seed.ogg",
		]);
		expect(leftOut).toEqual([]);
		expect(clips[0]).toMatchObject({
			file: path.join(f.outputDir, "audio/seat.ogg"),
			size: Buffer.byteLength(audioFor("seat")),
			sha256: f.plan.samples[0].sha256,
			contentType: "audio/ogg",
		});
	});
	it("uploads an extra form under its numbered key, after checking its path", async () => {
		const { outputDir, plan, save } = await batch({ source: "top-10k", words: ["read"] });
		const options = { outputDirs: [outputDir], accent: "en-us", voice: "jenny" };
		expect((await prepareUploads(options)).clips.map(({ key }) => key)).toEqual([
			"audio/en-us/words/jenny/read.ogg",
			"audio/en-us/words/jenny/read--2.ogg",
		]);
		plan.samples[1].file = "audio/read.ogg";
		await save();
		await expect(prepareUploads(options)).rejects.toThrow(/path/);
	});
	it.each(["planned", "failed"])("refuses the entire batch if one sample is %s", async (status) => {
		const f = await fixture();
		f.plan.samples[1].status = status;
		await f.save();
		await expect(runUpload(f.options, f)).rejects.toThrow(/generated/);
		expect(f.runner).not.toHaveBeenCalled();
		expect(f.fetcher).not.toHaveBeenCalled();
	});
	it.each([
		"missing checksum",
		"changed audio",
		"missing audio",
		"empty audio",
		"unsafe path",
		"duplicate word",
		"no samples",
		"wrong accent",
		"wrong voice",
		"unsupported format",
		"wrong version",
	])("rejects %s before external calls", async (change) => {
		const f = await fixture();
		if (change === "missing checksum") f.plan.samples[0].sha256 = "";
		if (change === "changed audio")
			await writeFile(path.join(f.outputDir, f.plan.samples[0].file), "changed");
		if (change === "missing audio") await rm(path.join(f.outputDir, f.plan.samples[0].file));
		if (change === "empty audio") {
			await writeFile(path.join(f.outputDir, f.plan.samples[0].file), "");
			f.plan.samples[0].sha256 = sha256("");
		}
		if (change === "unsafe path") f.plan.samples[0].file = "../../seat.ogg";
		if (change === "duplicate word") f.plan.samples.push(f.plan.samples[0]);
		if (change === "no samples") f.plan.samples = [];
		if (change === "wrong accent") f.plan.targetAccent = "es-419";
		if (change === "wrong voice") f.options.voice = "aria";
		if (change === "unsupported format") f.plan.settings.outputFormat = "wav";
		if (change === "wrong version") f.plan.version = 2;
		await f.save();
		await expect(runUpload(f.options, f)).rejects.toThrow();
		expect(f.runner).not.toHaveBeenCalled();
		expect(f.fetcher).not.toHaveBeenCalled();
	});
	it("dry run prints exact mappings with no external calls or upload records", async () => {
		const f = await fixture();
		await runUpload({ ...f.options, dryRun: true }, f);
		expect(f.log).toHaveBeenCalledWith(
			`audio/en-us/words/jenny/seat.ogg ↔ ${f.outputDir}/audio/seat.ogg`,
		);
		expect(f.log).toHaveBeenCalledWith(
			`audio/en-us/words/jenny/seed.ogg ↔ ${f.outputDir}/audio/seed.ogg`,
		);
		expect(f.runner).not.toHaveBeenCalled();
		expect(f.fetcher).not.toHaveBeenCalled();
		expect(await records(f.outputDir)).toEqual([]);
	});
});

describe("the review guard", () => {
	it("refuses a batch the checks haven't run on, or ran on only in part", async () => {
		const f = await fixture();
		await rm(path.join(f.outputDir, "checks.json"));
		await expect(runUpload(f.options, f)).rejects.toThrow(/no checks\.json; run check/);
		const { outputDir, writeChecks } = await batch();
		await writeChecks(["audio/seat.ogg"]);
		await expect(
			prepareUploads({ outputDirs: [outputDir], accent: "en-us", voice: "jenny" }),
		).rejects.toThrow(/checks\.json has no results for audio\/seed\.ogg/);
		expect(f.runner).not.toHaveBeenCalled();
	});
	it("refuses a batch without a sheet, or with a clip on it not marked yes or no", async () => {
		const f = await fixture();
		await mark(f.outputDir, { "audio/seat.ogg": "" });
		await expect(runUpload(f.options, f)).rejects.toThrow(
			/1 of 1 clips on sample\.tsv aren't marked yes or no in review\.tsv: audio\/seat\.ogg/,
		);
		await rm(path.join(f.outputDir, "sample.tsv"));
		await expect(runUpload(f.options, f)).rejects.toThrow(/no sample\.tsv; run sample/);
		expect(f.runner).not.toHaveBeenCalled();
		expect(f.fetcher).not.toHaveBeenCalled();
	});
	it("dry run lists only accepted, current clips and names the left-out ones with reasons", async () => {
		const { outputDir, plan, save } = await batch({ words: ["seat", "seed", "sheep", "ship"] });
		await mark(outputDir, { "audio/seed.ogg": "no\tcut off", "audio/sheep.ogg": "yes" });
		// A clip planned before its request changed, and a word the source no longer selects.
		plan.samples[0].ipa = "sɪt";
		plan.samples[0].input.text = plan.samples[0].input.text.replace("sit", "sɪt");
		const zebra = { ...plan.samples[3], word: "zebra", file: "audio/zebra.ogg" };
		await writeFile(path.join(outputDir, zebra.file), "zebra");
		plan.samples.push({
			...zebra,
			sha256: sha256("zebra"),
			input: { ...zebra.input, id: "zebra" },
		});
		await save();
		await writeFile(
			path.join(outputDir, "checks.json"),
			JSON.stringify({
				clips: plan.samples.map(({ file }) => ({
					file,
					scoring: "scored",
					checks: {},
					failed: [],
				})),
			}),
		);
		await adoptSheet(outputDir, ["audio/seat.ogg"]);
		const log = vi.fn();
		const runner = vi.fn();
		const fetcher = vi.fn<typeof fetch>();
		await runUpload(
			{ outputDirs: [outputDir], accent: "en-us", voice: "jenny", dryRun: true },
			{ log, runner, fetcher },
		);
		const lines: string[] = log.mock.calls.map(([line]) => line);
		expect(lines.filter((line) => line.includes("↔"))).toEqual([
			`audio/en-us/words/jenny/sheep.ogg ↔ ${outputDir}/audio/sheep.ogg`,
			`audio/en-us/words/jenny/ship.ogg ↔ ${outputDir}/audio/ship.ogg`,
		]);
		expect(lines.filter((line) => line.startsWith("Left out"))).toEqual([
			`Left out ${outputDir}/audio/seat.ogg: planned differently: now requests /sit/, not /sɪt/ (ipa, input changed)`,
			`Left out ${outputDir}/audio/seed.ogg: marked no: cut off`,
			`Left out ${outputDir}/audio/zebra.ogg: no longer selected: catalog no longer selects "zebra"`,
		]);
		expect(lines.at(-1)).toBe(
			"Dry run: 2 clips to upload; 3 left out (1 planned differently, 1 marked no, 1 no longer selected). No uploads or network requests.",
		);
		expect(runner).not.toHaveBeenCalled();
		expect(fetcher).not.toHaveBeenCalled();
	});
	it("refuses two batches that publish the same key in one run, until one clip is marked no", async () => {
		const first = await batch();
		const retake = await batch({ words: ["seat"] });
		const options = {
			outputDirs: [first.outputDir, retake.outputDir],
			accent: "en-us",
			voice: "jenny",
		};
		await expect(prepareUploads(options)).rejects.toThrow(
			`audio/en-us/words/jenny/seat.ogg comes from ${first.outputDir}/audio/seat.ogg and ${retake.outputDir}/audio/seat.ogg; mark all but one no`,
		);
		await mark(first.outputDir, { "audio/seat.ogg": "no" });
		const { clips, leftOut } = await prepareUploads(options);
		expect(clips.map(({ file }) => file)).toEqual([
			path.join(first.outputDir, "audio/seed.ogg"),
			path.join(retake.outputDir, "audio/seat.ogg"),
		]);
		expect(leftOut).toMatchObject([
			{ file: path.join(first.outputDir, "audio/seat.ogg"), kind: "marked no" },
		]);
	});
	it("refuses a file marked twice, so a later yes can't hide a no", async () => {
		const f = await fixture();
		await mark(f.outputDir, { "audio/seat.ogg": "no" });
		const review = path.join(f.outputDir, "review.tsv");
		const lines = (await readFile(review, "utf8")).trimEnd().split("\n");
		const again = lines[1].replace("\tno\t", "\tyes\t");
		await writeFile(review, `${[...lines, again].join("\n")}\n`);
		await expect(runUpload(f.options, f)).rejects.toThrow(
			"review.tsv lists audio/seat.ogg twice; keep one row for it",
		);
		expect(f.runner).not.toHaveBeenCalled();
	});
	it("refuses a sheet drawn before the batch was finished, or before its last check", async () => {
		const outputDir = await mkdtemp(path.join(os.tmpdir(), "phonaria-upload-test-"));
		temporary.push(outputDir);
		const quiet = vi.spyOn(console, "log").mockImplementation(() => {});
		const options = { outputDir, words: ["seat", "seed"], audioFormat: "ogg" };
		const stopsAtSeed: TtsProvider = {
			async synthesize(inputs) {
				if (inputs[0].id === "seed") throw new Error("HTTP 429");
				return provider.synthesize(inputs);
			},
		};
		const generate = (resume: boolean, using: TtsProvider) =>
			runGeneration({
				...(resume ? { outputDir, resume, audioFormat: "ogg" } : options),
				voiceId: "en-US-JennyNeural",
				provider: using,
				wait: async () => {},
			});
		await expect(generate(false, stopsAtSeed)).rejects.toThrow(/429/);
		const checks = (clips: object[]) =>
			writeFile(path.join(outputDir, "checks.json"), JSON.stringify({ clips }));
		const passed = (file: string) => ({ file, scoring: "scored", checks: {}, failed: [] });
		await checks([passed("audio/seat.ogg")]);
		const draw = () =>
			writeReviewSheet(outputDir, { force: true, pronunciationsOf: () => undefined });
		await expect(draw()).rejects.toThrow(/1 samples aren't generated yet \(audio\/seed\.ogg\)/);

		await generate(true, provider);
		quiet.mockRestore();
		const failedBoth = {
			file: "audio/seed.ogg",
			scoring: "scored",
			checks: {
				"word-heard": { passed: false, detail: 'heard "sid" at 0.5' },
				"no-swapped-sound": { passed: false, detail: "/i/ heard as /ɪ/" },
			},
			failed: ["word-heard", "no-swapped-sound"],
		};
		await checks([passed("audio/seat.ogg"), passed("audio/seed.ogg")]);
		const { rows } = await draw();
		await mark(outputDir, Object.fromEntries(rows.map(({ file }) => [file, "yes"])));
		const upload = { outputDirs: [outputDir], accent: "en-us", voice: "jenny" };
		expect((await prepareUploads(upload)).clips).toHaveLength(2);

		await checks([passed("audio/seat.ogg"), failedBoth]);
		await expect(prepareUploads(upload)).rejects.toThrow(
			/checks\.json changed since sample\.tsv was drawn with seed 358; draw it again/,
		);
		await draw();
		await mark(outputDir, { "audio/seed.ogg": "no" });
		const { clips, leftOut } = await prepareUploads(upload);
		expect(clips.map(({ file }) => path.basename(file))).toEqual(["seat.ogg"]);
		expect(leftOut).toMatchObject([{ kind: "marked no" }]);
		await rm(path.join(outputDir, "sample.json"));
		await expect(prepareUploads(upload)).rejects.toThrow(/no sample\.json/);
	});
	it("refuses to upload clips whose words the manifest already lists, unless --skip-recorded", async () => {
		const { outputDir, plan, save, writeChecks } = await batch({
			source: "top-10k",
			words: ["people"],
		});
		const seat = { ...plan.samples[0], word: "seat", file: "audio/seat.ogg" };
		await writeFile(path.join(outputDir, seat.file), "seat");
		plan.samples.push({ ...seat, sha256: sha256("seat"), input: { ...seat.input, id: "seat" } });
		await save();
		await writeChecks();
		await adoptSheet(outputDir, ["audio/people.ogg"]);
		const runner = vi.fn<(executable: string, args: string[]) => Promise<void>>();
		const fetcher = vi.fn<typeof fetch>().mockImplementation(async () =>
			runner.mock.calls.length
				? new Response(null, {
						status: 200,
						headers: {
							"content-type": "audio/ogg",
							"content-length": String(Buffer.byteLength(audioFor("people"))),
						},
					})
				: new Response(null, { status: 404 }),
		);
		const log = vi.fn();
		const options = { outputDirs: [outputDir], accent: "en-us", voice: "jenny" };
		const warning =
			"1 clips are left out because the manifest already lists their words, as after a partial upload; check the earlier upload records, then pass --skip-recorded to upload the rest.";
		await runUpload({ ...options, dryRun: true }, { log, runner, fetcher });
		expect(log).toHaveBeenCalledWith(
			`Left out ${outputDir}/audio/seat.ogg: already recorded: the word-audio manifest already lists "seat"`,
		);
		expect(log).toHaveBeenCalledWith(warning);
		await expect(runUpload(options, { log, runner, fetcher })).rejects.toThrow(warning);
		expect(runner).not.toHaveBeenCalled();
		expect(fetcher).not.toHaveBeenCalled();
		await runUpload({ ...options, skipRecorded: true }, { log, runner, fetcher });
		expect(runner.mock.calls.map(([, args]) => args[3])).toEqual([
			"rigos-assets/audio/en-us/words/jenny/people.ogg",
		]);
	});
});

describe("publishing with injected Wrangler and HEAD requests", () => {
	it("refuses existing objects across the whole batch before any put", async () => {
		const f = await fixture();
		f.fetcher
			.mockResolvedValueOnce(new Response(null, { status: 404 }))
			.mockResolvedValueOnce(new Response(null, { status: 200 }));
		await expect(runUpload(f.options, f)).rejects.toThrow(/Object exists.*seed.*--overwrite/);
		expect(f.runner).not.toHaveBeenCalled();
		expect(await records(f.outputDir)).toEqual([]);
	});
	it.each([403, 500, 301])("fails closed on preflight HTTP %s", async (status) => {
		const f = await fixture();
		f.fetcher.mockResolvedValue(new Response(null, { status }));
		await expect(runUpload(f.options, f)).rejects.toThrow(`HTTP ${status}`);
		expect(f.runner).not.toHaveBeenCalled();
	});
	it("fails closed on preflight network errors", async () => {
		const f = await fixture();
		f.fetcher.mockRejectedValue(new Error("offline"));
		await expect(runUpload(f.options, f)).rejects.toThrow(/HEAD request failed/);
		expect(f.runner).not.toHaveBeenCalled();
	});
	it("allows explicit overwrite, verifies metadata, and retains a record for each run", async () => {
		const f = await fixture();
		f.fetcher
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockResolvedValueOnce(new Response(null, { status: 200 }));
		await runUpload({ ...f.options, overwrite: true }, f);
		expect(f.runner).toHaveBeenCalledTimes(2);
		const { clips } = await prepareUploads(f.options);
		expect(f.runner).toHaveBeenCalledWith(
			path.resolve(import.meta.dirname, "../../../apps/phonaria/node_modules/.bin/wrangler"),
			uploadArguments("rigos-assets", clips[0]),
		);
		for (const [url, request] of f.fetcher.mock.calls) {
			expect(String(url)).toMatch(
				/^https:\/\/assets\.rigos\.dev\/audio\/en-us\/words\/jenny\/(seat|seed)\.ogg$/,
			);
			expect(request).toMatchObject({ method: "HEAD", redirect: "error" });
		}
		const [record] = await records(f.outputDir);
		expect(record.bucket).toBe("rigos-assets");
		expect(record.batches).toEqual([f.outputDir]);
		expect(record.leftOut).toEqual([]);
		expect(record.entries).toEqual(
			clips.map((clip) => ({ ...clip, uploadedAt: expect.any(String), verified: true })),
		);
		await runUpload({ ...f.options, overwrite: true }, f);
		expect(await records(f.outputDir)).toHaveLength(2);
	});
	it("records the left-out clips with their reasons in every batch it publishes", async () => {
		const f = await fixture();
		const retake = await batch({ words: ["seat"] });
		await mark(f.outputDir, { "audio/seat.ogg": "no\tclipped" });
		await runUpload({ ...f.options, outputDirs: [f.outputDir, retake.outputDir] }, f);
		const [record] = await records(f.outputDir);
		expect(record.leftOut).toEqual([
			{
				key: "audio/en-us/words/jenny/seat.ogg",
				file: path.join(f.outputDir, "audio/seat.ogg"),
				kind: "marked no",
				reason: "clipped",
			},
		]);
		expect(record.entries.map(({ file }: { file: string }) => file)).toEqual([
			path.join(f.outputDir, "audio/seed.ogg"),
			path.join(retake.outputDir, "audio/seat.ogg"),
		]);
		expect(await records(retake.outputDir)).toEqual([record]);
	});
	it("uploads MP3 plans as audio/mpeg", async () => {
		const f = await fixture("mp3");
		await runUpload(f.options, f);
		expect(f.runner.mock.calls[0][1]).toContain("--content-type=audio/mpeg");
		expect(f.runner.mock.calls[0][1][3]).toBe("rigos-assets/audio/en-us/words/jenny/seat.mp3");
	});
	it.each(["status", "content-type", "content-length", "network"])(
		"records and fails verification on wrong %s",
		async (failure) => {
			const f = await fixture();
			f.fetcher.mockImplementation(async (_url, _request) => {
				if (!f.runner.mock.calls.length) return new Response(null, { status: 404 });
				if (failure === "network") throw new Error("offline");
				return new Response(null, {
					status: failure === "status" ? 404 : 200,
					headers: {
						"content-type": failure === "content-type" ? "audio/mpeg" : "audio/ogg",
						"content-length": failure === "content-length" ? "999" : "22",
					},
				});
			});
			await expect(runUpload(f.options, f)).rejects.toThrow();
			const [record] = await records(f.outputDir);
			expect(
				record.entries.every(
					(entry: { verified: boolean; uploadedAt: string; error: string }) =>
						!entry.verified && entry.uploadedAt && entry.error,
				),
			).toBe(true);
			expect(f.log).toHaveBeenCalledWith(expect.stringContaining("2/2 uploaded; 0/2 verified"));
		},
	);
	it("records Wrangler failures and finishes other attempts before reporting failure", async () => {
		const f = await fixture();
		f.runner.mockRejectedValueOnce(new Error("Wrangler exit 1"));
		await expect(runUpload({ ...f.options, concurrency: 1 }, f)).rejects.toThrow(/Wrangler exit 1/);
		const [record] = await records(f.outputDir);
		expect(record.entries[0]).toMatchObject({
			uploadedAt: null,
			verified: false,
			error: "Wrangler exit 1",
		});
		expect(record.entries[1]).toMatchObject({ uploadedAt: expect.any(String), verified: true });
		expect(f.log).toHaveBeenCalledWith(expect.stringContaining("1/2 uploaded; 1/2 verified"));
	});
	it.each([1, 2])("bounds active uploads to concurrency %s", async (concurrency) => {
		const f = await fixture();
		let active = 0;
		let maximum = 0;
		f.runner.mockImplementation(async () => {
			active++;
			maximum = Math.max(maximum, active);
			await new Promise((resolve) => setTimeout(resolve, 10));
			active--;
		});
		await runUpload({ ...f.options, concurrency }, f);
		expect(maximum).toBe(concurrency);
	});
});

describe("the manifest reads what upload recorded", () => {
	it("lists the clips verified across a batch and its retakes, and none that failed", async () => {
		const f = await fixture();
		const retake = await batch({ words: ["seat"] });
		await mark(f.outputDir, { "audio/seat.ogg": "no\tclipped" });
		const outputDirs = [f.outputDir, retake.outputDir];
		await runUpload({ ...f.options, outputDirs }, f);
		expect(manifestFromUploads(outputDirs.map(readUploadedBatch)).words).toEqual(["seat", "seed"]);

		const failed = await fixture();
		failed.runner.mockRejectedValueOnce(new Error("Wrangler exit 1"));
		await expect(runUpload({ ...failed.options, concurrency: 1 }, failed)).rejects.toThrow();
		expect(manifestFromUploads([readUploadedBatch(failed.outputDir)]).words).toEqual(["seed"]);
	});

	it("records a batch published before upload records only when its bytes match the plan", async () => {
		const f = await fixture();
		const fetcher = vi.fn<typeof fetch>().mockImplementation(async (url) => {
			const word = String(url).split("/").at(-1)?.split(".")[0] as string;
			return word === "seed"
				? new Response("other audio", { status: 200 })
				: new Response(audioFor(word), { status: 200 });
		});
		const log = vi.fn();
		await expect(recordPublished(f.options, { fetcher, log })).rejects.toThrow(
			/seed\.ogg: the published bytes don't match/,
		);
		expect(fetcher).toHaveBeenCalledWith(
			"https://assets.rigos.dev/audio/en-us/words/jenny/seat.ogg",
			expect.objectContaining({ redirect: "error" }),
		);
		const [record] = await records(f.outputDir);
		expect(record.checked).toBe("https://assets.rigos.dev");
		expect(record.entries.map(({ verified }: { verified: boolean }) => verified)).toEqual([
			true,
			false,
		]);
		expect(log).toHaveBeenCalledWith(expect.stringContaining("1/2 clips match"));
		expect(manifestFromUploads([readUploadedBatch(f.outputDir)]).words).toEqual(["seat"]);
	});
});
