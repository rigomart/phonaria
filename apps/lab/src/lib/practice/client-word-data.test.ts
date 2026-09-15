import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const labRoot = resolve(import.meta.dirname, "../../..");
const src = (relativePath: string) => readFileSync(resolve(labRoot, relativePath), "utf8");

describe("Practice word data loading", () => {
	it("loads curated-10k only through the retryable dynamic import", () => {
		const shared = src("src/lib/phoneme-lookup/shared.ts");
		expect(shared).toContain('import("@phonaria/phonetics-data/data/en/curated-10k")');
		expect(shared).not.toMatch(
			/import\s+\{[^}]*EnglishCuratedTop10k[^}]*\}\s+from\s+"@phonaria\/phonetics-data\/data\/en\/curated-10k"/,
		);
	});

	it("keeps Start Practice routes off the 10k module", () => {
		for (const file of [
			"src/routes/practice.tsx",
			"src/routes/practice.index.tsx",
			"src/routes/practice.$topic.tsx",
		]) {
			expect(src(file), file).not.toContain("curated-10k");
			expect(src(file), file).not.toContain("EnglishCuratedTop10k");
		}
	});

	it("loads the topic pool from the client session store", () => {
		const store = src("src/practice/_store/practice-session-store.ts");
		expect(store).toContain("loadWordPoolForTopic");
		expect(store).not.toContain("curated-10k");
		expect(src("src/lib/practice/word-pool.ts")).toContain("loadTier2()");
	});

	it("inlines FLAG_PRACTICE for the Start client bundle", () => {
		expect(src("vite.config.mts")).toContain("process.env.FLAG_PRACTICE");
		expect(src("vite.config.mts")).toContain("define-public-lab-flags");
	});
});
