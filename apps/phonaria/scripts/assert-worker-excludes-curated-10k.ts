#!/usr/bin/env bun
/**
 * Fail if the 10k pronunciation table was bundled into the Start Worker.
 * Practice must keep that asset on the client-only dynamic import path.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const MARKERS = ["B AI1 P AE2 S", "H OU1 L D ER0", "data/en/curated/top-10k.json"] as const;
const JS_MODULE = /\.(m?js)$/i;

function listFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = join(directory, entry.name);
		return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
	});
}

function runCli(): void {
	const root = resolve(import.meta.dirname, "..");
	const serverDir = resolve(root, process.argv[2] ?? "dist/server");
	const files = listFiles(serverDir).filter((file) => JS_MODULE.test(file));
	if (files.length === 0) {
		throw new Error(`No JavaScript modules found under ${serverDir}.`);
	}

	const hits: string[] = [];
	for (const file of files) {
		if (statSync(file).isDirectory()) continue;
		const contents = readFileSync(file, "utf8");
		for (const marker of MARKERS) {
			if (contents.includes(marker)) {
				hits.push(`${file}: ${marker}`);
			}
		}
	}

	if (hits.length > 0) {
		throw new Error(
			`Practice word data leaked into the Worker bundle:\n${hits.map((hit) => `  ${hit}`).join("\n")}`,
		);
	}

	process.stdout.write(`Worker server modules (${files.length}) do not contain curated-10k.\n`);
}

if (import.meta.main) {
	runCli();
}
