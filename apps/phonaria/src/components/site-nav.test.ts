import { describe, expect, it } from "vitest";
import { getTools } from "./site-nav";

const ids = (practice: boolean, languageSpread: boolean) =>
	getTools({ practice, languageSpread }).map((tool) => tool.id);

describe("getTools", () => {
	it("shows Language Spread only when its flag is on", () => {
		expect(ids(false, true)).toContain("language-spread");
		expect(ids(true, false)).not.toContain("language-spread");
	});

	it("keeps the flags independent", () => {
		expect(ids(true, false)).toEqual(["transcription", "ipa-chart", "practice"]);
		expect(ids(false, false)).toEqual(["transcription", "ipa-chart"]);
	});
});
