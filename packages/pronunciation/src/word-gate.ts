import type { PhonemeSymbolId, TargetAccent } from "@phonaria/phonetics-data";
import type { TargetWord, Transcript, WordEvidence } from "./contract";
import { bestFittingPronunciation, contrastPartners } from "./judge";

/**
 * Whether a recording holds the target word at all, decided before any sound is
 * judged. A scorer told to expect *ship* scores whatever was said as *ship*, so
 * without this a learner who said *kid*, *ships* or "a ship" would get a verdict.
 *
 * - `judged`: judge the sounds.
 * - `different-word`: something else was said. `heard` is what the transcript
 *   heard instead, or empty when there's nothing to name.
 * - `not-heard`: no speech at all.
 */
export type WordGate =
	| { readonly type: "judged" }
	| { readonly type: "different-word"; readonly heard: readonly string[] }
	| { readonly type: "not-heard" };

export type WordGateMargins = {
	/** A whole-word accuracy under this says the word was off. */
	readonly wordAccuracy: number;
	/** A sound outside the judged ones scoring under this says the word was off... */
	readonly soundAccuracy: number;
	/** ...but only when the transcript is at least this confident. */
	readonly transcriptConfidence: number;
};

/**
 * From the wrong-word investigation (#344): 1 false reject in 48 target or partner
 * recordings, no wrong word accepted in 60. Tuned per scorer in #335.
 */
export const WORD_GATE_MARGINS: WordGateMargins = {
	wordAccuracy: 0.3,
	soundAccuracy: 0.6,
	transcriptConfidence: 0.5,
};

/** A word's accepted pronunciations as base phoneme IDs, or undefined when unknown. */
export type PronunciationLookup = (
	word: string,
) => readonly (readonly PhonemeSymbolId[])[] | undefined;

export type WordGateInput = {
	readonly target: TargetWord;
	readonly evidence: WordEvidence;
	/** The recording's transcript: null for no speech, undefined when the scorer gave none. */
	readonly transcript: Transcript | null | undefined;
	readonly judgedPhonemeIds: ReadonlySet<PhonemeSymbolId>;
	readonly targetAccent: TargetAccent;
	/** Pronounces transcript words, so a homophone of the target counts as the target. */
	readonly pronunciationsOf: PronunciationLookup;
	readonly margins?: WordGateMargins;
};

const JUDGED: WordGate = { type: "judged" };
const NOT_HEARD: WordGate = { type: "not-heard" };
const differentWord = (heard: readonly string[]): WordGate => ({ type: "different-word", heard });

/**
 * The rule, in order:
 *
 * 1. No speech heard: `not-heard`.
 * 2. The scorer found the target word missing: `different-word`.
 * 3. The transcript holds more than one word: `different-word`.
 * 4. The transcript is one word that sounds like the target, or like the target
 *    with one judged sound swapped for a contrast partner (*sheep* for *ship*):
 *    `judged`, since naming that swap is the judge's job.
 * 5. The transcript is one other word: `different-word` only if the scoring agrees
 *    the word was off, with a low word accuracy, or a confident transcript and a
 *    low sound outside the judged ones. The transcript alone is never enough:
 *    Azure transcribed a clear *pool* as "pull" and a clear *bat* as "that".
 *
 * Without a transcript, steps 3 to 5 become one check: a low word accuracy.
 */
export function gateWord({
	target,
	evidence,
	transcript,
	judgedPhonemeIds,
	targetAccent,
	pronunciationsOf,
	margins = WORD_GATE_MARGINS,
}: WordGateInput): WordGate {
	if (transcript === null || transcript?.words.length === 0) return NOT_HEARD;

	const heard = transcript?.words ?? [];
	const isOneOtherWord =
		heard.length === 1 &&
		!soundsLikeTarget(heard[0], target, judgedPhonemeIds, targetAccent, pronunciationsOf);
	// What was said instead, when the transcript can name it.
	const instead = heard.length > 1 || isOneOtherWord ? heard : [];
	const wordIsOff = (evidence.accuracy ?? 1) < margins.wordAccuracy;

	if (evidence.omitted) return differentWord(instead);
	if (!transcript) return wordIsOff ? differentWord([]) : JUDGED;
	if (heard.length > 1) return differentWord(heard);
	if (!isOneOtherWord) return JUDGED;

	const isConfident = transcript.confidence >= margins.transcriptConfidence;
	const otherSoundIsOff =
		lowestOtherSoundAccuracy(evidence, judgedPhonemeIds) < margins.soundAccuracy;
	return wordIsOff || (isConfident && otherSoundIsOff) ? differentWord(heard) : JUDGED;
}

function soundsLikeTarget(
	word: string,
	target: TargetWord,
	judgedPhonemeIds: ReadonlySet<PhonemeSymbolId>,
	targetAccent: TargetAccent,
	pronunciationsOf: PronunciationLookup,
): boolean {
	if (word === target.text.trim().toLowerCase()) return true;
	const heardPronunciations = pronunciationsOf(word) ?? [];
	return heardPronunciations.some((heard) =>
		target.acceptedPronunciations.some((expected) =>
			isSameOrOneJudgedSwap(expected, heard, judgedPhonemeIds, targetAccent),
		),
	);
}

function isSameOrOneJudgedSwap(
	expected: readonly PhonemeSymbolId[],
	heard: readonly PhonemeSymbolId[],
	judgedPhonemeIds: ReadonlySet<PhonemeSymbolId>,
	targetAccent: TargetAccent,
): boolean {
	if (expected.length !== heard.length) return false;
	const differences = expected.flatMap((id, index) => (id === heard[index] ? [] : [index]));
	if (differences.length === 0) return true;
	if (differences.length > 1) return false;
	const [at] = differences;
	return (
		judgedPhonemeIds.has(expected[at]) &&
		contrastPartners(targetAccent, expected[at]).has(heard[at])
	);
}

/** Over the sounds the judge won't judge, scored against the target itself. */
function lowestOtherSoundAccuracy(
	evidence: WordEvidence,
	judgedPhonemeIds: ReadonlySet<PhonemeSymbolId>,
): number {
	let lowest = Number.POSITIVE_INFINITY;
	for (const sound of bestFittingPronunciation(evidence.pronunciations)?.sounds ?? []) {
		if (sound.type !== "scored" || sound.accuracy === undefined) continue;
		if (judgedPhonemeIds.has(sound.phonemeId)) continue;
		lowest = Math.min(lowest, sound.accuracy);
	}
	return lowest;
}
