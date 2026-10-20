import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { folderSources, loadVoicesSource, parseLabels } from "./sources";

describe("parseLabels", () => {
	it("reads the word each recording came out as", () => {
		expect(parseLabels({ Ship: "sheep", thin: "Neither" })).toEqual(
			new Map([
				["ship", "sheep"],
				["thin", "neither"],
			]),
		);
	});

	it("rejects anything but word-to-word entries", () => {
		expect(() => parseLabels(["ship"])).toThrow();
		expect(() => parseLabels({ ship: 1 })).toThrow();
		expect(() => parseLabels({ ship: " " })).toThrow();
	});
});

describe("loadVoicesSource", () => {
	let dir: string;
	beforeEach(async () => {
		dir = await mkdtemp(path.join(tmpdir(), "harness-voices-"));
	});
	afterEach(async () => {
		await rm(dir, { recursive: true, force: true });
	});

	it("scores relabelled recordings as the word they came out as", async () => {
		await mkdir(path.join(dir, "ana"));
		for (const word of ["ship", "sheep", "thin", "notes"]) {
			await writeFile(path.join(dir, "ana", `${word}.wav`), "");
		}
		await writeFile(
			path.join(dir, "ana", "labels.json"),
			JSON.stringify({ ship: "sheep", thin: "neither" }),
		);

		const loads = await loadVoicesSource(
			dir,
			["ship", "sheep", "thin", "sin"],
			new Set(["ship", "sheep", "thin", "sin"]),
		);
		const ana = loads.get("real:ana");
		expect(ana?.recordings.map(({ word, file }) => `${path.basename(file)} as ${word}`)).toEqual([
			"sheep.wav as sheep",
			"ship.wav as sheep",
		]);
		expect(ana?.missing).toEqual(["sin"]);
		expect(ana?.neither.map((file) => path.basename(file))).toEqual(["thin.wav"]);
	});

	it("rejects a label naming a word outside the catalog", async () => {
		await mkdir(path.join(dir, "ben"));
		await writeFile(path.join(dir, "ben", "ship.wav"), "");
		await writeFile(path.join(dir, "ben", "labels.json"), JSON.stringify({ ship: "shep" }));
		await expect(loadVoicesSource(dir, ["ship"], new Set(["ship"]))).rejects.toThrow(/shep/);
	});
});

describe("folderSources", () => {
	it("names a source after the nearest folder that isn't audio", () => {
		expect(
			folderSources(["output/tts/guy/audio", "output/tts/aria"], "tts").map(({ id }) => id),
		).toEqual(["tts:guy", "tts:aria"]);
	});

	it("takes an explicit name=path", () => {
		const [source] = folderSources(["male=output/tts/guy/audio"], "tts");
		expect(source).toEqual({ id: "tts:male", dir: path.resolve("output/tts/guy/audio") });
	});

	it("fails on two sources with one name", () => {
		expect(() => folderSources(["a/guy/audio", "b/guy"], "tts")).toThrow(/tts:guy/);
		expect(() => folderSources(["x/jenny"], "tts", new Set(["tts:jenny"]))).toThrow(/tts:jenny/);
	});
});
