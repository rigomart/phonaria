import { describe, expect, it } from "vitest";
import { parseArguments } from "./cli";

describe("Azure generation command", () => {
	it("selects an audio format and rejects unsupported formats", () => {
		expect(parseArguments(["--format=ogg"])).toEqual({ audioFormat: "ogg" });
		expect(parseArguments(["--format=mp3"])).toEqual({ audioFormat: "mp3" });
		expect(() => parseArguments(["--format=unknown"])).toThrow(/format/);
	});
	it("accepts a relative speaking rate", () => {
		expect(parseArguments(["--rate=-10"])).toEqual({ ratePercent: -10 });
	});
	it("selects and plans a small batch from command arguments", () => {
		expect(
			parseArguments(["--dry-run", "--words=seat,seed", "--out=output/preview", "--rpm=30"]),
		).toEqual({
			dryRun: true,
			words: ["seat", "seed"],
			outputDir: "output/preview",
			requestsPerMinute: 30,
		});
	});
	it("requires an explicit saved directory for resume", () => {
		expect(() => parseArguments(["--resume"])).toThrow(/out/);
		expect(parseArguments(["--resume", "--out=output/preview"])).toEqual({
			resume: true,
			outputDir: "output/preview",
		});
	});
	it.each([
		"--out=",
		"--limit=",
		"--rpm=",
		"--limit=2.5",
		"--words=",
		"--takes=2",
	])("rejects malformed or obsolete options %s", (argument) => {
		expect(() => parseArguments([argument])).toThrow();
	});
});
