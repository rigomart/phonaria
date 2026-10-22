import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { manifestFromPlan, renderManifestModule, voiceFolderName, writeManifest } from "./manifest";

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
	it("merges completed batches with existing recordings and refuses a different voice", () => {
		const dir = mkdtempSync(path.join(tmpdir(), "phonaria-manifest-"));
		try {
			mkdirSync(path.join(dir, "src/languages/en"), { recursive: true });
			writeFileSync(
				path.join(dir, "plan.json"),
				JSON.stringify(plan([sample("cause"), sample("seat")])),
			);
			const existing = { voice: "jenny", words: ["seed", "seat"] };
			const target = writeManifest(dir, dir, existing);
			const expected = renderManifestModule("en-us", {
				voice: "jenny",
				words: ["cause", "seat", "seed"],
			});
			expect(readFileSync(target, "utf8")).toBe(expected);
			expect(existing.words).toEqual(["seed", "seat"]);
			expect(() => writeManifest(dir, dir, { ...existing, voice: "aria" })).toThrow(/voice/i);
			expect(readFileSync(target, "utf8")).toBe(expected);
			writeFileSync(path.join(dir, "plan.json"), JSON.stringify(plan([sample("new", "planned")])));
			expect(() => writeManifest(dir, dir, existing)).toThrow(/not generated/);
			expect(readFileSync(target, "utf8")).toBe(expected);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
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

	it("refuses labelled forms until the manifest can list them", () => {
		const extra = {
			...sample("read"),
			form: { n: 2, label: "past tense" },
			file: "audio/read--2.ogg",
		};
		expect(() => manifestFromPlan(plan([sample("seat"), extra]))).toThrow(/labelled forms/);
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
