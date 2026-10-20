import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import type { SoundVerdict } from "../contract";
import type { JudgeMargins } from "../judge";
import { WRONG_WORD_KINDS, type WrongWordKind } from "./cases";
import {
	type CaseResult,
	evaluateCases,
	type GroupMetrics,
	type JudgedSounds,
	type Metrics,
	metricsByGroup,
	type Rates,
	type ScoredCase,
	type SweepRow,
	sweepMargins,
} from "./metrics";

export type SourceSummary = {
	readonly id: string;
	readonly kind: "tts" | "real";
	readonly recordings: number;
	readonly missing: readonly string[];
	readonly neither: readonly string[];
	readonly relabelled: readonly { readonly file: string; readonly as: string }[];
};

export type ScoringSummary = {
	readonly uniqueRequests: number;
	readonly cacheHits: number;
	readonly liveCalls: number;
	readonly attempts: number;
	readonly throttled: number;
	readonly uncached: number;
	readonly failed: number;
	readonly failures: readonly string[];
};

export type CaseRow = {
	readonly source: string;
	readonly contrast: string;
	readonly kind: "correct" | "swap" | "wrong-word";
	readonly wrongWord?: WrongWordKind;
	readonly target: string;
	readonly recording: string;
	readonly position: number;
	readonly targetPhonemeId: PhonemeSymbolId;
	readonly expectedHeard: PhonemeSymbolId;
	readonly category: CaseResult["category"];
	readonly verdict: string;
	/** Other sounds judged `swapped`, as `ID as heard (word)`. */
	readonly otherFlags: readonly string[];
	readonly targetScore: number | null;
	/** The three best rivals, as `ID score`. */
	readonly rivals: readonly string[];
};

export type HarnessReport = {
	readonly generatedAt: string;
	readonly scorer: { readonly id: string; readonly settings: unknown };
	readonly margins: JudgeMargins;
	readonly judged: JudgedSounds;
	readonly sources: readonly SourceSummary[];
	readonly scoring: ScoringSummary;
	/** Cases with no scorer result (offline cache misses or failed calls), left out of every metric. */
	readonly unscoredCases: number;
	readonly groups: Readonly<Record<string, GroupMetrics>>;
	readonly sweep: readonly SweepRow[];
	readonly cases: readonly CaseRow[];
};

export function buildReport({
	scored,
	unscoredCases,
	margins,
	judged,
	sweep,
	...rest
}: {
	readonly generatedAt: string;
	readonly scorer: HarnessReport["scorer"];
	readonly margins: JudgeMargins;
	readonly judged: JudgedSounds;
	readonly sweep: readonly JudgeMargins[];
	readonly sources: readonly SourceSummary[];
	readonly scoring: ScoringSummary;
	readonly scored: readonly ScoredCase[];
	readonly unscoredCases: number;
}): HarnessReport {
	const results = evaluateCases(scored, margins, judged);
	return {
		...rest,
		margins,
		judged,
		unscoredCases,
		groups: metricsByGroup(results),
		sweep: sweepMargins(scored, sweep, judged),
		cases: results.map(caseRow),
	};
}

function verdictLabel(outcome: CaseResult["outcome"]): string {
	switch (outcome.type) {
		case "rejected":
			return outcome.gate.type === "different-word"
				? `different word "${outcome.gate.heard.join(" ")}"`
				: "not heard";
		case "no-evidence":
			return outcome.reason;
		case "judged":
			return outcome.verdict.type === "swapped"
				? `swapped ${heardLabel(outcome.verdict)}`
				: outcome.verdict.type;
	}
}

function heardLabel({ heard, heardWord }: Extract<SoundVerdict, { type: "swapped" }>): string {
	return heardWord ? `${heard} (${heardWord})` : heard;
}

function caseRow({ case: harnessCase, sourceId, outcome, category }: CaseResult): CaseRow {
	const sound = outcome.type === "judged" ? outcome.sound : null;
	const verdict = verdictLabel(outcome);
	return {
		source: sourceId,
		contrast: harnessCase.contrastId,
		kind: harnessCase.kind,
		...(harnessCase.wrongWord && { wrongWord: harnessCase.wrongWord }),
		target: harnessCase.targetWord,
		recording: harnessCase.recordingWord,
		position: harnessCase.position,
		targetPhonemeId: harnessCase.targetPhonemeId,
		expectedHeard: harnessCase.expectedHeard,
		category,
		verdict,
		otherFlags:
			outcome.type === "rejected"
				? []
				: outcome.otherFlags.flatMap(({ phonemeId, verdict: other }) =>
						other.type === "swapped" ? [`${phonemeId} as ${heardLabel(other)}`] : [],
					),
		targetScore: sound ? round(sound.targetScore) : null,
		rivals: sound
			? [...sound.rivals]
					.sort((a, b) => b.score - a.score)
					.slice(0, 3)
					.map((rival) => `${rival.phonemeId} ${round(rival.score)}`)
			: [],
	};
}

function round(value: number): number {
	return Math.round(value * 100) / 100;
}

function percent(value: number | null): string {
	return value === null ? "–" : `${(value * 100).toFixed(1)}%`;
}

function table(header: readonly string[], rows: readonly (readonly string[])[]): string {
	return [
		`| ${header.join(" | ")} |`,
		`| ${header.map(() => "---").join(" | ")} |`,
		...rows.map((row) => `| ${row.join(" | ")} |`),
	].join("\n");
}

const RATE_HEADER = [
	"Correct",
	"False flag",
	"Recordings flagged",
	"Other sound flagged",
	"Correct unclear",
	"Pairs",
	"Swap named",
	"Misnamed",
	"Missed",
	"Swap unclear",
	"No evidence",
	"False reject",
];

function rateCells({
	correct,
	swap,
	correctRecordings,
	otherSoundFlagged,
	rates,
}: Metrics): string[] {
	return [
		String(correct.total),
		`${percent(rates.falseFlag)} (${correct["false-flag"]})`,
		`${percent(rates.falseFlagRecordings)} (${correctRecordings.flagged} of ${correctRecordings.total})`,
		`${percent(rates.otherSoundFlagged)} (${otherSoundFlagged})`,
		percent(rates.correctUnclear),
		String(swap.total),
		`${percent(rates.swapNamed)} (${swap.named})`,
		percent(rates.swapMisnamed),
		percent(rates.swapMissed),
		percent(rates.swapUnclear),
		percent(rates.noEvidence),
		`${percent(rates.falseReject)} (${correct.rejected + swap.rejected})`,
	];
}

function wrongWordCells({ wrongWord, rates }: Metrics): string[] {
	return [
		...WRONG_WORD_KINDS.map((kind) => {
			const counts = wrongWord.byKind[kind];
			return counts ? `${counts.accepted}/${counts.total}` : "–";
		}),
		`${percent(rates.wrongWordAccepted)}`,
	];
}

function shapeCells({ shape }: Metrics): string[] {
	const share = (count: number) => percent(shape.scored === 0 ? null : count / shape.scored);
	return [
		String(shape.scored),
		share(shape.targetOnly),
		share(shape.partnerListed),
		share(shape.targetTop),
		share(shape.tieAtTop),
		share(shape.partnerTop),
		share(shape.otherTop),
	];
}

function topCounts(counts: Readonly<Record<string, number>>, limit = 3): string {
	const entries = Object.entries(counts).slice(0, limit);
	return entries.length === 0 ? "–" : entries.map(([id, count]) => `${id} ${count}`).join(", ");
}

const JUDGED_LABEL: Record<JudgedSounds, string> = {
	every: "every sound in the word judged",
	contrast: "only the contrast's two sounds judged",
};

function marginsLabel({ match, swap, matchFloor }: JudgeMargins): string {
	return `match ${match}, swap ${swap}, floor ${matchFloor}`;
}

function orderedGroups(report: HarnessReport): string[] {
	const sources = report.sources.map((source) => source.id).filter((id) => id in report.groups);
	return ["all", "tts", "real", ...sources].filter((id) => id in report.groups);
}

/** The kinds present, plus "all" only when it differs from a single kind. */
function kindGroupsWithAll(groups: readonly string[]): string[] {
	const kinds = groups.filter((id) => id === "tts" || id === "real");
	return kinds.length > 1 ? ["all", ...kinds] : kinds;
}

export function renderMarkdown(report: HarnessReport): string {
	const groups = orderedGroups(report);
	const lines: string[] = [];
	const { scoring } = report;
	lines.push(
		"# Pronunciation eval report",
		"",
		`Generated ${report.generatedAt} with scorer \`${report.scorer.id}\` (${JSON.stringify(report.scorer.settings)}), judge margins ${marginsLabel(report.margins)}, and ${JUDGED_LABEL[report.judged]}.`,
		"",
		`Scoring: ${scoring.uniqueRequests} unique requests, ${scoring.cacheHits} from cache, ${scoring.liveCalls} live calls (${scoring.attempts} attempts, ${scoring.throttled} throttled), ${scoring.uncached} uncached, ${scoring.failed} failed. ${report.unscoredCases} cases had no scorer result and are left out.`,
		"",
		"Correct: a recording judged against its own word; false flag means a sound judged `swapped`, counted per case, and recordings flagged counts each take once though it is in several contrasts. Pairs: the partner word's recording judged against the target; swap named means `swapped` with the partner's sound. Other sound flagged: correct or pair recordings with a sound besides the contrast one judged `swapped`. False reject: correct or pair recordings the word gate stopped before judging.",
		"",
		"## Headline",
		"",
		table(
			["Group", ...RATE_HEADER],
			groups.map((id) => [id, ...rateCells(report.groups[id].overall)]),
		),
		"",
	);
	const wrongWordGroups = groups.filter((id) => report.groups[id].overall.wrongWord.total > 0);
	if (wrongWordGroups.length > 0) {
		lines.push(
			"## Wrong words",
			"",
			"Recordings of something other than the target or its partner, accepted by the word gate out of all. Wrong word accepted leaves out nonwords, which are fair to judge.",
			"",
			table(
				["Group", ...WRONG_WORD_KINDS, "Wrong word accepted"],
				wrongWordGroups.map((id) => [id, ...wrongWordCells(report.groups[id].overall)]),
			),
			"",
		);
	}
	lines.push(
		"## Falsely flagged sounds",
		"",
		"Sounds said as the target but judged `swapped`, as target as heard: every sound of a correct recording, and every sound but the contrast one of a pair recording.",
		"",
		table(
			["Group", "Flags", "Most often"],
			groups.map((id) => {
				const { falselyFlagged } = report.groups[id].overall;
				const total = Object.values(falselyFlagged).reduce((sum, count) => sum + count, 0);
				return [id, String(total), topCounts(falselyFlagged, 8)];
			}),
		),
		"",
		"## Evidence for the judged sound",
		"",
		"Share of scored judged sounds, before margins: no rivals at all, partner listed among the rivals, and who scored highest.",
		"",
		table(
			[
				"Group",
				"Scored",
				"Target only",
				"Partner listed",
				"Target top",
				"Tie at top",
				"Partner top",
				"Other top",
			],
			groups.map((id) => [id, ...shapeCells(report.groups[id].overall)]),
		),
		"",
	);

	for (const id of kindGroupsWithAll(groups)) {
		const group = report.groups[id];
		lines.push(
			`## Worst contrasts (${id})`,
			"",
			"By false-flag rate, then correct-unclear rate. Beaten by: rivals that tied or beat the target on correct recordings.",
			"",
			table(
				["Contrast", ...RATE_HEADER, "Beaten by"],
				group.worstContrasts
					.slice(0, 8)
					.map((contrast) => [
						contrast,
						...rateCells(group.byContrast[contrast]),
						topCounts(group.byContrast[contrast].shape.beatenBy),
					]),
			),
			"",
		);
	}

	const sourceGroups = groups.filter((id) => id.includes(":"));
	for (const id of [
		...kindGroupsWithAll(groups),
		...(sourceGroups.length > 1 ? sourceGroups : []),
	]) {
		const group = report.groups[id];
		lines.push(
			`## Per contrast (${id})`,
			"",
			table(
				["Contrast", ...RATE_HEADER, "Beaten by"],
				Object.keys(group.byContrast)
					.sort()
					.map((contrast) => [
						contrast,
						...rateCells(group.byContrast[contrast]),
						topCounts(group.byContrast[contrast].shape.beatenBy),
					]),
			),
			"",
		);
	}

	lines.push(
		"## Other margins",
		"",
		"The same evidence judged under other margins, for information only.",
		"",
		table(
			["Margins", "Group", "False flag", "Swap named", "Swap misnamed", "Unclear"],
			report.sweep.flatMap((row) =>
				groups
					.filter((id) => id in row.groups)
					.map((id) => {
						const rates: Rates = row.groups[id];
						return [
							marginsLabel(row.margins),
							id,
							percent(rates.falseFlag),
							percent(rates.swapNamed),
							percent(rates.swapMisnamed),
							percent(rates.unclear),
						];
					}),
			),
		),
		"",
		"## Sources",
		"",
		table(
			["Source", "Kind", "Recordings", "Missing", "Neither", "Relabelled"],
			report.sources.map((source) => [
				source.id,
				source.kind,
				String(source.recordings),
				source.missing.length === 0
					? "0"
					: `${source.missing.length}: ${source.missing.join(", ")}`,
				String(source.neither.length),
				String(source.relabelled.length),
			]),
		),
		"",
	);
	if (scoring.failures.length > 0) {
		lines.push("## Failures", "", ...scoring.failures.map((failure) => `- ${failure}`), "");
	}
	return lines.join("\n");
}
