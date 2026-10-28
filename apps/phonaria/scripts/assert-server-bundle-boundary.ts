import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Fail the Start build if the real curated-10k dictionary appears in the
 * Worker server bundle. The 10k list must stay a client-only chunk.
 * Markers cover the import specifier, the JSON source path, and two whole
 * pronunciations that only the 10k list contains. Matching whole quoted
 * pronunciations lets a Practice list hold a word that contains one
 * ("shoulder", SH OU1 L D ER0); bundled JSON may escape the quotes.
 */
const SERVER_MARKERS = [
	{ name: "phonetics-data/data/en/curated-10k", pattern: /phonetics-data\/data\/en\/curated-10k/ },
	{ name: "data/en/curated/top-10k.json", pattern: /data\/en\/curated\/top-10k\.json/ },
	{ name: "B AI1 P AE2 S", pattern: /"B AI1 P AE2 S\\?"/ },
	{ name: "H OU1 L D ER0", pattern: /"H OU1 L D ER0\\?"/ },
];

function listFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = join(directory, entry.name);
		return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
	});
}

export function assertServerBundleKeepsClientDataOut(directory: string): string[] {
	const files = listFiles(directory).filter((file) => /\.(m?js)$/i.test(file));
	if (files.length === 0) {
		throw new Error(`No JavaScript modules found under ${directory}.`);
	}
	const hits: string[] = [];
	for (const file of files) {
		const source = readFileSync(file, "utf8");
		for (const { name, pattern } of SERVER_MARKERS) {
			if (pattern.test(source)) {
				hits.push(`${file}: ${name}`);
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
