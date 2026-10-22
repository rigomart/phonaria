import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	buildUploadKey,
	parseUploadArguments,
	prepareUploads,
	runUpload,
	uploadArguments,
	type UploadOptions,
} from "./uploads";

const temporary: string[] = [];
afterEach(async () => {
	await Promise.all(temporary.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function fixture(extension = "ogg") {
	const outputDir = await mkdtemp(path.join(os.tmpdir(), "phonaria-upload-test-"));
	temporary.push(outputDir);
	await mkdir(path.join(outputDir, "audio"));
	const samples = await Promise.all(
		["coffee", "dogs"].map(async (word) => {
			const audio = Buffer.from(`fixture audio for ${word}`);
			const file = `audio/${word}.${extension}`;
			await writeFile(path.join(outputDir, file), audio);
			const sample: { word: string; form?: object; file: string; status: string; sha256: string } =
				{
					word,
					file,
					status: "generated",
					sha256: createHash("sha256").update(audio).digest("hex"),
				};
			return sample;
		}),
	);
	const plan = {
		version: 1,
		targetAccent: "en-us",
		settings: {
			voiceId: "en-US-JennyNeural",
			outputFormat:
				extension === "ogg" ? "ogg-24khz-16bit-mono-opus" : "audio-24khz-160kbitrate-mono-mp3",
		},
		samples,
	};
	const save = () => writeFile(path.join(outputDir, "plan.json"), JSON.stringify(plan));
	await save();
	const options: UploadOptions = { outputDir, accent: "en-us", voice: "jenny" };
	const runner = vi.fn<(executable: string, args: string[]) => Promise<void>>().mockResolvedValue();
	const fetcher = vi.fn<typeof fetch>().mockImplementation(async (url) => {
		const word = String(url).includes("coffee") ? "coffee" : "dogs";
		const uploaded = runner.mock.calls.some(([, args]) =>
			args[3].endsWith(`/${word}.${extension}`),
		);
		return new Response(
			null,
			uploaded
				? {
						status: 200,
						headers: {
							"content-type": extension === "ogg" ? "audio/ogg" : "audio/mpeg",
							"content-length": String(Buffer.byteLength(`fixture audio for ${word}`)),
						},
					}
				: { status: 404 },
		);
	});
	const log = vi.fn();
	return { options, plan, save, runner, fetcher, log };
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
				"--accent=en-us",
				"--voice=jenny",
				"--dry-run",
				"--overwrite",
				"--bucket=other-bucket",
				"--concurrency=3",
			]),
		).toEqual({
			outputDir: "/tmp/audio output",
			accent: "en-us",
			voice: "jenny",
			dryRun: true,
			overwrite: true,
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
		await writeFile(path.join(f.options.outputDir, "audio/extra.ogg"), "not planned");
		const clips = await prepareUploads(f.options);
		expect(clips.map(({ key }) => key)).toEqual([
			"audio/en-us/words/jenny/coffee.ogg",
			"audio/en-us/words/jenny/dogs.ogg",
		]);
		expect(clips[0]).toMatchObject({
			file: path.join(f.options.outputDir, "audio/coffee.ogg"),
			size: 24,
			sha256: f.plan.samples[0].sha256,
			contentType: "audio/ogg",
		});
	});
	it("uploads an extra form under its numbered key, after checking its path", async () => {
		const f = await fixture();
		const audio = Buffer.from("fixture audio for coffee--2");
		await writeFile(path.join(f.options.outputDir, "audio/coffee--2.ogg"), audio);
		f.plan.samples.push({
			...f.plan.samples[0],
			form: { n: 2, label: "also said" },
			file: "audio/coffee--2.ogg",
			sha256: createHash("sha256").update(audio).digest("hex"),
		});
		await f.save();
		expect((await prepareUploads(f.options)).map(({ key }) => key)).toContain(
			"audio/en-us/words/jenny/coffee--2.ogg",
		);
		f.plan.samples[2].file = "audio/coffee.ogg";
		await f.save();
		await expect(prepareUploads(f.options)).rejects.toThrow(/path/);
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
			await writeFile(path.join(f.options.outputDir, f.plan.samples[0].file), "changed");
		if (change === "missing audio")
			await rm(path.join(f.options.outputDir, f.plan.samples[0].file));
		if (change === "empty audio") {
			await writeFile(path.join(f.options.outputDir, f.plan.samples[0].file), "");
			f.plan.samples[0].sha256 = createHash("sha256").update("").digest("hex");
		}
		if (change === "unsafe path") f.plan.samples[0].file = "../../coffee.ogg";
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
			`audio/en-us/words/jenny/coffee.ogg ↔ ${f.options.outputDir}/audio/coffee.ogg`,
		);
		expect(f.log).toHaveBeenCalledWith(
			`audio/en-us/words/jenny/dogs.ogg ↔ ${f.options.outputDir}/audio/dogs.ogg`,
		);
		expect(f.runner).not.toHaveBeenCalled();
		expect(f.fetcher).not.toHaveBeenCalled();
		expect(await records(f.options.outputDir)).toEqual([]);
	});
});

describe("publishing with injected Wrangler and HEAD requests", () => {
	it("refuses existing objects across the whole batch before any put", async () => {
		const f = await fixture();
		f.fetcher
			.mockResolvedValueOnce(new Response(null, { status: 404 }))
			.mockResolvedValueOnce(new Response(null, { status: 200 }));
		await expect(runUpload(f.options, f)).rejects.toThrow(/Object exists.*dogs.*--overwrite/);
		expect(f.runner).not.toHaveBeenCalled();
		expect(await records(f.options.outputDir)).toEqual([]);
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
		const clips = await prepareUploads(f.options);
		expect(f.runner).toHaveBeenCalledWith(
			path.resolve(import.meta.dirname, "../../../apps/phonaria/node_modules/.bin/wrangler"),
			uploadArguments("rigos-assets", clips[0]),
		);
		for (const [url, request] of f.fetcher.mock.calls) {
			expect(String(url)).toMatch(
				/^https:\/\/assets\.rigos\.dev\/audio\/en-us\/words\/jenny\/(coffee|dogs)\.ogg$/,
			);
			expect(request).toMatchObject({ method: "HEAD", redirect: "error" });
		}
		const [record] = await records(f.options.outputDir);
		expect(record.bucket).toBe("rigos-assets");
		expect(record.entries).toEqual(
			clips.map((clip) => ({ ...clip, uploadedAt: expect.any(String), verified: true })),
		);
		await runUpload({ ...f.options, overwrite: true }, f);
		expect(await records(f.options.outputDir)).toHaveLength(2);
	});
	it("uploads MP3 plans as audio/mpeg", async () => {
		const f = await fixture("mp3");
		await runUpload(f.options, f);
		expect(f.runner.mock.calls[0][1]).toContain("--content-type=audio/mpeg");
		expect(f.runner.mock.calls[0][1][3]).toBe("rigos-assets/audio/en-us/words/jenny/coffee.mp3");
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
						"content-length": failure === "content-length" ? "999" : "24",
					},
				});
			});
			await expect(runUpload(f.options, f)).rejects.toThrow();
			const [record] = await records(f.options.outputDir);
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
		const [record] = await records(f.options.outputDir);
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
