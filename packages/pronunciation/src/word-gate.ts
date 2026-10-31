import type { PhonemeSymbolId, TargetAccent } from "@phonaria/phonetics-data";
import { allowedVariants } from "./allowed-variants";
import type { SoundEvidence, TargetWord, Transcript, WordEvidence } from "./contract";
import { bestFittingPronunciation, contrastPartners, reaches, topRivals } from "./judge";

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
	/** A sound the judge can't call scoring under this says the word was off... */
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
	/** The sounds the judge will judge, as in `JudgeInput`. Omitted, every sound in the word. */
	readonly judgedPhonemeIds?: ReadonlySet<PhonemeSymbolId>;
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
 * 1. No speech heard: `not-heard`. A transcript that hears no speech while the
 *    scorer scored the target counts as no transcript instead: Azure's plain
 *    recognition answers most clips of 650–675 ms with an empty transcript though
 *    the assessment of the same audio heard the word (#384).
 * 2. The scorer found the target word missing: `different-word`.
 * 3. The transcript holds more than one word: `different-word`.
 * 4. The transcript is one word that sounds like the target, or like the target
 *    with one judged sound swapped for a contrast partner (*sheep* for *ship*):
 *    `judged`, since naming that swap is the judge's job.
 * 5. The transcript is one other word: `different-word` only if the scoring agrees
 *    the word was off, with a low word accuracy, or a confident transcript and a
 *    low sound the judge can't call. The transcript alone is never enough: Azure
 *    transcribed a clear *pool* as "pull" and a clear *bat* as "that".
 *
 * A low sound is the judge's to call when it is in the judged set, or, with every
 * sound judged, when a contrast partner or an allowed variant is among the
 * top-scoring sounds there, at or above the target. A low /p/ in *ships* said for
 * *ship*, where /s/ won, still says the word was off, even with /b/ above /p/.
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
	const saysNoSpeech = transcript === null || transcript?.words.length === 0;
	if (saysNoSpeech && !assessmentHeardWord(evidence)) return NOT_HEARD;
	const transcribed = saysNoSpeech ? undefined : transcript;

	const heard = transcribed?.words ?? [];
	const isOneOtherWord =
		heard.length === 1 &&
		!soundsLikeTarget(heard[0], target, judgedPhonemeIds, targetAccent, pronunciationsOf);
	// What was said instead, when the transcript can name it.
	const instead = heard.length > 1 || isOneOtherWord ? heard : [];
	const wordIsOff = (evidence.accuracy ?? 1) < margins.wordAccuracy;

	if (evidence.omitted) return differentWord(instead);
	if (!transcribed) return wordIsOff ? differentWord([]) : JUDGED;
	if (heard.length > 1) return differentWord(heard);
	if (!isOneOtherWord) return JUDGED;

	const isConfident = transcribed.confidence >= margins.transcriptConfidence;
	const uncalledSoundIsOff =
		lowestUncalledSoundAccuracy(evidence, judgedPhonemeIds, targetAccent) < margins.soundAccuracy;
	return wordIsOff || (isConfident && uncalledSoundIsOff) ? differentWord(heard) : JUDGED;
}

function assessmentHeardWord(evidence: WordEvidence): boolean {
	return !evidence.omitted && evidence.pronunciations.length > 0;
}

function soundsLikeTarget(
	word: string,
	target: TargetWord,
	judgedPhonemeIds: ReadonlySet<PhonemeSymbolId> | undefined,
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
	judgedPhonemeIds: ReadonlySet<PhonemeSymbolId> | undefined,
	targetAccent: TargetAccent,
): boolean {
	if (expected.length !== heard.length) return false;
	const differences = expected.flatMap((id, index) => (id === heard[index] ? [] : [index]));
	if (differences.length === 0) return true;
	if (differences.length > 1) return false;
	const [at] = differences;
	return (
		(judgedPhonemeIds?.has(expected[at]) ?? true) &&
		contrastPartners(targetAccent, expected[at]).has(heard[at])
	);
}

/** Over the sounds the judge can't call, scored against the target itself. */
function lowestUncalledSoundAccuracy(
	evidence: WordEvidence,
	judgedPhonemeIds: ReadonlySet<PhonemeSymbolId> | undefined,
	targetAccent: TargetAccent,
): number {
	const sounds = bestFittingPronunciation(evidence.pronunciations)?.sounds ?? [];
	const phonemeIds = sounds.map((sound) => sound.phonemeId);
	let lowest = Number.POSITIVE_INFINITY;
	sounds.forEach((sound, position) => {
		if (sound.type !== "scored" || sound.accuracy === undefined) return;
		const isCalled = judgedPhonemeIds
			? judgedPhonemeIds.has(sound.phonemeId)
			: heardAsPartnerOrVariant(sound, phonemeIds, position, targetAccent);
		if (!isCalled) lowest = Math.min(lowest, sound.accuracy);
	});
	return lowest;
}

function heardAsPartnerOrVariant(
	sound: SoundEvidence,
	phonemeIds: readonly PhonemeSymbolId[],
	position: number,
	targetAccent: TargetAccent,
): boolean {
	const leaders = topRivals(sound.rivals);
	if (leaders.length === 0 || !reaches(leaders[0].score, sound.targetScore)) return false;
	const partners = contrastPartners(targetAccent, sound.phonemeId);
	const variants = allowedVariants(targetAccent, phonemeIds, position);
	return leaders.some((rival) => partners.has(rival.phonemeId) || variants.has(rival.phonemeId));
}
