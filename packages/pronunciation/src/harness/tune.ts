import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import type { SoundVerdict } from "../contract";
import { type JudgeMargins, type JudgeThresholds, judgeWord, LENIENT_MARGINS } from "../judge";
import { gateWord } from "../word-gate";
import { curatedPronunciations, targetWordFor } from "./cases";
import type { ScoredCase } from "./metrics";

/** The #328 note's limit on correct recordings judged `swapped`, per source. */
export const FALSE_FLAG_TARGET = 0.02;

/** A sound said correctly fewer times than this, over all sources, keeps the default margins. */
export const MIN_CORRECT_SOUNDS = 50;

export const SWAP_MARGINS: readonly number[] = Array.from(
	{ length: 17 },
	(_, step) => (20 + step * 5) / 100,
);

/**
 * One sound of one judged recording. `expectedHeard` marks the contrast sound of
 * a pair recording, the one sound not said as the target. `recording` names the
 * correct recording a sound is in: one take of one word.
 */
export type SoundOccurrence = {
	readonly sourceId: string;
	readonly phonemeId: PhonemeSymbolId;
	readonly expectedHeard?: PhonemeSymbolId;
	readonly recording?: string;
	/** The verdict under each of `SWAP_MARGINS`, the other margins at the base. */
	readonly verdicts: readonly SoundVerdict[];
};

/**
 * Every sound the judge sees in the harness with every sound judged, once per
 * take and target word: a take judged in several contrasts counts once, and
 * separate takes of a word count apart. Recordings the word gate stops are left out.
 */
export function soundOccurrences(
	scored: readonly ScoredCase[],
	base: JudgeMargins = LENIENT_MARGINS,
): SoundOccurrence[] {
	const seen = new Set<string>();
	const occurrences: SoundOccurrence[] = [];
	for (const { case: harnessCase, sourceId, recordingId, evidence, transcript } of scored) {
		if (harnessCase.kind === "wrong-word") continue;
		const key = [sourceId, recordingId, harnessCase.targetWord].join("\0");
		if (seen.has(key)) continue;
		seen.add(key);
		const gate = gateWord({
			target: targetWordFor(harnessCase.targetWord),
			evidence,
			transcript,
			targetAccent: "en-us",
			pronunciationsOf: curatedPronunciations,
		});
		if (gate.type !== "judged") continue;
		const judgements = SWAP_MARGINS.map((swap) =>
			judgeWord({ evidence, targetAccent: "en-us", margins: { ...base, swap } }),
		);
		judgements[0]?.sounds.forEach((sound, index) => {
			occurrences.push({
				sourceId,
				phonemeId: sound.phonemeId,
				...(harnessCase.kind === "swap" &&
					sound.position === harnessCase.position && { expectedHeard: harnessCase.expectedHeard }),
				...(harnessCase.kind === "correct" && { recording: key }),
				verdicts: judgements.map((judgement) => judgement?.sounds[index].verdict ?? sound.verdict),
			});
		});
	}
	return occurrences;
}

export type SoundCounts = {
	/** Said as the target: every sound of a correct recording, all but one of a pair recording. */
	readonly correct: number;
	/** Of those, judged `swapped`. */
	readonly flagged: number;
	/** Contrast sounds of pair recordings. */
	readonly swaps: number;
	/** Of those, judged `swapped` with the partner's sound. */
	readonly named: number;
};

function countAt(occurrences: readonly SoundOccurrence[], step: number): SoundCounts {
	let correct = 0;
	let flagged = 0;
	let swaps = 0;
	let named = 0;
	for (const { expectedHeard, verdicts } of occurrences) {
		const verdict = verdicts[step];
		if (expectedHeard) {
			swaps++;
			if (verdict.type === "swapped" && verdict.heard === expectedHeard) named++;
		} else {
			correct++;
			if (verdict.type === "swapped") flagged++;
		}
	}
	return { correct, flagged, swaps, named };
}

type SoundTuning = {
	readonly phonemeId: PhonemeSymbolId;
	/** `too-few`: said correctly under `MIN_CORRECT_SOUNDS` times, so it keeps the default. */
	readonly status: "tuned" | "too-few";
	readonly swap: number;
	/** Over all sources, under the default margins and under the tuned one. */
	readonly before: SoundCounts;
	readonly after: SoundCounts;
	readonly bySource: Readonly<
		Record<string, { readonly before: SoundCounts; readonly after: SoundCounts }>
	>;
};

/** A source still over the target after tuning, with its correct recordings flagged. */
export type OverTarget = {
	readonly sourceId: string;
	readonly flagged: number;
	readonly recordings: number;
};

export type Tuning = {
	readonly thresholds: JudgeThresholds;
	readonly sounds: readonly SoundTuning[];
	/** Sources the rule couldn't bring to the target. Empty when every source meets it. */
	readonly overTarget: readonly OverTarget[];
};

export type TuneOptions = {
	readonly target?: number;
	readonly minCorrect?: number;
	readonly base?: JudgeMargins;
};

/**
 * Picks each sound's swap margin, keyed by the judged target sound. Smaller
 * margins name more swaps, so each sound gets the smallest that meets the target:
 *
 * 1. A sound said correctly at least `minCorrect` times moves up until its false
 *    flags are at or under the target over all sources, and on each source where
 *    it was said correctly at least `minCorrect` times.
 * 2. While a source has more than the target share of its correct recordings with
 *    a sound judged `swapped`, the sound that clears the most of them for each swap
 *    it stops naming moves up to the first margin that clears any. When no single
 *    sound clears one, because flagged recordings have several flagged sounds, each
 *    flagged recording is a candidate instead: all its flagged sounds move up to
 *    the margins that clear them there, under the same cost rule. Sources still
 *    over the target are in `overTarget`.
 *
 * Margins only move up, so no sound is judged less leniently than the base. The
 * match margin and floor stay at the base: with a swap margin above zero they
 * only decide between `match` and `unclear`, never a flag or a named swap.
 */
export function tuneThresholds(
	occurrences: readonly SoundOccurrence[],
	{
		target = FALSE_FLAG_TARGET,
		minCorrect = MIN_CORRECT_SOUNDS,
		base = LENIENT_MARGINS,
	}: TuneOptions = {},
): Tuning {
	const bySound = groupBy(occurrences, (occurrence) => occurrence.phonemeId);
	const ids = [...bySound.keys()].sort();
	const baseStep = SWAP_MARGINS.indexOf(base.swap);
	if (baseStep < 0) throw new Error(`The base swap margin ${base.swap} isn't one of SWAP_MARGINS`);
	const last = SWAP_MARGINS.length - 1;
	const soundsOf = (id: PhonemeSymbolId) => bySound.get(id) ?? [];

	const steps = new Map<PhonemeSymbolId, number>();
	const tunable = new Set<PhonemeSymbolId>();
	for (const id of ids) {
		const list = soundsOf(id);
		let step = baseStep;
		if (countAt(list, step).correct >= minCorrect) {
			tunable.add(id);
			const groups = [
				list,
				...[...groupBy(list, (occurrence) => occurrence.sourceId).values()].filter(
					(group) => countAt(group, step).correct >= minCorrect,
				),
			];
			while (step < last && groups.some((group) => exceeds(countAt(group, step), target))) step++;
		}
		steps.set(id, step);
	}

	const recordings = correctRecordings(occurrences);
	const stepFor = (id: PhonemeSymbolId) => steps.get(id) ?? baseStep;
	const lostBy = (id: PhonemeSymbolId, next: number) =>
		countAt(soundsOf(id), stepFor(id)).named - countAt(soundsOf(id), next).named;
	for (;;) {
		const over = sourcesOverTarget(recordings, steps, baseStep, target);
		if (over.size === 0) break;
		const flaggedNow = countFlagged(recordings, steps, baseStep, over);
		const clearedBy = (raise: ReadonlyMap<PhonemeSymbolId, number>) =>
			flaggedNow - countFlagged(recordings, new Map([...steps, ...raise]), baseStep, over);

		const raises: Raise[] = [];
		const consider = (raise: Map<PhonemeSymbolId, number>) => {
			const cleared = clearedBy(raise);
			if (cleared <= 0) return false;
			let lost = 0;
			for (const [id, next] of raise) lost += lostBy(id, next);
			raises.push({ steps: raise, cleared, lost });
			return true;
		};
		for (const id of ids) {
			if (!tunable.has(id)) continue;
			for (let next = stepFor(id) + 1; next <= last; next++) {
				if (consider(new Map([[id, next]]))) break;
			}
		}
		if (raises.length === 0) {
			for (const recording of recordings) {
				if (!over.has(recording.sourceId)) continue;
				const raise = clearingRaise(recording, steps, baseStep, tunable);
				if (raise) consider(raise);
			}
		}
		const best = raises.reduce<Raise | null>(
			(kept, raise) => (!kept || clearsMorePerLostSwap(raise, kept) ? raise : kept),
			null,
		);
		if (!best) break;
		for (const [id, next] of best.steps) steps.set(id, next);
	}
	const overTarget = overTargetSources(recordings, steps, baseStep, target);

	const sounds = ids.map((id): SoundTuning => {
		const list = soundsOf(id);
		const step = stepFor(id);
		return {
			phonemeId: id,
			status: tunable.has(id) ? "tuned" : "too-few",
			swap: SWAP_MARGINS[step],
			before: countAt(list, baseStep),
			after: countAt(list, step),
			bySource: Object.fromEntries(
				[...groupBy(list, (occurrence) => occurrence.sourceId)]
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([sourceId, group]) => [
						sourceId,
						{ before: countAt(group, baseStep), after: countAt(group, step) },
					]),
			),
		};
	});
	return {
		thresholds: {
			default: base,
			bySound: Object.fromEntries(
				sounds
					.filter((sound) => sound.swap !== base.swap)
					.map((sound) => [sound.phonemeId, { swap: sound.swap }]),
			),
		},
		sounds,
		overTarget,
	};
}

/** Sounds moved together to new steps, the recordings that clears and the named swaps it loses. */
type Raise = {
	readonly steps: ReadonlyMap<PhonemeSymbolId, number>;
	readonly cleared: number;
	readonly lost: number;
};

const isFree = (raise: Raise) => raise.lost === 0;

function clearsMorePerLostSwap(candidate: Raise, best: Raise): boolean {
	if (isFree(candidate) || isFree(best)) {
		return isFree(candidate) === isFree(best)
			? candidate.cleared > best.cleared
			: isFree(candidate);
	}
	// Cross-multiplied to compare cleared/lost ratios; a tie keeps the earlier raise.
	return candidate.cleared * best.lost > best.cleared * candidate.lost;
}

const RATE_TOLERANCE = 1e-9;

function exceeds({ correct, flagged }: SoundCounts, target: number): boolean {
	return flagged > correct * target + RATE_TOLERANCE;
}

type CorrectRecording = {
	readonly sourceId: string;
	readonly sounds: readonly SoundOccurrence[];
};

function correctRecordings(occurrences: readonly SoundOccurrence[]): CorrectRecording[] {
	const withRecording = occurrences.filter((occurrence) => occurrence.recording);
	return [...groupBy(withRecording, (occurrence) => occurrence.recording ?? "").values()].map(
		(sounds) => ({ sourceId: sounds[0].sourceId, sounds }),
	);
}

function isFlagged(
	recording: CorrectRecording,
	steps: ReadonlyMap<PhonemeSymbolId, number>,
	baseStep: number,
): boolean {
	return recording.sounds.some(
		(sound) => sound.verdicts[steps.get(sound.phonemeId) ?? baseStep].type === "swapped",
	);
}

function countFlagged(
	recordings: readonly CorrectRecording[],
	steps: ReadonlyMap<PhonemeSymbolId, number>,
	baseStep: number,
	sources: ReadonlySet<string>,
): number {
	return recordings.filter(
		(recording) => sources.has(recording.sourceId) && isFlagged(recording, steps, baseStep),
	).length;
}

/**
 * Every flagged sound of a flagged recording raised to the first margin that clears
 * it there. Null when the recording isn't flagged or a flagged sound can't be raised:
 * one too rare to tune, or still `swapped` at the last margin.
 */
function clearingRaise(
	recording: CorrectRecording,
	steps: ReadonlyMap<PhonemeSymbolId, number>,
	baseStep: number,
	tunable: ReadonlySet<PhonemeSymbolId>,
): Map<PhonemeSymbolId, number> | null {
	const raise = new Map<PhonemeSymbolId, number>();
	for (const sound of recording.sounds) {
		const step = steps.get(sound.phonemeId) ?? baseStep;
		if (sound.verdicts[step].type !== "swapped") continue;
		if (!tunable.has(sound.phonemeId)) return null;
		const cleared = sound.verdicts.findIndex(
			(verdict, at) => at > step && verdict.type !== "swapped",
		);
		if (cleared < 0) return null;
		raise.set(sound.phonemeId, Math.max(raise.get(sound.phonemeId) ?? 0, cleared));
	}
	return raise.size > 0 ? raise : null;
}

function overTargetSources(
	recordings: readonly CorrectRecording[],
	steps: ReadonlyMap<PhonemeSymbolId, number>,
	baseStep: number,
	target: number,
): OverTarget[] {
	const over = sourcesOverTarget(recordings, steps, baseStep, target);
	return [...groupBy(recordings, (recording) => recording.sourceId)]
		.filter(([sourceId]) => over.has(sourceId))
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([sourceId, group]) => ({
			sourceId,
			flagged: group.filter((recording) => isFlagged(recording, steps, baseStep)).length,
			recordings: group.length,
		}));
}

function sourcesOverTarget(
	recordings: readonly CorrectRecording[],
	steps: ReadonlyMap<PhonemeSymbolId, number>,
	baseStep: number,
	target: number,
): Set<string> {
	const over = new Set<string>();
	for (const [sourceId, group] of groupBy(recordings, (recording) => recording.sourceId)) {
		const flagged = group.filter((recording) => isFlagged(recording, steps, baseStep)).length;
		if (flagged > group.length * target + RATE_TOLERANCE) over.add(sourceId);
	}
	return over;
}

function groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
	const groups = new Map<K, T[]>();
	for (const item of items) {
		const key = keyOf(item);
		const group = groups.get(key);
		if (group) group.push(item);
		else groups.set(key, [item]);
	}
	return groups;
}
