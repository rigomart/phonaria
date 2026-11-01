import { describe, expect, it } from "vitest";
import { getTools } from "./site-nav";

const ids = (practice: boolean, languageHistory: boolean) =>
	getTools({ practice, languageHistory }).map((tool) => tool.id);

const tool = (id: string) =>
	getTools({ practice: false, languageHistory: false }).find((candidate) => candidate.id === id);

describe("getTools", () => {
	it("shows History only when its flag is on", () => {
		expect(ids(false, true)).toContain("language-history");
		expect(ids(true, false)).not.toContain("language-history");
	});

	it("always shows Sounds and Minimal pairs, after the IPA Chart and before Practice", () => {
		expect(ids(false, false)).toEqual(["transcription", "ipa-chart", "sounds", "minimal-pairs"]);
		expect(ids(true, true)).toEqual([
			"transcription",
			"ipa-chart",
			"sounds",
			"minimal-pairs",
			"practice",
			"language-history",
		]);
	});

	it("keeps the flags independent", () => {
		expect(ids(true, false)).toEqual([
			"transcription",
			"ipa-chart",
			"sounds",
			"minimal-pairs",
			"practice",
		]);
	});

	it("marks Sounds active on its index and every sound page", () => {
		expect(tool("sounds")?.match("/sounds")).toBe(true);
		expect(tool("sounds")?.match("/sounds/th-thin")).toBe(true);
		expect(tool("sounds")?.match("/soundsx")).toBe(false);
	});

	it("marks Minimal pairs active on its index and every contrast page", () => {
		expect(tool("minimal-pairs")?.match("/minimal-pairs")).toBe(true);
		expect(tool("minimal-pairs")?.match("/minimal-pairs/th-s")).toBe(true);
		expect(tool("minimal-pairs")?.match("/minimal-pairsx")).toBe(false);
	});
});
