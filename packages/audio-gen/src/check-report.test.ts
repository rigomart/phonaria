import { describe, expect, it } from "vitest";
import { type ClipResult, parseMarks } from "./check-clips";
import { renderCheckReport } from "./check-report";

const clip = (file: string, failed: ClipResult["failed"] = []): ClipResult => ({
	file,
	word: file,
	ipa: "x",
	audio: {
		durationMs: 1826,
		speechMs: 500,
		leadingSilenceMs: 170,
		trailingSilenceMs: 1100,
		speechLevelDb: -20,
		peak: 0.5,
		clippedSamples: 0,
	},
	scoring: "scored",
	checks: Object.fromEntries(failed.map((name) => [name, { passed: false, detail: "low" }])),
	failed,
});

describe("parseMarks", () => {
	it("reads yes and no, and skips rows not marked", () => {
		const marks = parseMarks(
			"file\tword\taccepted\tnotes\na.ogg\ta\tyes\t\nb.ogg\tb\tN\tsaid bed\nc.ogg\tc\t\t\n",
		);
		expect([...marks]).toEqual([
			["a.ogg", { accepted: true, notes: "" }],
			["b.ogg", { accepted: false, notes: "said bed" }],
		]);
	});
	it("refuses other values", () => {
		expect(() => parseMarks("file\taccepted\na.ogg\tmaybe\n")).toThrow(/yes or no/);
	});
});

describe("renderCheckReport", () => {
	it("separates caught, missed and false alarms, and counts known-good flags", () => {
		const batch = {
			name: "probes",
			clips: [
				clip("caught", ["word-heard"]),
				clip("missed"),
				clip("alarm", ["edges"]),
				clip("fine"),
				clip("unmarked"),
			],
		};
		const marks = parseMarks(
			"file\taccepted\tnotes\ncaught\tno\twrong word\nmissed\tno\tflat vowel\nalarm\tyes\t\nfine\tyes\t\n",
		);
		const report = renderCheckReport({
			batch,
			marks,
			knownGood: [{ name: "published", clips: [clip("p1"), clip("p2", ["loudness"])] }],
		});
		expect(report).toContain("4 of 5 clips marked: 2 accepted, 2 rejected.");
		expect(report).toContain("| **any** | 1/2 (50.0%) | 1/2 (50.0%) |");
		expect(report).toMatch(/Missed[^#]*\| missed \| x \|  \| flat vowel \|/);
		expect(report).toMatch(/False alarms[^#]*\| alarm \| edges: low \|/);
		expect(report).toContain("| loudness | 0/5 (0.0%) | 1/2 (50.0%) |");
		expect(report).toContain("1 clips aren't marked yet.");
	});
});
