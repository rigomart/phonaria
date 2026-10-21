import type { JudgeMargins, JudgeThresholds } from "../judge";
import { evaluateCases, metricsByGroup, type ScoredCase } from "./metrics";
import {
	FALSE_FLAG_TARGET,
	MIN_CORRECT_SOUNDS,
	type SoundCounts,
	type OverTarget,
	type SoundOccurrence,
	SWAP_MARGINS,
	type Tuning,
	tuneThresholds,
} from "./tune";

export type ThresholdsFile = JudgeThresholds & {
	readonly scorer: { readonly id: string; readonly settings: unknown };
	readonly tunedOn: {
		/** Correct recordings per source. */
		readonly sources: Readonly<Record<string, number>>;
		readonly falseFlagTarget: number;
		readonly minCorrectSounds: number;
		/** Sounds said correctly too few times to tune, kept at the default. */
		readonly tooFewCases: readonly string[];
		/** Present only when some source is still over the target after tuning. */
		readonly overTarget?: readonly OverTarget[];
	};
};

export function thresholdsFile(
	tuning: Tuning,
	scorer: ThresholdsFile["scorer"],
	rates: ReadonlyMap<string, SourceRates>,
): ThresholdsFile {
	return {
		scorer,
		tunedOn: {
			sources: Object.fromEntries([...rates].map(([id, { recordings }]) => [id, recordings])),
			falseFlagTarget: FALSE_FLAG_TARGET,
			minCorrectSounds: MIN_CORRECT_SOUNDS,
			tooFewCases: tuning.sounds
				.filter((sound) => sound.status === "too-few")
				.map((sound) => sound.phonemeId),
			...(tuning.overTarget.length > 0 && { overTarget: tuning.overTarget }),
		},
		default: tuning.thresholds.default,
		bySound: tuning.thresholds.bySound,
	};
}

/** The file's bytes: tab-indented JSON with short lists on one line, as the formatter leaves it. */
export function serializeThresholds(file: ThresholdsFile): string {
	const json = JSON.stringify(file, null, "\t").replace(
		/\[\n\s*([^[\]{}]*?)\n\s*\]/g,
		(_, items: string) => `[${items.split(/,\n\s*/).join(", ")}]`,
	);
	return `${json}\n`;
}

export type SourceRates = {
	readonly recordings: number;
	readonly flagged: number;
	readonly swaps: number;
	readonly named: number;
	readonly unclear: number | null;
};

export function ratesBySource(
	scored: readonly ScoredCase[],
	margins: JudgeMargins | JudgeThresholds,
): Map<string, SourceRates> {
	const groups = metricsByGroup(evaluateCases(scored, margins, "every"));
	const rates = new Map<string, SourceRates>();
	for (const [id, { overall }] of Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))) {
		if (!id.includes(":")) continue;
		rates.set(id, {
			recordings: overall.correctRecordings.total,
			flagged: overall.correctRecordings.flagged,
			swaps: overall.swap.total,
			named: overall.swap.named,
			unclear: overall.rates.unclear,
		});
	}
	return rates;
}

export type HeldOut = {
	readonly sourceId: string;
	/** Tuned on every other source. */
	readonly tuning: Tuning;
	readonly before: SourceRates;
	readonly after: SourceRates;
};

export function leaveOneSourceOut(
	scored: readonly ScoredCase[],
	occurrences: readonly SoundOccurrence[],
	base: JudgeMargins,
): HeldOut[] {
	const sources = [...new Set(occurrences.map((occurrence) => occurrence.sourceId))].sort();
	return sources.map((sourceId) => {
		const tuning = tuneThresholds(
			occurrences.filter((occurrence) => occurrence.sourceId !== sourceId),
			{ base },
		);
		const heldOut = scored.filter((scoredCase) => scoredCase.sourceId === sourceId);
		const before = ratesBySource(heldOut, base).get(sourceId);
		const after = ratesBySource(heldOut, tuning.thresholds).get(sourceId);
		if (!before || !after) throw new Error(`${sourceId} has no judged cases`);
		return { sourceId, tuning, before, after };
	});
}

function percent(count: number, total: number): string {
	return total === 0 ? "–" : `${((count / total) * 100).toFixed(1)}%`;
}

function table(header: readonly string[], rows: readonly (readonly string[])[]): string {
	return [
		`| ${header.join(" | ")} |`,
		`| ${header.map(() => "---").join(" | ")} |`,
		...rows.map((row) => `| ${row.join(" | ")} |`),
	].join("\n");
}

function flagCell({ flagged, correct }: SoundCounts): string {
	return `${flagged} of ${correct} (${percent(flagged, correct)})`;
}

function movedLabel(tuning: Tuning): string {
	const moved = tuning.sounds.filter((sound) => sound.swap !== tuning.thresholds.default.swap);
	return moved.length === 0
		? "none"
		: moved.map((sound) => `${sound.phonemeId} ${sound.swap}`).join(", ");
}

function totals(rates: Iterable<SourceRates>): SourceRates {
	let recordings = 0;
	let flagged = 0;
	let swaps = 0;
	let named = 0;
	for (const rate of rates) {
		recordings += rate.recordings;
		flagged += rate.flagged;
		swaps += rate.swaps;
		named += rate.named;
	}
	return { recordings, flagged, swaps, named, unclear: null };
}

export function overTargetLabel({ sourceId, flagged, recordings }: OverTarget): string {
	return `${sourceId}: ${flagged} of ${recordings} recordings flagged (${percent(flagged, recordings)})`;
}

export function renderTuneReport({
	tuning,
	before,
	after,
	heldOut,
}: {
	readonly tuning: Tuning;
	readonly before: ReadonlyMap<string, SourceRates>;
	readonly after: ReadonlyMap<string, SourceRates>;
	readonly heldOut: readonly HeldOut[];
}): string {
	const base = tuning.thresholds.default;
	const sources = [...before.keys()];
	const voiceRow = (id: string, from: SourceRates, to: SourceRates) => [
		id,
		`${percent(from.flagged, from.recordings)} (${from.flagged} of ${from.recordings})`,
		`${percent(to.flagged, to.recordings)} (${to.flagged} of ${to.recordings})`,
		`${percent(from.named, from.swaps)} (${from.named})`,
		`${percent(to.named, to.swaps)} (${to.named})`,
	];
	const moved = tuning.sounds.filter((sound) => sound.swap !== base.swap);
	const tooFew = tuning.sounds.filter((sound) => sound.status === "too-few");
	const sourceFlags = (sound: Tuning["sounds"][number], side: "before" | "after") =>
		sources
			.map((id) => {
				const counts = sound.bySource[id]?.[side];
				return counts ? `${id.replace(/^\w+:/, "")} ${counts.flagged}/${counts.correct}` : null;
			})
			.filter(Boolean)
			.join(", ");

	return [
		"# Judge thresholds tuned on the harness",
		"",
		`Every sound judged. Target: at most ${FALSE_FLAG_TARGET * 100}% of correct recordings with a sound judged \`swapped\` on each source, and at most ${FALSE_FLAG_TARGET * 100}% of each sound's correct occurrences judged \`swapped\`. Default margins: match ${base.match}, swap ${base.swap}, floor ${base.matchFloor}. Swap margins tried: ${SWAP_MARGINS[0]} to ${SWAP_MARGINS[SWAP_MARGINS.length - 1]} in steps of 0.05. A sound said correctly fewer than ${MIN_CORRECT_SOUNDS} times keeps the default.`,
		"",
		...(tuning.overTarget.length > 0
			? [
					"**Target not met.** Still over the target after tuning:",
					"",
					...tuning.overTarget.map((source) => `- ${overTargetLabel(source)}`),
					"",
				]
			: []),
		"## Per source",
		"",
		table(
			["Source", "Recordings flagged before", "After", "Swap named before", "After"],
			[
				...sources.map((id) =>
					voiceRow(id, before.get(id) as SourceRates, after.get(id) as SourceRates),
				),
				voiceRow("all", totals(before.values()), totals(after.values())),
			],
		),
		"",
		"## Sounds that moved",
		"",
		table(
			[
				"Sound",
				"Swap margin",
				"False flags before",
				"After",
				"Per source before",
				"After",
				"Swaps named before",
				"After",
			],
			moved.map((sound) => [
				sound.phonemeId,
				`${base.swap} to ${sound.swap}`,
				flagCell(sound.before),
				flagCell(sound.after),
				sourceFlags(sound, "before"),
				sourceFlags(sound, "after"),
				`${sound.before.named} of ${sound.before.swaps}`,
				`${sound.after.named} of ${sound.after.swaps}`,
			]),
		),
		"",
		"## Sounds still flagged",
		"",
		"Sounds kept at their margin with a false flag left.",
		"",
		table(
			["Sound", "Status", "Swap margin", "False flags", "Per source"],
			tuning.sounds
				.filter((sound) => sound.after.flagged > 0)
				.map((sound) => [
					sound.phonemeId,
					sound.status,
					String(sound.swap),
					flagCell(sound.after),
					sourceFlags(sound, "after"),
				]),
		),
		"",
		"## Kept at the default for too few cases",
		"",
		table(
			["Sound", "Said correctly", "False flags", "Swaps", "Named"],
			tooFew.map((sound) => [
				sound.phonemeId,
				String(sound.before.correct),
				String(sound.before.flagged),
				String(sound.before.swaps),
				String(sound.before.named),
			]),
		),
		"",
		"## Leave one source out",
		"",
		"Tuned on the other sources, measured on the one left out.",
		"",
		table(
			["Left out", "Moved", "Recordings flagged before", "After", "Swap named before", "After"],
			heldOut.map(({ sourceId, tuning: own, before: from, after: to }) => {
				const [id, ...cells] = voiceRow(sourceId, from, to);
				return [id, movedLabel(own), ...cells];
			}),
		),
		"",
	].join("\n");
}

const SOURCE_FLAGS = new Set(["--catalog", "--audio-dir", "--tts-dir", "--voices-dir", "--clips"]);

/** `args` with `defaults` added when they name no source, so other options keep the default sources. */
export function withDefaultSources(
	args: readonly string[],
	defaults: readonly string[],
): readonly string[] {
	const namesSource = args.some((arg) => SOURCE_FLAGS.has(arg.split("=", 1)[0]));
	return namesSource ? args : [...defaults, ...args];
}
