import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	manifestFile,
	manifestFromUploads,
	mergeManifests,
	renderManifestJson,
	type UploadedBatch,
	type UploadRecord,
	voiceFolderName,
	writeManifest,
} from "./manifest";

const sha = (slug: string) => `sha-of-${slug}`;
const sample = (word: string, form?: { n?: number; label: string }, extension = "ogg") => {
	const slug = form?.n ? `${word}--${form.n}` : word;
	return { word, ...(form ? { form } : {}), file: `audio/${slug}.${extension}`, sha256: sha(slug) };
};
type Sample = ReturnType<typeof sample>;
const plan = (samples: Sample[], voiceId = "en-US-JennyNeural") => ({
	targetAccent: "en-us",
	settings: { voiceId },
	samples,
});
/** An upload record verifying these slugs (word or word--n) of the Jenny folder. */
const record = (slugs: string[], verified = true): UploadRecord => ({
	entries: slugs.map((slug) => ({
		key: `audio/en-us/words/jenny/${slug}.ogg`,
		sha256: sha(slug),
		verified,
	})),
});
const batch = (samples: Sample[], records: UploadRecord[], dir = "batch"): UploadedBatch => ({
	dir,
	plan: plan(samples),
	records,
});

const read = [
	sample("read", { label: "present tense" }),
	sample("read", { n: 2, label: "past tense" }),
];

describe("manifest from upload records", () => {
	it("lists only the clips a record verifies, with the labels of their forms", () => {
		const either = [sample("either"), sample("either", { n: 2, label: "also said" })];
		const manifest = manifestFromUploads([
			batch(
				[sample("seed"), sample("seat"), sample("zebra"), ...read, ...either],
				[record(["seat", "seed", "read", "read--2", "either--2"]), record(["zebra"], false)],
			),
		]);
		expect(manifest).toEqual({
			accent: "en-us",
			voice: "jenny",
			words: ["read", "seat", "seed"],
			forms: {
				either: [{ n: 2, label: "also said" }],
				read: [{ label: "present tense" }, { n: 2, label: "past tense" }],
			},
		});
	});

	it("takes a batch's retakes from their own folders, and skips other batches' entries", () => {
		const [present, past] = read;
		const retake = { ...past, sha256: "sha-of-the-retake" };
		const run = {
			entries: [
				...record(["seat", "read"]).entries,
				{ key: "audio/en-us/words/jenny/read--2.ogg", sha256: retake.sha256, verified: true },
			],
		};
		const manifest = manifestFromUploads([
			batch([sample("seat"), present, past], [run], "top-1k"),
			batch([retake], [run], "top-1k-retakes"),
		]);
		expect(manifest.words).toEqual(["read", "seat"]);
		expect(manifest.forms?.read).toEqual([
			{ label: "present tense" },
			{ n: 2, label: "past tense" },
		]);
	});

	it("reads records from before #373, which have only entries", () => {
		const legacy = {
			bucket: "rigos-assets",
			startedAt: "2026-10-18T00:56:44.047Z",
			...record(["seat"]),
		};
		expect(manifestFromUploads([batch([sample("seat")], [legacy])]).words).toEqual(["seat"]);
	});

	it("refuses a folder without a verified upload record", () => {
		expect(() => manifestFromUploads([batch([sample("seat")], [])])).toThrow(/no upload record/);
		expect(() => manifestFromUploads([batch([sample("seat")], [record(["seat"], false)])])).toThrow(
			/verifies any/,
		);
		expect(() =>
			manifestFromUploads([
				batch([sample("seat")], [record(["seat"])], "batch"),
				batch([sample("seed")], [], "retakes"),
			]),
		).toThrow(/retakes has no upload record/);
	});

	it("refuses a batch that isn't Ogg, and batches of different voices", () => {
		expect(() =>
			manifestFromUploads([batch([sample("seat", undefined, "mp3")], [record(["seat"])])]),
		).toThrow(/Ogg/);
		expect(() =>
			manifestFromUploads([
				batch([sample("seat")], [record(["seat"])]),
				{ dir: "aria", plan: plan([sample("seed")], "en-US-AriaNeural"), records: [] },
			]),
		).toThrow(/voice/);
	});

	it("refuses words that are not lowercase letters", () => {
		expect(() => manifestFromUploads([batch([sample("Seat")], [record(["Seat"])])])).toThrow(
			/lowercase/,
		);
	});

	it("derives the voice folder from the Azure voice id", () => {
		expect(voiceFolderName("en-US-JennyNeural")).toBe("jenny");
		expect(voiceFolderName("en-US-AriaNeural")).toBe("aria");
	});
});

describe("merging into the manifest", () => {
	it("keeps every word and form, and refuses a form relabelled", () => {
		const existing = {
			voice: "jenny",
			words: ["read", "seat"],
			forms: { read: [{ label: "present tense" }] },
		};
		expect(
			mergeManifests(existing, {
				voice: "jenny",
				words: ["cause"],
				forms: { read: [{ n: 2, label: "past tense" }], either: [{ n: 2, label: "also said" }] },
			}),
		).toEqual({
			voice: "jenny",
			words: ["cause", "read", "seat"],
			forms: {
				either: [{ n: 2, label: "also said" }],
				read: [{ label: "present tense" }, { n: 2, label: "past tense" }],
			},
		});
		expect(() =>
			mergeManifests(existing, { voice: "jenny", words: [], forms: { read: [{ label: "noun" }] } }),
		).toThrow(/labelled both/);
		expect(() => mergeManifests(existing, { voice: "aria", words: [] })).toThrow(/voice/i);
	});

	it("renders one word per line and leaves out forms when no word has them", () => {
		const json = renderManifestJson({ voice: "jenny", words: ["seat", "seed"] });
		expect(JSON.parse(json)).toEqual({ voice: "jenny", words: ["seat", "seed"] });
		expect(json).toContain('\t\t"seat",\n\t\t"seed"\n');
		expect(json).not.toContain("forms");
		expect(manifestFile("en-us")).toBe("data/en/word-audio.json");
		expect(() => manifestFile("es-419")).toThrow(/es-419/);
	});
});

describe("writeManifest", () => {
	const temporary: string[] = [];
	afterEach(() => {
		for (const dir of temporary.splice(0)) rmSync(dir, { recursive: true, force: true });
	});
	const folder = (samples: Sample[], records: Record<string, unknown>) => {
		const dir = mkdtempSync(path.join(tmpdir(), "phonaria-manifest-"));
		temporary.push(dir);
		writeFileSync(path.join(dir, "plan.json"), JSON.stringify(plan(samples)));
		for (const [name, contents] of Object.entries(records))
			writeFileSync(path.join(dir, name), JSON.stringify(contents));
		return dir;
	};

	it("merges a batch and its retakes from their folders, and is idempotent", () => {
		const data = folder([], {});
		const target = path.join(data, manifestFile("en-us"));
		mkdirSync(path.dirname(target), { recursive: true });
		const original = renderManifestJson({ voice: "jenny", words: ["seat", "seed"] });
		writeFileSync(target, original);

		const published = folder([sample("seat")], { "upload-1-a.json": record(["seat"]) });
		writeManifest([published], data);
		expect(readFileSync(target, "utf8")).toBe(original);

		const top = folder([sample("cause"), ...read], {
			"upload-2-b.json": record(["cause", "read"]),
			"upload-2-b.json.tmp": "not a record",
			"plan.json.bak": "{}",
		});
		const retakes = folder([read[1]], { "upload-3-c.json": record(["read--2"]) });
		expect(writeManifest([top, retakes], data)).toBe(target);
		const expected = renderManifestJson({
			voice: "jenny",
			words: ["cause", "read", "seat", "seed"],
			forms: { read: [{ label: "present tense" }, { n: 2, label: "past tense" }] },
		});
		expect(readFileSync(target, "utf8")).toBe(expected);
		writeManifest([top, retakes], data);
		expect(readFileSync(target, "utf8")).toBe(expected);

		const unrecorded = folder([sample("zebra")], {});
		expect(() => writeManifest([unrecorded], data)).toThrow(/no upload record/);
		expect(readFileSync(target, "utf8")).toBe(expected);
	});
});
