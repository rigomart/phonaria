import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	getIpaForPhonemeId,
	isVowelPhoneme,
	type PhonemeSymbolId,
	toBasePhonemeIds,
} from "@phonaria/phonetics-data";
import type { PronunciationLookup } from "@phonaria/pronunciation";
import type { ClipResult } from "./check-clips";
import { type CheckName, heardWords, tapped, transcriptReadings } from "./clip-checks";
import { compareWithCurrentCode, type Plan, type Sample } from "./generation";
import { findAzureAudioFormat } from "./providers/azure";
import { closeTapSyllables, splitSyllablesByRule } from "./word-inputs";

/** The clips of a batch the dev listens to, each with why it was chosen. */
export const REVIEW_SHEET_FILE = "sample.tsv";
export const REVIEW_SHEET_COLUMNS = ["file", "word", "form", "ipa", "reason", "detail"] as const;

export type SheetRow = {
	readonly file: string;
	readonly word: string;
	readonly form: string;
	readonly ipa: string;
	/** Why the clip is on the sheet. The listening page shows it. */
	readonly reason: string;
	/** The check results behind the reason. The listening page leaves it out. */
	readonly detail: string;
};

export type CheckedClip = Pick<ClipResult, "file" | "scoring" | "checks" | "failed">;
type SheetSample = Pick<
	Sample,
	"file" | "word" | "form" | "ipa" | "variant" | "syllables" | "pronunciationChoice"
>;

export const SHEET_SIZES = { checkSample: 20, perRiskGroup: 15, random: 150 };

const AUDIO_CHECKS: readonly CheckName[] = ["duration", "edges", "loudness", "clipping"];

/** Vowels the recogniser mixes up on clips that sound right (#358), either way round. */
const BLURRED_VOWELS: readonly (readonly [PhonemeSymbolId, PhonemeSymbolId])[] = [
	["IX", "E"],
	["AE", "E"],
	["A", "AH"],
	["U", "UX"],
	["I", "IX"],
	["O", "A"],
	["O", "AH"],
];

type Edit =
	| { type: "swap"; from: PhonemeSymbolId; to: PhonemeSymbolId }
	| { type: "added" | "dropped"; sound: PhonemeSymbolId; at: number };

/** The one sound that turns `target` into `heard`, if one is all it takes. */
function singleEdit(target: readonly string[], heard: readonly string[]): Edit | undefined {
	if (target.length === heard.length) {
		const at = target.flatMap((id, index) => (id === heard[index] ? [] : [index]));
		return at.length === 1
			? {
					type: "swap",
					from: target[at[0]] as PhonemeSymbolId,
					to: heard[at[0]] as PhonemeSymbolId,
				}
			: undefined;
	}
	const [longer, shorter, type] =
		heard.length === target.length + 1
			? [heard, target, "added" as const]
			: target.length === heard.length + 1
				? [target, heard, "dropped" as const]
				: [];
	if (!longer || !shorter || !type) return undefined;
	const at = longer.findIndex((_, index) =>
		longer.every(
			(id, other) => other === index || id === shorter[other < index ? other : other - 1],
		),
	);
	return at === -1 ? undefined : { type, sound: longer[at] as PhonemeSymbolId, at };
}

/**
 * Why recognition hearing these words is a habit of the recogniser rather than a sign of a
 * bad clip, as the dev's marks on the #358 batches showed: no speech, a word that sounds the
 * same in the full dictionary, *un-X* split off as "and X", one vowel swapped within a pair
 * it blurs, or a /t/ or /d/ added or dropped after the first sound (*patients* ~ *patience*).
 * Undefined when it heard a genuinely different word.
 */
export function recogniserHabit(
	heard: readonly string[],
	target: { readonly word: string; readonly pronunciation: readonly PhonemeSymbolId[] },
	pronunciationsOf: PronunciationLookup,
): string | undefined {
	if (!heard.length) return "no speech";
	if (
		target.word.startsWith("un") &&
		heard.length === 2 &&
		["and", "a", "an", "in"].includes(heard[0]) &&
		heard[1] === target.word.slice(2)
	)
		return `un- heard as "${heard[0]}"`;
	const goal = tapped(target.pronunciation);
	const readings = (transcriptReadings(heard, pronunciationsOf) ?? []).map(tapped);
	if (readings.some((reading) => reading.join(" ") === goal.join(" "))) return "sounds the same";
	for (const reading of readings) {
		const edit = singleEdit(goal, reading);
		if (
			edit?.type === "swap" &&
			BLURRED_VOWELS.some(
				([a, b]) => (edit.from === a && edit.to === b) || (edit.from === b && edit.to === a),
			)
		)
			return `/${getIpaForPhonemeId(edit.from)}/ heard as /${getIpaForPhonemeId(edit.to)}/, a pair it blurs`;
		if (edit && edit.type !== "swap" && edit.at > 0 && (edit.sound === "T" || edit.sound === "D"))
			return `/${edit.sound === "T" ? "t" : "d"}/ ${edit.type}`;
	}
	return undefined;
}

type Reason = { readonly reason: string; readonly detail: string };

/** Why a checked clip must be heard, by the rule calibrated on the dev's #358 marks; empty when it needn't. */
export function listeningReasons(
	sample: SheetSample,
	clip: CheckedClip,
	pronunciationsOf: PronunciationLookup,
): Reason[] {
	const reasons: Reason[] = [];
	if (sample.form?.n !== undefined)
		reasons.push({ reason: "second form", detail: sample.form.label });
	if (clip.scoring !== "scored")
		reasons.push({ reason: "Azure checks didn't run", detail: clip.scoring });
	const audio = AUDIO_CHECKS.filter((name) => clip.failed.includes(name));
	if (audio.length)
		reasons.push({
			reason: "audio check failed",
			detail: audio.map((name) => `${name}: ${clip.checks[name]?.detail}`).join("; "),
		});
	const wordHeard = clip.checks["word-heard"];
	if (wordHeard && !wordHeard.passed) {
		const swapped = clip.checks["no-swapped-sound"];
		if (swapped && !swapped.passed)
			reasons.push({
				reason: "word heard and no swapped sound both failed",
				detail: `${wordHeard.detail}; ${swapped.detail}`,
			});
		else if (!habitOf(sample, wordHeard, pronunciationsOf))
			reasons.push({ reason: "heard another word", detail: wordHeard.detail });
	}
	return reasons;
}

const habitOf = (
	sample: SheetSample,
	wordHeard: NonNullable<CheckedClip["checks"]["word-heard"]>,
	pronunciationsOf: PronunciationLookup,
) =>
	recogniserHabit(
		heardWords(wordHeard),
		{ word: sample.word, pronunciation: toBasePhonemeIds(sample.variant) },
		pronunciationsOf,
	);

const hasEither =
	(a: PhonemeSymbolId, b: PhonemeSymbolId) =>
	({ variant }: SheetSample) =>
		toBasePhonemeIds(variant).some((id) => id === a || id === b);

/** Clips that pass every check but carry a risk the checks can't hear (#353). */
export const riskGroups: readonly { name: string; has: (sample: SheetSample) => boolean }[] = [
	{ name: "syllables split by the rule", has: ({ syllables }) => syllables === "rule" },
	{
		name: "pronunciation picked by the rule",
		has: ({ pronunciationChoice }) => pronunciationChoice?.source === "rule",
	},
	{ name: "vowel pair /ɛ/–/æ/", has: hasEither("E", "AE") },
	{ name: "vowel pair /ɑ/–/ʌ/", has: hasEither("A", "AH") },
	{ name: "vowel pair /u/–/ʊ/", has: hasEither("U", "UX") },
	{ name: "vowel pair /i/–/ɪ/", has: hasEither("I", "IX") },
	{
		name: "r-coloured vowel",
		has: ({ variant }) =>
			toBasePhonemeIds(variant).some(
				(id, index, ids) => id === "ER" || (isVowelPhoneme(id) && ids[index + 1] === "R"),
			),
	},
	{
		name: "/t/ that taps",
		has: ({ syllables, variant }) => {
			if (syllables !== "rule") return false;
			const split = splitSyllablesByRule(variant);
			return closeTapSyllables(split).join(".") !== split.join(".");
		},
	},
];

/** A small seeded generator (mulberry32), so a seed always draws the same clips. */
function seeded(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let value = state;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

function draw<T extends { file: string }>(
	items: readonly T[],
	count: number,
	random: () => number,
) {
	const pool = [...items].sort((a, b) => a.file.localeCompare(b.file));
	for (let index = 0; index < Math.min(count, pool.length); index++) {
		const other = index + Math.floor(random() * (pool.length - index));
		[pool[index], pool[other]] = [pool[other], pool[index]];
	}
	return pool.slice(0, count);
}

/**
 * The sheet for a checked batch: every clip the rule sends to listening, a check sample of
 * the flagged clips it lets through, a sample per risk group and a random sample of the
 * clips that passed. The same seed always gives the same sheet.
 */
export function selectReviewSheet({
	samples,
	clips,
	seed,
	pronunciationsOf,
	sizes = SHEET_SIZES,
}: {
	samples: readonly SheetSample[];
	clips: readonly CheckedClip[];
	seed: number;
	pronunciationsOf: PronunciationLookup;
	sizes?: typeof SHEET_SIZES;
}): SheetRow[] {
	const byFile = new Map(clips.map((clip) => [clip.file, clip]));
	const unchecked = samples.filter(({ file }) => !byFile.has(file));
	if (unchecked.length)
		throw new Error(
			`checks.json has no results for ${unchecked.length} clips (${unchecked
				.slice(0, 5)
				.map(({ file }) => file)
				.join(", ")}); run check again`,
		);
	const row = (sample: SheetSample, reasons: readonly Reason[]): SheetRow => ({
		file: sample.file,
		word: sample.word,
		form: sample.form?.label ?? "",
		ipa: sample.ipa,
		reason: reasons.map(({ reason }) => reason).join("; "),
		detail: reasons
			.map(({ detail }) => detail)
			.filter(Boolean)
			.join("; "),
	});
	const random = seeded(seed);
	const rows: SheetRow[] = [];
	const passed: SheetSample[] = [];
	const letThrough: SheetSample[] = [];
	for (const sample of samples) {
		const clip = byFile.get(sample.file) as CheckedClip;
		const reasons = listeningReasons(sample, clip, pronunciationsOf);
		if (reasons.length) rows.push(row(sample, reasons));
		else (clip.failed.length ? letThrough : passed).push(sample);
	}
	for (const sample of draw(letThrough, sizes.checkSample, random)) {
		const clip = byFile.get(sample.file) as CheckedClip;
		const wordHeard = clip.checks["word-heard"];
		const habit = wordHeard && !wordHeard.passed && habitOf(sample, wordHeard, pronunciationsOf);
		rows.push(
			row(sample, [
				{
					reason: "check sample of flags the rule lets through",
					detail: `${clip.failed.join(" ")} failed${wordHeard ? `; ${wordHeard.detail}` : ""}${habit ? ` (${habit})` : ""}`,
				},
			]),
		);
	}
	const unpicked = new Set(passed);
	for (const group of riskGroups) {
		const members = passed.filter((sample) => unpicked.has(sample) && group.has(sample));
		for (const sample of draw(members, sizes.perRiskGroup, random)) {
			unpicked.delete(sample);
			rows.push(row(sample, [{ reason: `risk group (${group.name})`, detail: "" }]));
		}
	}
	for (const sample of draw([...unpicked], sizes.random, random))
		rows.push(row(sample, [{ reason: "random sample of passed clips", detail: "" }]));
	return rows;
}

const cell = (value: string) => value.replace(/[\t\r\n]/g, " ");

export function renderReviewSheet(rows: readonly SheetRow[]): string {
	const lines = rows.map((row) =>
		REVIEW_SHEET_COLUMNS.map((column) => cell(row[column])).join("\t"),
	);
	return `${[REVIEW_SHEET_COLUMNS.join("\t"), ...lines].join("\n")}\n`;
}

/** Rows of a TSV list by its header; `file` is required. */
function readList(tsv: string, name: string): Record<string, string>[] {
	const [header, ...lines] = tsv.split(/\r?\n/).filter((line) => line.trim());
	const columns = (header ?? "").split("\t");
	if (!columns.includes("file")) throw new Error(`${name} needs a file column`);
	return lines.map((line) => {
		const cells = line.split("\t");
		return Object.fromEntries(columns.map((column, index) => [column, cells[index] ?? ""]));
	});
}

export function parseReviewSheet(tsv: string): SheetRow[] {
	const rows = readList(tsv, REVIEW_SHEET_FILE);
	return rows.map((row) => ({
		file: row.file,
		word: row.word ?? "",
		form: row.form ?? "",
		ipa: row.ipa ?? "",
		reason: row.reason ?? "",
		detail: row.detail ?? "",
	}));
}

/**
 * Takes a hand-built listening list as the sheet: one row per listed clip, keeping its
 * reason from a `reason` or `picked_for` column.
 */
export function adoptReviewSheet(
	listTsv: string,
	listName: string,
	samples: readonly Pick<Sample, "file" | "word" | "form" | "ipa" | "status">[],
): SheetRow[] {
	const byFile = new Map(samples.map((sample) => [sample.file, sample]));
	const seen = new Set<string>();
	return readList(listTsv, listName).map((row) => {
		const sample = byFile.get(row.file);
		if (!sample || sample.status !== "generated")
			throw new Error(`${listName} lists ${row.file}, which the plan has not generated`);
		if (seen.has(row.file)) throw new Error(`${listName} lists ${row.file} twice`);
		seen.add(row.file);
		return {
			file: sample.file,
			word: sample.word,
			form: sample.form?.label ?? "",
			ipa: sample.ipa,
			reason: row.reason || row.picked_for || "listed",
			detail: `adopted from ${listName}`,
		};
	});
}

export type SheetOptions = {
	readonly seed?: number;
	/** A hand-built list to take as the sheet instead of drawing one. */
	readonly adopt?: string;
	/** Replace an existing sheet. */
	readonly force?: boolean;
	readonly pronunciationsOf: PronunciationLookup;
};

/** What a sheet was drawn from, saved beside it as `sample.json`. */
export type SheetBinding = {
	/** How the rows were chosen: drawn with a seed, or adopted from a list. */
	readonly origin: string;
	/** SHA-256 of `plan.json`'s samples, statuses and checksums included. */
	readonly planSamples: string;
	/** SHA-256 of `checks.json`'s clips. */
	readonly checks: string;
};

export const SHEET_BINDING_FILE = "sample.json";

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export function sheetBinding(
	origin: string,
	planSamples: readonly unknown[],
	checks: readonly unknown[],
): SheetBinding {
	return { origin, planSamples: hash(planSamples), checks: hash(checks) };
}

/**
 * Refuses a sheet drawn or adopted from another `plan.json` or `checks.json` than the
 * batch has now: the clips that changed since were never considered for listening.
 */
export async function assertSheetIsCurrent(
	dir: string,
	planSamples: readonly unknown[],
	checks: readonly unknown[],
): Promise<void> {
	let saved: SheetBinding;
	try {
		saved = JSON.parse(await readFile(path.join(dir, SHEET_BINDING_FILE), "utf8"));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
		throw new Error(
			`${dir} has no ${SHEET_BINDING_FILE} to show what ${REVIEW_SHEET_FILE} was drawn from; run sample --force (or sample --adopt --force)`,
		);
	}
	const now = sheetBinding(saved.origin, planSamples, checks);
	const changed = [
		...(now.planSamples !== saved.planSamples ? ["plan.json"] : []),
		...(now.checks !== saved.checks ? ["checks.json"] : []),
	];
	if (changed.length)
		throw new Error(
			`${dir}: ${changed.join(" and ")} changed since ${REVIEW_SHEET_FILE} was ${saved.origin}; draw it again with sample --force (or adopt the list again) and mark any new clips`,
		);
}

/**
 * Writes the batch's `sample.tsv`, drawn from `plan.json` and `checks.json` or adopted from
 * a list, and `sample.json`, which records what it was drawn from. Every sample must be
 * generated. Samples the current code would plan differently are left out of a drawn
 * sheet, since upload leaves them out too. Never replaces a sheet without `force`.
 */
export async function writeReviewSheet(dir: string, options: SheetOptions) {
	const plan = JSON.parse(await readFile(path.join(dir, "plan.json"), "utf8")) as Plan;
	const unfinished = plan.samples.filter(({ status }) => status !== "generated");
	if (unfinished.length)
		throw new Error(
			`${unfinished.length} samples aren't generated yet (${unfinished
				.slice(0, 5)
				.map(({ file }) => file)
				.join(", ")}); finish the batch and check it before drawing its sheet`,
		);
	const checks = await readChecks(dir);
	let rows: SheetRow[];
	if (options.adopt) {
		rows = adoptReviewSheet(
			await readFile(options.adopt, "utf8"),
			path.basename(options.adopt),
			plan.samples,
		);
	} else {
		const format = findAzureAudioFormat(plan.settings.outputFormat);
		if (!format) throw new Error("Unsupported plan audio format");
		const { changed } = compareWithCurrentCode(plan, format.extension);
		rows = selectReviewSheet({
			samples: plan.samples.filter(
				({ status, file }) => status === "generated" && !changed.has(file),
			),
			clips: checks,
			seed: options.seed ?? 358,
			pronunciationsOf: options.pronunciationsOf,
		});
	}
	const file = path.join(dir, REVIEW_SHEET_FILE);
	try {
		await writeFile(file, renderReviewSheet(rows), { flag: options.force ? "w" : "wx" });
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "EEXIST")
			throw new Error(`${file} exists; the dev may have listened to it. Use --force to replace it`);
		throw error;
	}
	const origin = options.adopt
		? `adopted from ${path.basename(options.adopt)}`
		: `drawn with seed ${options.seed ?? 358}`;
	await writeFile(
		path.join(dir, SHEET_BINDING_FILE),
		`${JSON.stringify(sheetBinding(origin, plan.samples, checks), null, 2)}\n`,
	);
	return { file, rows };
}

/** The clips in a batch's `checks.json`; refuses a batch the checks haven't run on. */
export async function readChecks(dir: string): Promise<CheckedClip[]> {
	try {
		return (
			JSON.parse(await readFile(path.join(dir, "checks.json"), "utf8")) as { clips: CheckedClip[] }
		).clips;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT")
			throw new Error(`${dir} has no checks.json; run check on it first`);
		throw error;
	}
}

/** The batch's sheet, or undefined when it has none. */
export async function readReviewSheet(dir: string): Promise<SheetRow[] | undefined> {
	try {
		return parseReviewSheet(await readFile(path.join(dir, REVIEW_SHEET_FILE), "utf8"));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
		throw error;
	}
}
