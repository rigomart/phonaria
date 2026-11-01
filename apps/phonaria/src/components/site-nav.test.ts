import { describe, expect, it } from "vitest";
import { getTools, navCurrent, soundsSections } from "./site-nav";

const ids = (practice: boolean, languageHistory: boolean) =>
	getTools({ practice, languageHistory }).map((tool) => tool.id);

const tool = (id: string) =>
	getTools({ practice: false, languageHistory: false }).find((candidate) => candidate.id === id);

describe("getTools", () => {
	it("shows History only when its flag is on", () => {
		expect(ids(false, true)).toContain("language-history");
		expect(ids(true, false)).not.toContain("language-history");
	});

	it("always shows Sounds and Minimal pairs, before Practice", () => {
		expect(ids(false, false)).toEqual(["transcription", "sounds", "minimal-pairs"]);
		expect(ids(true, true)).toEqual([
			"transcription",
			"sounds",
			"minimal-pairs",
			"practice",
			"language-history",
		]);
	});

	it("keeps the flags independent", () => {
		expect(ids(true, false)).toEqual(["transcription", "sounds", "minimal-pairs", "practice"]);
	});

	it("marks Transcription active on the homepage and its results page", () => {
		expect(tool("transcription")?.match("/")).toBe(true);
		expect(tool("transcription")?.match("/search")).toBe(true);
		expect(tool("transcription")?.match("/searchx")).toBe(false);
	});

	it("marks Sounds active on its index, every sound page and the IPA chart pages", () => {
		expect(tool("sounds")?.match("/sounds")).toBe(true);
		expect(tool("sounds")?.match("/sounds/th-thin")).toBe(true);
		expect(tool("sounds")?.match("/ipa-chart/consonants")).toBe(true);
		expect(tool("sounds")?.match("/ipa-chart/frequency")).toBe(true);
		expect(tool("sounds")?.match("/soundsx")).toBe(false);
		expect(tool("sounds")?.match("/ipa-chartx")).toBe(false);
	});

	it("keeps Sounds active on every page its menu links to", () => {
		for (const section of soundsSections) expect(tool("sounds")?.match(section.href)).toBe(true);
	});

	it("marks the page an item links to as the page, and the rest of its section as current", () => {
		const sounds = tool("sounds");
		if (!sounds) throw new Error("Sounds is always in the nav.");
		expect(navCurrent(sounds, "/sounds")).toBe("page");
		expect(navCurrent(sounds, "/sounds/th-thin")).toBe("true");
		expect(navCurrent(sounds, "/ipa-chart/vowels")).toBe("true");
		expect(navCurrent(sounds, "/minimal-pairs")).toBeUndefined();
	});

	it("marks Minimal pairs active on its index and every contrast page", () => {
		expect(tool("minimal-pairs")?.match("/minimal-pairs")).toBe(true);
		expect(tool("minimal-pairs")?.match("/minimal-pairs/th-s")).toBe(true);
		expect(tool("minimal-pairs")?.match("/minimal-pairsx")).toBe(false);
	});
});
