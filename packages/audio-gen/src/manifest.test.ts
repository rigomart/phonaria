import { describe, expect, it } from "vitest";
import { manifestFromPlan, renderManifestModule, voiceFolderName } from "./manifest";

const sample = (word: string, status = "generated", extension = "ogg") => ({
	word,
	file: `audio/${word}.${extension}`,
	status,
	sha256: "abc",
});
const plan = (samples: ReturnType<typeof sample>[]) => ({
	targetAccent: "en-us",
	settings: { voiceId: "en-US-JennyNeural" },
	samples,
});

describe("word audio manifest", () => {
	it("derives the voice folder from the Azure voice id", () => {
		expect(voiceFolderName("en-US-JennyNeural")).toBe("jenny");
		expect(voiceFolderName("en-US-AriaNeural")).toBe("aria");
	});

	it("lists the sorted words of a fully generated plan", () => {
		expect(manifestFromPlan(plan([sample("seed"), sample("seat")]))).toEqual({
			voice: "jenny",
			words: ["seat", "seed"],
		});
	});

	it("refuses a plan with unfinished samples", () => {
		expect(() => manifestFromPlan(plan([sample("seat"), sample("seed", "planned")]))).toThrow(
			/seed/,
		);
		expect(() => manifestFromPlan(plan([sample("seat", "failed")]))).toThrow(/not generated/);
	});

	it("refuses a plan that is not Ogg", () => {
		expect(() => manifestFromPlan(plan([sample("seat", "generated", "mp3")]))).toThrow(/Ogg/);
	});

	it("refuses words that are not lowercase letters or repeat", () => {
		expect(() => manifestFromPlan(plan([sample("Seat")]))).toThrow(/lowercase/);
		expect(() => manifestFromPlan(plan([sample("seat"), sample("seat")]))).toThrow(/twice/);
	});

	it("renders a module naming the bucket layout", () => {
		const module = renderManifestModule("en-us", { voice: "jenny", words: ["seat"] });
		expect(module).toContain("export const EnglishWordAudio");
		expect(module).toContain('"seat",');
		expect(() => renderManifestModule("es-419", { voice: "x", words: [] })).toThrow(/es-419/);
	});
});
