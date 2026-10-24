import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { toBasePhonemeIds } from "@phonaria/phonetics-data";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CheckName, CheckResult } from "./clip-checks";
import { runGeneration } from "./generation";
import { pageSamples } from "./listening-page";
import type { TtsProvider } from "./providers/types";
import {
	adoptReviewSheet,
	type CheckedClip,
	listeningReasons,
	parseReviewSheet,
	recogniserHabit,
	renderReviewSheet,
	riskGroups,
	selectReviewSheet,
	writeReviewSheet,
} from "./review-sheet";

const dictionary: Record<string, string[]> = {
	wit: ["W IX1 T"],
	wet: ["W E1 T"],
	patients: ["P EI1 SH AX0 N T S"],
	patience: ["P EI1 SH AX0 N S"],
	tier: ["T IX1 R"],
	tear: ["T E1 R", "T IX1 R"],
	tries: ["T R AI1 Z"],
	trice: ["T R AI1 S"],
	rain: ["R EI1 N"],
	train: ["T R EI1 N"],
	eighth: ["EI1 T TH"],
	eight: ["EI1 T"],
	ad: ["AE1 D"],
	ed: ["E1 D"],
	box: ["B A1 K S"],
	bucks: ["B AH1 K S"],
	pool: ["P U1 L"],
	pull: ["P UX1 L"],
	feel: ["F I1 L"],
	fill: ["F IX1 L"],
	bought: ["B O1 T"],
	bot: ["B A1 T"],
	but: ["B AH1 T"],
};
const lookup = (word: string) => dictionary[word]?.map((variant) => toBasePhonemeIds(variant));
const target = (word: string) => ({ word, pronunciation: toBasePhonemeIds(dictionary[word][0]) });

describe("recogniser habits", () => {
	it.each([
		["no speech", "wit", [], "no speech"],
		["a word that sounds the same", "tier", ["tear"], "sounds the same"],
		["un-X heard as and X", "uncertain", ["and", "certain"], 'un- heard as "and"'],
		["a final /t/ dropped", "patients", ["patience"], "/t/ dropped"],
		["a /t/ added before the end", "patience", ["patients"], "/t/ added"],
		["/ɪ/ for /ɛ/", "wit", ["wet"], "/ɪ/ heard as /ɛ/, a pair it blurs"],
		["/æ/ for /ɛ/", "ad", ["ed"], "/æ/ heard as /ɛ/, a pair it blurs"],
		["/ɑ/ for /ʌ/", "box", ["bucks"], "/ɑ/ heard as /ʌ/, a pair it blurs"],
		["/u/ for /ʊ/", "pool", ["pull"], "/u/ heard as /ʊ/, a pair it blurs"],
		["/i/ for /ɪ/", "feel", ["fill"], "/i/ heard as /ɪ/, a pair it blurs"],
		["/ɔ/ for /ɑ/", "bought", ["bot"], "/ɔ/ heard as /ɑ/, a pair it blurs"],
		["/ɔ/ for /ʌ/", "bought", ["but"], "/ɔ/ heard as /ʌ/, a pair it blurs"],
	])("counts %s as a habit", (_name, word, heard, habit) => {
		const clip = word === "uncertain" ? { word, pronunciation: [] } : target(word);
		expect(recogniserHabit(heard, clip, lookup)).toBe(habit);
	});
	it.each([
		["another consonant", "tries", ["trice"]],
		["a /t/ added at the start", "rain", ["train"]],
		["another sound dropped", "eighth", ["eight"]],
		["a word the dictionary lacks", "wit", ["chiraq"]],
		["two words that aren't un-X", "wit", ["a", "wit"]],
	])("counts %s as a different word", (_name, word, heard) => {
		expect(recogniserHabit(heard, target(word), lookup)).toBeUndefined();
	});
});

type Sample = Parameters<typeof listeningReasons>[0];
const sample = (word: string, extra: Partial<Sample> = {}): Sample => ({
	file: `audio/${word}.ogg`,
	word,
	ipa: word,
	variant: dictionary[word]?.[0] ?? "S IX1 T",
	...extra,
});
const passed: CheckResult = { passed: true, detail: "fine" };
const clip = (word: string, failed: Partial<Record<CheckName, string>> = {}): CheckedClip => ({
	file: `audio/${word}.ogg`,
	scoring: "scored",
	checks: Object.fromEntries(
		(["word-heard", "no-swapped-sound", "word-accuracy", "duration"] as const).map((name) => [
			name,
			failed[name] ? { passed: false, detail: failed[name] } : passed,
		]),
	),
	failed: Object.keys(failed) as CheckName[],
});

describe("the listening rule", () => {
	it("lists a clip whose word heard and swapped sound checks both failed", () => {
		const reasons = listeningReasons(
			sample("wit"),
			clip("wit", { "word-heard": 'heard "wet" at 0.9', "no-swapped-sound": "/ɪ/ heard as /ɛ/" }),
			lookup,
		);
		expect(reasons).toEqual([
			{
				reason: "word heard and no swapped sound both failed",
				detail: 'heard "wet" at 0.9; /ɪ/ heard as /ɛ/',
			},
		]);
	});
	it("lists a clip heard as another word, but not one heard by habit", () => {
		expect(
			listeningReasons(
				sample("tries"),
				clip("tries", { "word-heard": 'heard "trice" at 0.8' }),
				lookup,
			),
		).toEqual([{ reason: "heard another word", detail: 'heard "trice" at 0.8' }]);
		expect(
			listeningReasons(sample("wit"), clip("wit", { "word-heard": 'heard "wet" at 0.8' }), lookup),
		).toEqual([]);
		expect(
			listeningReasons(sample("wit"), clip("wit", { "word-heard": "no speech" }), lookup),
		).toEqual([]);
	});
	it("lists failed audio checks, second forms and unscored clips; not word accuracy alone", () => {
		expect(
			listeningReasons(sample("wit"), clip("wit", { duration: "2× the expected" }), lookup),
		).toEqual([{ reason: "audio check failed", detail: "duration: 2× the expected" }]);
		expect(
			listeningReasons(sample("wit", { form: { n: 2, label: "also said" } }), clip("wit"), lookup),
		).toEqual([{ reason: "second form", detail: "also said" }]);
		expect(
			listeningReasons(sample("wit"), { ...clip("wit"), scoring: "uncached" }, lookup),
		).toEqual([{ reason: "Azure checks didn't run", detail: "uncached" }]);
		expect(
			listeningReasons(sample("wit"), clip("wit", { "word-accuracy": "0.5" }), lookup),
		).toEqual([]);
	});
});

describe("risk groups", () => {
	const groupsOf = (variant: string, extra: Partial<Sample> = {}) =>
		riskGroups.filter(({ has }) => has(sample("x", { variant, ...extra }))).map(({ name }) => name);
	it("places a clip in each group its plan entry shows", () => {
		expect(groupsOf("B E1 D")).toEqual(["vowel pair /ɛ/–/æ/"]);
		expect(groupsOf("F ER1 S T")).toEqual(["r-coloured vowel"]);
		expect(groupsOf("K O1 R T")).toEqual(["r-coloured vowel"]);
		expect(groupsOf("D EI1 T AX0", { syllables: "rule" })).toEqual([
			"syllables split by the rule",
			"/t/ that taps",
		]);
		expect(
			groupsOf("DH AH1", { pronunciationChoice: { source: "rule", reason: "first stressed" } }),
		).toEqual(["pronunciation picked by the rule", "vowel pair /ɑ/–/ʌ/"]);
	});
});

describe("the review sheet", () => {
	const vowels = ["IX", "E", "AE", "A", "AH", "U", "UX", "I", "O", "ER", "EI", "OU"];
	const batch = Array.from({ length: 600 }, (_, index) => {
		const word = `w${String(index).padStart(3, "0")}`;
		return sample(word, {
			variant: `S ${vowels[index % vowels.length]}1 T${index % 7 === 0 ? " AX0" : ""}`,
			syllables: index % 7 === 0 ? "rule" : "one syllable",
			...(index % 11 === 0
				? { pronunciationChoice: { source: "rule", reason: "first form" } }
				: {}),
			...(index % 50 === 0 ? { form: { n: 2, label: "also said" } } : {}),
		});
	});
	const clips = batch.map(({ word }, index) =>
		clip(
			word,
			index % 13 === 0
				? { "word-heard": 'heard "chiraq" at 0.5' }
				: index % 17 === 0
					? { "word-accuracy": "0.6" }
					: {},
		),
	);
	const draw = (seed: number) =>
		selectReviewSheet({ samples: batch, clips, seed, pronunciationsOf: lookup });

	it("draws the same sheet for a seed and another for another seed", () => {
		expect(draw(358)).toEqual(draw(358));
		expect(draw(358)).not.toEqual(draw(359));
	});
	it("lists every clip the rule picks, 20 flags it lets through, 15 per risk group and 150 passed clips", () => {
		const rows = draw(358);
		const count = (reason: string) => rows.filter((row) => row.reason === reason).length;
		const ruled = batch.filter((_, index) => index % 13 === 0 || index % 50 === 0);
		expect(rows.slice(0, ruled.length).map(({ file }) => file)).toEqual(
			ruled.map(({ file }) => file),
		);
		expect(count("check sample of flags the rule lets through")).toBe(20);
		for (const { name } of riskGroups) expect(count(`risk group (${name})`)).toBe(15);
		expect(count("random sample of passed clips")).toBe(150);
		expect(new Set(rows.map(({ file }) => file)).size).toBe(rows.length);
		const letThrough = new Set(
			batch.filter((_, index) => index % 13 && index % 17 === 0).map(({ file }) => file),
		);
		for (const row of rows.filter(({ reason }) => reason.startsWith("check sample")))
			expect(letThrough.has(row.file)).toBe(true);
	});
	it("refuses a batch checks.json doesn't fully cover", () => {
		expect(() =>
			selectReviewSheet({
				samples: batch,
				clips: clips.slice(1),
				seed: 1,
				pronunciationsOf: lookup,
			}),
		).toThrow(/checks\.json has no results for 1 clips \(audio\/w000\.ogg\)/);
	});
	it("writes file, word, form, ipa, reason and detail, and reads them back", () => {
		const rows = draw(358);
		const tsv = renderReviewSheet(rows);
		expect(tsv.split("\n")[0]).toBe("file\tword\tform\tipa\treason\tdetail");
		expect(tsv.split("\n")[1]).toBe(
			'audio/w000.ogg\tw000\talso said\tw000\tsecond form; heard another word\talso said; heard "chiraq" at 0.5',
		);
		expect(parseReviewSheet(tsv)).toEqual(rows);
	});
	it("adopts a hand-built list, keeping its reasons", () => {
		const samples = batch.slice(0, 3).map((entry) => ({ ...entry, status: "generated" as const }));
		expect(
			adoptReviewSheet(
				"file\tword\tipa\tpicked_for\naudio/w001.ogg\tw001\tx\tflagged by a check\n",
				"listen-sample.tsv",
				samples,
			),
		).toEqual([
			{
				file: "audio/w001.ogg",
				word: "w001",
				form: "",
				ipa: "w001",
				reason: "flagged by a check",
				detail: "adopted from listen-sample.tsv",
			},
		]);
		expect(() =>
			adoptReviewSheet("file\treason\naudio/other.ogg\tx\n", "list.tsv", samples),
		).toThrow(/list\.tsv lists audio\/other\.ogg, which the plan has not generated/);
	});
	it("gives the listening page the sheet's clips and reasons, or the whole plan without one", () => {
		const plan = batch.slice(0, 3).map((entry) => ({ ...entry, status: "generated" as const }));
		const rows = [{ ...parseReviewSheet(renderReviewSheet(draw(1)))[0], file: "audio/w002.ogg" }];
		expect(pageSamples(plan, undefined)).toEqual(plan);
		expect(pageSamples(plan, rows)).toEqual([{ ...plan[2], pickedFor: [rows[0].reason] }]);
	});
});

describe("writing a batch's sheet", () => {
	const directories: string[] = [];
	afterEach(async () => {
		vi.restoreAllMocks();
		await Promise.all(
			directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
		);
	});
	const provider: TtsProvider = {
		async synthesize(inputs) {
			return inputs.map(({ id }) => ({ id, audio: Buffer.from(id) }));
		},
	};
	async function checkedBatch() {
		const outputDir = await mkdtemp(path.join(os.tmpdir(), "phonaria-sheet-test-"));
		directories.push(outputDir);
		vi.spyOn(console, "log").mockImplementation(() => {});
		await runGeneration({
			outputDir,
			words: ["seat", "seed"],
			audioFormat: "ogg",
			voiceId: "en-US-JennyNeural",
			provider,
			wait: async () => {},
		});
		const planFile = path.join(outputDir, "plan.json");
		const plan = JSON.parse(await readFile(planFile, "utf8"));
		await writeFile(
			path.join(outputDir, "checks.json"),
			JSON.stringify({ clips: [clip("seat"), clip("seed")] }),
		);
		return { outputDir, plan, planFile };
	}

	it("needs checks.json", async () => {
		const { outputDir } = await checkedBatch();
		await rm(path.join(outputDir, "checks.json"));
		await expect(writeReviewSheet(outputDir, { pronunciationsOf: lookup })).rejects.toThrow(
			/no checks\.json; run check/,
		);
	});
	it("leaves out samples the current code plans differently, and never replaces a sheet without force", async () => {
		const { outputDir, plan, planFile } = await checkedBatch();
		plan.samples[0].input.text = "changed";
		await writeFile(planFile, JSON.stringify(plan));
		const { rows } = await writeReviewSheet(outputDir, { pronunciationsOf: lookup });
		expect(rows.map(({ file }) => file)).toEqual(["audio/seed.ogg"]);
		await expect(writeReviewSheet(outputDir, { pronunciationsOf: lookup })).rejects.toThrow(
			/sample\.tsv exists.*--force/,
		);
		const list = path.join(outputDir, "listen-sample.tsv");
		await writeFile(list, "file\treason\naudio/seat.ogg\tby hand\n");
		const adopted = await writeReviewSheet(outputDir, {
			adopt: list,
			force: true,
			pronunciationsOf: lookup,
		});
		expect(adopted.rows.map(({ file, reason }) => [file, reason])).toEqual([
			["audio/seat.ogg", "by hand"],
		]);
		expect(await readFile(path.join(outputDir, "sample.tsv"), "utf8")).toContain("by hand");
	});
});
