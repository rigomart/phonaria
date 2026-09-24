import { describe, expect, it } from "vitest";
import { batchLookup, lookupWordClient } from "./index";

describe("lookupWordClient", () => {
	it("returns result for a tier1 word", async () => {
		const result = await lookupWordClient("the");
		expect(result).not.toBeNull();
		expect(result?.source).toBe("tier1");
		expect(result?.word).toBe("the");
		expect(result?.variants.length).toBeGreaterThan(0);
	});

	it("returns null for a completely unknown word", async () => {
		const result = await lookupWordClient("xyzzyplugh");
		expect(result).toBeNull();
	});

	it("handles case normalization", async () => {
		const result = await lookupWordClient("THE");
		expect(result).not.toBeNull();
		expect(result?.word).toBe("the");
	});

	it("returns null for empty string", async () => {
		const result = await lookupWordClient("");
		expect(result).toBeNull();
	});

	it("returns null for whitespace-only", async () => {
		const result = await lookupWordClient("   ");
		expect(result).toBeNull();
	});
});

describe("batchLookup", () => {
	it("finds known words and reports missing", async () => {
		const result = await batchLookup(["the", "xyzzyplugh"]);
		expect(result.found.has("the")).toBe(true);
		expect(result.missing).toContain("xyzzyplugh");
	});

	it("deduplicates words", async () => {
		const result = await batchLookup(["the", "the", "THE"]);
		expect(result.found.size).toBe(1);
		expect(result.missing).toHaveLength(0);
	});

	it("returns empty results for empty input", async () => {
		const result = await batchLookup([]);
		expect(result.found.size).toBe(0);
		expect(result.missing).toHaveLength(0);
	});

	it("skips empty strings in input", async () => {
		const result = await batchLookup(["", "  ", "the"]);
		expect(result.found.size).toBe(1);
		expect(result.missing).toHaveLength(0);
	});
});
