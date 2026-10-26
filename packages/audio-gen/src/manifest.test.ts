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
const said: Record<string, string> = {
	read: "R I1 D",
	"read--2": "R E1 D",
	either: "I1 DH ER0",
	"either--2": "AI1 DH ER0",
};
const sample = (word: string, form?: { n?: number; label: string }, extension = "ogg") => {
	const slug = form?.n ? `${word}--${form.n}` : word;
	return {
		word,
		...(form ? { form } : {}),
		variant: said[slug] ?? "S I1 T",
		file: `audio/${slug}.${extension}`,
		sha256: sha(slug),
	};
};
const readForms = [
	{ label: "present tense", pronunciation: "R I1 D" },
	{ n: 2, label: "past tense", pronunciation: "R E1 D" },
];
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
	it("lists only the clips a record verifies, with the labels and pronunciations of their forms", () => {
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
				either: [{ n: 2, label: "also said", pronunciation: "AI1 DH ER0" }],
				read: readForms,
			},
		});
	});

	it("lists the unlabelled main clip of an also-said word with its pronunciation", () => {
		const either = [sample("either"), sample("either", { n: 2, label: "also said" })];
		expect(manifestFromUploads([batch(either, [record(["either", "either--2"])])]).forms).toEqual({
			either: [
				{ pronunciation: "I1 DH ER0" },
				{ n: 2, label: "also said", pronunciation: "AI1 DH ER0" },
			],
		});
	});

	it("refuses a main clip that went up with two pronunciations, in either batch order", () => {
		const either = [sample("either"), sample("either", { n: 2, label: "also said" })];
		const first = batch(either, [record(["either", "either--2"])], "top-10k");
		const retake = batch(
			[{ ...sample("either"), variant: "AI1 DH ER0", sha256: "sha-of-the-retake" }],
			[
				{
					entries: [
						{
							key: "audio/en-us/words/jenny/either.ogg",
							sha256: "sha-of-the-retake",
							verified: true,
						},
					],
				},
			],
			"top-10k-retakes",
		);
		expect(() => manifestFromUploads([first, retake])).toThrow(
			'either is said both "I1 DH ER0" and "AI1 DH ER0"',
		);
		expect(() => manifestFromUploads([retake, first])).toThrow(
			'either is said both "AI1 DH ER0" and "I1 DH ER0"',
		);
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
		expect(manifest.forms?.read).toEqual(readForms);
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
	it("keeps every word and form, and refuses a form relabelled or said another way", () => {
		const [present, past] = readForms;
		const alsoSaid = { n: 2, label: "also said", pronunciation: "AI1 DH ER0" };
		const existing = { voice: "jenny", words: ["read", "seat"], forms: { read: [present] } };
		expect(
			mergeManifests(existing, {
				voice: "jenny",
				words: ["cause"],
				forms: { read: [past], either: [alsoSaid] },
			}),
		).toEqual({
			voice: "jenny",
			words: ["cause", "read", "seat"],
			forms: { either: [alsoSaid], read: readForms },
		});
		const merged = (form: { label: string; pronunciation: string }) =>
			mergeManifests(existing, { voice: "jenny", words: [], forms: { read: [form] } });
		expect(() => merged({ ...present, label: "noun" })).toThrow(/labelled both/);
		expect(() => merged({ ...present, pronunciation: "R E1 D" })).toThrow(/said both/);
		expect(() => mergeManifests(existing, { voice: "aria", words: [] })).toThrow(/voice/i);
	});

	it("renders one line per initial letter and leaves out forms when no word has them", () => {
		const json = renderManifestJson({ voice: "jenny", words: ["bed", "seat", "seed"] });
		expect(JSON.parse(json)).toEqual({ voice: "jenny", words: ["bed", "seat", "seed"] });
		expect(json).toContain('\t\t"bed",\n\t\t"seat", "seed"\n');
		expect(json).not.toContain("forms");
		const withForms = renderManifestJson({
			voice: "jenny",
			words: ["read"],
			forms: { read: readForms },
		});
		expect(withForms).toContain(
			'\t\t"read": [{"label":"present tense","pronunciation":"R I1 D"},{"n":2,"label":"past tense","pronunciation":"R E1 D"}]\n',
		);
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
			forms: { read: readForms },
		});
		expect(readFileSync(target, "utf8")).toBe(expected);
		writeManifest([top, retakes], data);
		expect(readFileSync(target, "utf8")).toBe(expected);

		const unrecorded = folder([sample("zebra")], {});
		expect(() => writeManifest([unrecorded], data)).toThrow(/no upload record/);
		expect(readFileSync(target, "utf8")).toBe(expected);
	});
});
