import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const src = path.resolve(import.meta.dirname, "..");

describe("word-audio manifest boundary", () => {
	it("keeps the manifest out of the app's static imports, so it loads only when a button needs it", () => {
		const importers = readdirSync(src, { recursive: true, encoding: "utf8" })
			.filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
			.filter((file) =>
				/phonetics-data\/data\/en\/word-audio|word-audio\.json/.test(
					readFileSync(path.join(src, file), "utf8"),
				),
			);
		expect(importers).toEqual([]);
	});
});
