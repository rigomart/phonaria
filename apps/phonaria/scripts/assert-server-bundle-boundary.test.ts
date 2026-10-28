import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertServerBundleKeepsClientDataOut } from "./assert-server-bundle-boundary";

function bundleWith(source: string): string {
	const directory = mkdtempSync(join(tmpdir(), "lab-worker-bundle-"));
	mkdirSync(join(directory, "chunks"));
	writeFileSync(join(directory, "index.js"), "export const handler = {}");
	writeFileSync(join(directory, "chunks/server.js"), source);
	return directory;
}

describe("assertServerBundleKeepsClientDataOut", () => {
	it("accepts a Worker bundle without curated-10k", () => {
		expect(assertServerBundleKeepsClientDataOut(bundleWith("export const words = []"))).toEqual([]);
	});

	it.each([
		[
			'import data from "@phonaria/phonetics-data/data/en/curated-10k"',
			"phonetics-data/data/en/curated-10k",
		],
		['import data from "../data/en/curated/top-10k.json"', "data/en/curated/top-10k.json"],
		['const words = {"bypass":["B AI1 P AE2 S"]}', "B AI1 P AE2 S"],
		['const words = {"holder":["H OU1 L D ER0"]}', "H OU1 L D ER0"],
		['const words = JSON.parse("{\\"holder\\":[\\"H OU1 L D ER0\\"]}")', "H OU1 L D ER0"],
	])("fails when a server module contains %s", (source, marker) => {
		const directory = bundleWith(source);
		expect(assertServerBundleKeepsClientDataOut(directory)).toEqual([
			`${join(directory, "chunks/server.js")}: ${marker}`,
		]);
	});

	it("accepts a word that only contains a 10k-only pronunciation", () => {
		const source = 'const words = {"shoulder":["SH OU1 L D ER0"]}';
		expect(assertServerBundleKeepsClientDataOut(bundleWith(source))).toEqual([]);
	});

	it("fails when the directory has no JavaScript modules", () => {
		const directory = mkdtempSync(join(tmpdir(), "lab-worker-bundle-"));
		writeFileSync(join(directory, "README.txt"), "not a bundle");
		expect(() => assertServerBundleKeepsClientDataOut(directory)).toThrow(/No JavaScript modules/);
	});
});
