import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const labRoot = resolve(import.meta.dirname, "../../..");

function listFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = join(directory, entry.name);
		return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
	});
}

const chartRoots = [
	resolve(labRoot, "src/routes/ipa-chart"),
	resolve(labRoot, "src/components/ipa-chart"),
	resolve(labRoot, "src/lib/ipa-chart"),
	resolve(labRoot, "src/lib/ipa-chart-metadata.ts"),
];

const forbidden = [
	/@phonaria\/phonetics-data\/data\//,
	/curated-1k/,
	/curated-10k/,
	/@\/db\//,
	/TURSO_/,
	/@libsql\/client/,
	/drizzle-orm/,
	/@\/lib\/g2p/,
	/@\/lib\/g2p-client/,
	/@\/lib\/phoneme-lookup/,
	/@\/lib\/transcription/,
	/@\/lib\/practice/,
];

describe("IPA chart bundle boundary", () => {
	it("keeps chart routes and modules free of unrelated large data sets", () => {
		const files = chartRoots
			.flatMap((root) => {
				try {
					return listFiles(root);
				} catch {
					return [root];
				}
			})
			.filter((file) => !file.endsWith(".test.ts"));

		expect(files.length).toBeGreaterThan(5);

		for (const file of files) {
			const source = readFileSync(file, "utf8");
			for (const pattern of forbidden) {
				expect(source, `${file} must not match ${pattern}`).not.toMatch(pattern);
			}
		}
	});
});
