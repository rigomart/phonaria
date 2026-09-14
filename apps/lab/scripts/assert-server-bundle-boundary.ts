import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Fail the Start build if the real curated-10k dictionary appears in the
 * Worker server bundle. The 10k list must stay a client-only chunk.
 */
const SERVER_MARKERS = ["phonetics-data/data/en/curated-10k"];

function listFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = join(directory, entry.name);
		return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
	});
}

export function assertServerBundleKeepsClientDataOut(directory: string): string[] {
	const files = listFiles(directory).filter((file) => /\.(m?js)$/.test(file));
	const hits: string[] = [];
	for (const file of files) {
		const source = readFileSync(file, "utf8");
		for (const marker of SERVER_MARKERS) {
			if (source.includes(marker)) {
				hits.push(`${file}: ${marker}`);
			}
		}
	}
	return hits;
}

function runCli(): void {
	const directory = process.env.WORKER_BUNDLE_DIR ?? resolve(import.meta.dirname, "../dist/server");
	if (!statSync(directory, { throwIfNoEntry: false })?.isDirectory()) {
		throw new Error(`Worker server bundle directory not found: ${directory}`);
	}
	const hits = assertServerBundleKeepsClientDataOut(directory);
	if (hits.length > 0) {
		throw new Error(`Server bundle leaked client-only or secret data:\n${hits.join("\n")}`);
	}
}

if (import.meta.main) {
	runCli();
}
