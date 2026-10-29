import { describe, expect, it } from "vitest";
import { getTools } from "./site-nav";

const ids = (practice: boolean, languageSpread: boolean, speech = false) =>
	getTools({ practice, languageSpread, speech }).map((tool) => tool.id);

describe("getTools", () => {
	it("shows Language Spread only when its flag is on", () => {
		expect(ids(false, true)).toContain("language-spread");
		expect(ids(true, false)).not.toContain("language-spread");
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
});
