import type { SoundEvidence, SoundVerdict, Transcript, WordEvidence } from "../contract";
import { judgeWord, type JudgeMargins } from "../judge";
import { gateWord, type WordGate } from "../word-gate";
import {
	curatedPronunciations,
	type HarnessCase,
	targetWordFor,
	type WrongWordKind,
} from "./cases";

export type SourceKind = "tts" | "real";

export type ScoredCase = {
	readonly case: HarnessCase;
	readonly sourceId: string;
	readonly sourceKind: SourceKind;
	readonly evidence: WordEvidence;
	/** The recording's transcript: null for no speech, absent when the scorer gave none. */
	readonly transcript?: Transcript | null;
};

export type CaseOutcome =
	| { readonly type: "rejected"; readonly gate: Exclude<WordGate, { type: "judged" }> }
	| { readonly type: "judged"; readonly verdict: SoundVerdict; readonly sound: SoundEvidence }
	| { readonly type: "no-evidence"; readonly reason: "no-pronunciation" | "missing-sound" };

/** `rejected`: the word gate stopped the recording before any sound was judged. */
export type CorrectCategory = "match" | "false-flag" | "unclear" | "no-evidence" | "rejected";
export type SwapCategory = "named" | "misnamed" | "missed" | "unclear" | "no-evidence" | "rejected";
/** `accepted`: the word gate let a recording of another word through to the judge. */
export type WrongWordCategory = "rejected" | "accepted";

export type CaseResult = Omit<ScoredCase, "evidence" | "transcript"> & {
	readonly outcome: CaseOutcome;
	readonly category: CorrectCategory | SwapCategory | WrongWordCategory;
};

/** The word gate, then the judge on the case's sound. */
export function evaluateCase(
	harnessCase: HarnessCase,
	{ evidence, transcript }: Pick<ScoredCase, "evidence" | "transcript">,
	margins?: JudgeMargins,
): CaseOutcome {
	const judgedPhonemeIds = new Set(harnessCase.judgedPhonemeIds);
	const gate = gateWord({
		target: targetWordFor(harnessCase.targetWord),
		evidence,
		transcript,
		judgedPhonemeIds,
		targetAccent: "en-us",
		pronunciationsOf: curatedPronunciations,
	});
	if (gate.type !== "judged") return { type: "rejected", gate };

	const judgement = judgeWord({ evidence, judgedPhonemeIds, targetAccent: "en-us", margins });
	if (!judgement) return { type: "no-evidence", reason: "no-pronunciation" };
	const pronunciation = evidence.pronunciations.find(
		(candidate) => candidate.pronunciationIndex === judgement.pronunciationIndex,
	);
	const sound = pronunciation?.sounds[harnessCase.position];
	const judged = judgement.sounds.find((candidate) => candidate.position === harnessCase.position);
	if (sound?.type !== "scored" || !judged) return { type: "no-evidence", reason: "missing-sound" };
	return { type: "judged", verdict: judged.verdict, sound };
}

export function categorize(
	harnessCase: HarnessCase,
	outcome: CaseOutcome,
): CorrectCategory | SwapCategory | WrongWordCategory {
	if (harnessCase.kind === "wrong-word")
		return outcome.type === "rejected" ? "rejected" : "accepted";
	if (outcome.type === "rejected" || outcome.type === "no-evidence") return outcome.type;
	const { verdict } = outcome;
	if (harnessCase.kind === "correct") {
		if (verdict.type === "swapped") return "false-flag";
		return verdict.type;
	}
	if (verdict.type === "swapped") {
		return verdict.heard === harnessCase.expectedHeard ? "named" : "misnamed";
	}
	return verdict.type === "match" ? "missed" : "unclear";
}

export function evaluateCases(scored: readonly ScoredCase[], margins?: JudgeMargins): CaseResult[] {
	return scored.map(({ evidence, transcript, ...rest }) => {
		const outcome = evaluateCase(rest.case, { evidence, transcript }, margins);
		return { ...rest, outcome, category: categorize(rest.case, outcome) };
	});
}

export type CorrectCounts = Record<CorrectCategory, number> & { readonly total: number };
export type SwapCounts = Record<SwapCategory, number> & { readonly total: number };
export type WrongWordCounts = Record<WrongWordCategory, number> & {
	readonly total: number;
	readonly byKind: Readonly<Partial<Record<WrongWordKind, { total: number; accepted: number }>>>;
};

/** Null when there were no cases of that kind. */
export type Rates = {
	/** Correct recordings judged `swapped`. */
	readonly falseFlag: number | null;
	readonly correctUnclear: number | null;
	/** Pair recordings judged `swapped` with the partner's sound. */
	readonly swapNamed: number | null;
	readonly swapMisnamed: number | null;
	/** Pair recordings judged `match`. */
	readonly swapMissed: number | null;
	readonly swapUnclear: number | null;
	/** Unclear over every case of both kinds. */
	readonly unclear: number | null;
	readonly noEvidence: number | null;
	/** Correct and pair recordings the word gate stopped. */
	readonly falseReject: number | null;
	/**
	 * Wrong-word recordings the word gate let through, leaving out nonwords: one
	 * sound off the target, a nonword is a fair thing to judge.
	 */
	readonly wrongWordAccepted: number | null;
};

/** How the judged sound's evidence looked, before any margin is applied. */
export type EvidenceShape = {
	readonly scored: number;
	/** No rivals at all, so only `match` or `unclear` is possible. */
	readonly targetOnly: number;
	/** The contrast partner appeared among the rivals. */
	readonly partnerListed: number;
	readonly targetTop: number;
	/** The target tied the best rival. */
	readonly tieAtTop: number;
	readonly partnerTop: number;
	/** A sound other than the target and its contrast partner scored highest. */
	readonly otherTop: number;
	/** Correct recordings only: the rivals that tied or beat the target, by count. */
	readonly beatenBy: Readonly<Record<string, number>>;
};

export type Metrics = {
	readonly correct: CorrectCounts;
	readonly swap: SwapCounts;
	readonly wrongWord: WrongWordCounts;
	readonly rates: Rates;
	readonly shape: EvidenceShape;
};

const SCORE_TOLERANCE = 1e-9;

export function summarize(results: readonly CaseResult[]): Metrics {
	const correct = {
		total: 0,
		match: 0,
		"false-flag": 0,
		unclear: 0,
		"no-evidence": 0,
		rejected: 0,
	};
	const swap = {
		total: 0,
		named: 0,
		misnamed: 0,
		missed: 0,
		unclear: 0,
		"no-evidence": 0,
		rejected: 0,
	};
	const wrongWord = { total: 0, rejected: 0, accepted: 0 };
	const byKind: Partial<Record<WrongWordKind, { total: number; accepted: number }>> = {};
	const shape = {
		scored: 0,
		targetOnly: 0,
		partnerListed: 0,
		targetTop: 0,
		tieAtTop: 0,
		partnerTop: 0,
		otherTop: 0,
	};
	const beatenBy: Record<string, number> = {};

	for (const result of results) {
		const { wrongWord: kind } = result.case;
		if (kind) {
			const accepted = result.category === "accepted";
			wrongWord.total++;
			wrongWord[accepted ? "accepted" : "rejected"]++;
			const counts = (byKind[kind] ??= { total: 0, accepted: 0 });
			counts.total++;
			if (accepted) counts.accepted++;
			continue;
		}
		if (result.case.kind === "correct") {
			correct.total++;
			correct[result.category as CorrectCategory]++;
		} else {
			swap.total++;
			swap[result.category as SwapCategory]++;
		}
		if (result.outcome.type !== "judged") continue;

		const { sound } = result.outcome;
		shape.scored++;
		if (sound.rivals.length === 0) {
			shape.targetOnly++;
			continue;
		}
		const partner = result.case.partnerPhonemeId;
		if (sound.rivals.some((rival) => rival.phonemeId === partner)) shape.partnerListed++;
		const best = Math.max(...sound.rivals.map((rival) => rival.score));
		const leaders = sound.rivals.filter((rival) => best - rival.score <= SCORE_TOLERANCE);
		if (sound.targetScore - best > SCORE_TOLERANCE) shape.targetTop++;
		else if (best - sound.targetScore <= SCORE_TOLERANCE) shape.tieAtTop++;
		else if (leaders.some((rival) => rival.phonemeId === partner)) shape.partnerTop++;
		else shape.otherTop++;

		if (result.case.kind === "correct" && best - sound.targetScore >= -SCORE_TOLERANCE) {
			for (const { phonemeId } of leaders) beatenBy[phonemeId] = (beatenBy[phonemeId] ?? 0) + 1;
		}
	}

	const all = correct.total + swap.total;
	const realWords = Object.entries(byKind)
		.filter(([kind]) => kind !== "nonword")
		.map(([, counts]) => counts);
	return {
		correct,
		swap,
		wrongWord: { ...wrongWord, byKind },
		rates: {
			falseFlag: rate(correct["false-flag"], correct.total),
			correctUnclear: rate(correct.unclear, correct.total),
			swapNamed: rate(swap.named, swap.total),
			swapMisnamed: rate(swap.misnamed, swap.total),
			swapMissed: rate(swap.missed, swap.total),
			swapUnclear: rate(swap.unclear, swap.total),
			unclear: rate(correct.unclear + swap.unclear, all),
			noEvidence: rate(correct["no-evidence"] + swap["no-evidence"], all),
			falseReject: rate(correct.rejected + swap.rejected, all),
			wrongWordAccepted: rate(
				realWords.reduce((sum, counts) => sum + counts.accepted, 0),
				realWords.reduce((sum, counts) => sum + counts.total, 0),
			),
		},
		shape: { ...shape, beatenBy: sortedCounts(beatenBy) },
	};
}

function rate(count: number, total: number): number | null {
	return total === 0 ? null : count / total;
}

function sortedCounts(counts: Record<string, number>): Record<string, number> {
	return Object.fromEntries(Object.entries(counts).sort(([, a], [, b]) => b - a));
}

function groupBy<T>(items: readonly T[], keyOf: (item: T) => string): Map<string, T[]> {
	const groups = new Map<string, T[]>();
	for (const item of items) {
		const key = keyOf(item);
		const group = groups.get(key);
		if (group) group.push(item);
		else groups.set(key, [item]);
	}
	return groups;
}

export type GroupMetrics = {
	readonly overall: Metrics;
	readonly byContrast: Readonly<Record<string, Metrics>>;
	/** Contrasts ordered by false-flag rate, then correct-unclear rate, worst first. */
	readonly worstContrasts: readonly string[];
};

export function groupMetrics(results: readonly CaseResult[]): GroupMetrics {
	const byContrast = Object.fromEntries(
		[...groupBy(results, (result) => result.case.contrastId)].map(([id, group]) => [
			id,
			summarize(group),
		]),
	);
	const worstContrasts = Object.entries(byContrast)
		.sort(
			([, a], [, b]) =>
				(b.rates.falseFlag ?? 0) - (a.rates.falseFlag ?? 0) ||
				(b.rates.correctUnclear ?? 0) - (a.rates.correctUnclear ?? 0),
		)
		.map(([id]) => id);
	return { overall: summarize(results), byContrast, worstContrasts };
}

/** Every group the report shows: all cases, each source kind, and each source. */
export function groupIds(result: Pick<CaseResult, "sourceId" | "sourceKind">): string[] {
	return ["all", result.sourceKind, result.sourceId];
}

function resultsByGroup(results: readonly CaseResult[]): Map<string, CaseResult[]> {
	const groups = new Map<string, CaseResult[]>();
	for (const result of results) {
		for (const id of groupIds(result)) {
			const group = groups.get(id);
			if (group) group.push(result);
			else groups.set(id, [result]);
		}
	}
	return groups;
}

export function metricsByGroup(results: readonly CaseResult[]): Record<string, GroupMetrics> {
	return Object.fromEntries(
		[...resultsByGroup(results)].map(([id, group]) => [id, groupMetrics(group)]),
	);
}

export type SweepRow = {
	readonly margins: JudgeMargins;
	readonly groups: Readonly<Record<string, Rates>>;
};

/** The same evidence judged under other margins; costs no scorer calls. */
export function sweepMargins(
	scored: readonly ScoredCase[],
	settings: readonly JudgeMargins[],
): SweepRow[] {
	return settings.map((margins) => ({
		margins,
		groups: Object.fromEntries(
			[...resultsByGroup(evaluateCases(scored, margins))].map(([id, group]) => [
				id,
				summarize(group).rates,
			]),
		),
	}));
}
