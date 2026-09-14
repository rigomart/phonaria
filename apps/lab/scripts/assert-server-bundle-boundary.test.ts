import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertServerBundleKeepsClientDataOut } from "./assert-server-bundle-boundary";

describe("assertServerBundleKeepsClientDataOut", () => {
	it("accepts a Worker bundle without curated-10k", () => {
		const directory = mkdtempSync(join(tmpdir(), "lab-worker-bundle-"));
		writeFileSync(join(directory, "index.js"), "export const handler = {}");
		expect(assertServerBundleKeepsClientDataOut(directory)).toEqual([]);
	});

	it("fails when curated-10k is present in a server module", () => {
		const directory = mkdtempSync(join(tmpdir(), "lab-worker-bundle-"));
		mkdirSync(join(directory, "chunks"));
		writeFileSync(
			join(directory, "chunks/server.js"),
			'import data from "@phonaria/phonetics-data/data/en/curated-10k"',
		);
		expect(assertServerBundleKeepsClientDataOut(directory).length).toBeGreaterThan(0);
	});
});
