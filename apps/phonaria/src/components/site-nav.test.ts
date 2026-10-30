import { describe, expect, it } from "vitest";
import { getTools } from "./site-nav";

const ids = (practice: boolean, languageHistory: boolean, speech = false) =>
	getTools({ practice, languageHistory, speech }).map((tool) => tool.id);

describe("getTools", () => {
	it("shows History only when its flag is on", () => {
		expect(ids(false, true)).toContain("language-history");
		expect(ids(true, false)).not.toContain("language-history");
	});

	it("shows Minimal pairs, before Practice, only when speech is on", () => {
		expect(ids(true, false, true)).toEqual([
			"transcription",
			"ipa-chart",
			"minimal-pairs",
			"practice",
		]);
		expect(ids(false, false, true)).toContain("minimal-pairs");
		expect(ids(true, true, false)).not.toContain("minimal-pairs");
	});

	it("keeps the flags independent", () => {
		expect(ids(true, false)).toEqual(["transcription", "ipa-chart", "practice"]);
		expect(ids(false, false)).toEqual(["transcription", "ipa-chart"]);
	});

	it("marks Minimal pairs active on its index and every contrast page", () => {
		const tool = getTools({ practice: false, languageHistory: false, speech: true }).find(
			(candidate) => candidate.id === "minimal-pairs",
		);
		expect(tool?.match("/minimal-pairs")).toBe(true);
		expect(tool?.match("/minimal-pairs/th-s")).toBe(true);
		expect(tool?.match("/minimal-pairsx")).toBe(false);
	});
});
