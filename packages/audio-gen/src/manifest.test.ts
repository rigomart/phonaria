import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
	manifestFile,
	manifestFromPlan,
	mergeManifest,
	renderManifestJson,
	voiceFolderName,
	writeManifest,
} from "./manifest";

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
	it("merges completed batches with existing recordings", () => {
		const dir = mkdtempSync(path.join(tmpdir(), "phonaria-manifest-"));
		try {
			const target = path.join(dir, manifestFile("en-us"));
			mkdirSync(path.dirname(target), { recursive: true });
			writeFileSync(target, JSON.stringify({ voice: "jenny", words: ["seed", "seat"] }));
			writeFileSync(
				path.join(dir, "plan.json"),
				JSON.stringify(plan([sample("cause"), sample("seat")])),
			);
			expect(writeManifest(dir, dir)).toBe(target);
			const expected = renderManifestJson({ voice: "jenny", words: ["cause", "seat", "seed"] });
			expect(readFileSync(target, "utf8")).toBe(expected);
			writeFileSync(path.join(dir, "plan.json"), JSON.stringify(plan([sample("new", "planned")])));
			expect(() => writeManifest(dir, dir)).toThrow(/not generated/);
			expect(readFileSync(target, "utf8")).toBe(expected);
			writeFileSync(
				path.join(dir, "plan.json"),
				JSON.stringify({ ...plan([sample("cause")]), settings: { voiceId: "en-US-GuyNeural" } }),
			);
			writeManifest(dir, dir);
			expect(JSON.parse(readFileSync(target, "utf8"))).toEqual({
				voice: "jenny",
				words: ["cause", "seat", "seed"],
				voices: { guy: ["cause"] },
			});
			writeFileSync(
				path.join(dir, "plan.json"),
				JSON.stringify({ ...plan([sample("cause")]), settings: { voiceId: "en-US-AriaNeural" } }),
			);
			expect(() => writeManifest(dir, dir)).toThrow(/another voice/);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it("records a batch in another voice as that voice's words", () => {
		const existing = { voice: "jenny", words: ["sat", "saw", "seat"] };
		const guy = mergeManifest(existing, { voice: "guy", words: ["cause", "saw"] });
		expect(guy).toEqual({
			voice: "jenny",
			words: ["cause", "sat", "saw", "seat"],
			voices: { guy: ["cause", "saw"] },
		});
		expect(mergeManifest(guy, { voice: "guy", words: ["talk"] }).voices).toEqual({
			guy: ["cause", "saw", "talk"],
		});
		expect(mergeManifest(guy, { voice: "guy", words: ["saw"] })).toEqual(guy);
		expect(mergeManifest(guy, { voice: "jenny", words: ["saw", "seed"] })).toEqual({
			...guy,
			words: ["cause", "sat", "saw", "seat", "seed"],
		});
	});

	it("refuses a word another voice already plays", () => {
		const guy = { voice: "jenny", words: ["saw", "seat"], voices: { guy: ["saw"] } };
		expect(() => mergeManifest(guy, { voice: "aria", words: ["seat", "saw"] })).toThrow(
			/saw \(guy\)/,
		);
		expect(mergeManifest(guy, { voice: "aria", words: ["seat"] }).voices).toEqual({
			aria: ["seat"],
			guy: ["saw"],
		});
	});

	it("writes moved words after the default list, omitting an empty map", () => {
		const json = renderManifestJson({
			voice: "jenny",
			words: ["saw", "seat"],
			voices: { guy: ["saw"], aria: ["seat"] },
		});
		expect(Object.keys(JSON.parse(json))).toEqual(["voice", "words", "voices"]);
		expect(Object.keys(JSON.parse(json).voices)).toEqual(["aria", "guy"]);
		expect(renderManifestJson({ voice: "jenny", words: ["seat"], voices: {} })).not.toContain(
			"voices",
		);
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

	it("renders the manifest as JSON, one word per line", () => {
		const json = renderManifestJson({ voice: "jenny", words: ["seat", "seed"] });
		expect(JSON.parse(json)).toEqual({ voice: "jenny", words: ["seat", "seed"] });
		expect(json).toContain('\t\t"seat",\n\t\t"seed"\n');
		expect(manifestFile("en-us")).toBe("data/en/word-audio.json");
		expect(() => manifestFile("es-419")).toThrow(/es-419/);
	});
});
