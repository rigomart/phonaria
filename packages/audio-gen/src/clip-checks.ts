import { getIpaForPhonemeId, isVowelPhoneme, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import {
	judgeWord,
	type PronunciationLookup,
	type RecordingEvidence,
	type Transcript,
	type WordFinder,
	type WordJudgement,
} from "@phonaria/pronunciation";
import type { ClipAudio } from "./clip-audio";

export const checkNames = [
	"word-heard",
	"no-swapped-sound",
	"word-accuracy",
	"duration",
	"edges",
	"loudness",
	"clipping",
] as const;
export type CheckName = (typeof checkNames)[number];

/**
 * The audio limits fit the 809 published clips (all reviewed by ear), none of which fails
 * an audio check; the word accuracy cutoff fits the #353 probes.
 */
export const CLIP_CHECK_LIMITS = {
	/** Azure's whole-word accuracy, 0..1. */
	wordAccuracy: 0.8,
	/** Speech length over the length its sound count predicts; published clips span 0.71–1.40. */
	speechRatio: { min: 0.65, max: 1.5 },
	/** Published clips start speaking after 150–190 ms and leave at least 900 ms after. */
	leadingSilenceMs: 100,
	trailingSilenceMs: 300,
	/** Speech level from the batch's median; published clips span ±4 dB. */
	loudnessRangeDb: 5,
	/** Opus overshoots full scale on a sample or two; one published clip has 2. */
	clippedSamples: 5,
} as const;

/** Fitted on the published clips. */
function expectedSpeechMs(soundCount: number): number {
	return 279 + 60 * soundCount;
}

export type ClipTarget = {
	readonly word: string;
	/** The clip's own pronunciation as base phoneme IDs, so a heteronym's second form is judged against itself. */
	readonly pronunciation: readonly PhonemeSymbolId[];
};

export type ClipScore = {
	readonly transcript: Transcript | null | undefined;
	readonly wordAccuracy: number | undefined;
	readonly judgement: WordJudgement | null;
};

export type CheckResult = { readonly passed: boolean; readonly detail: string };
export type ClipChecks = Partial<Record<CheckName, CheckResult>>;

const MAX_TRANSCRIPT_READINGS = 256;

/**
 * The transcript says the target: the same word, or words that together sound like the
 * clip's own pronunciation (*red* for *read* said /ɹɛd/, *every one* for *everyone*).
 * Between vowels /t/ and /d/ count as one sound, since both are tapped: *writing* and
 * *riding* sound alike.
 */
export function hearsTarget(
	transcript: Transcript | null | undefined,
	target: ClipTarget,
	pronunciationsOf: PronunciationLookup,
): boolean {
	if (!transcript?.words.length) return false;
	if (transcript.words.join("") === target.word) return true;
	const goal = tapped(target.pronunciation).join(" ");
	return (transcriptReadings(transcript.words, pronunciationsOf) ?? []).some(
		(reading) => tapped(reading).join(" ") === goal,
	);
}

/**
 * Every way the dictionary lets the words be said, run together; none when a word isn't
 * in it or the words have too many readings.
 */
export function transcriptReadings(
	words: readonly string[],
	pronunciationsOf: PronunciationLookup,
): PhonemeSymbolId[][] | undefined {
	let readings: PhonemeSymbolId[][] = [[]];
	for (const word of words) {
		const options = pronunciationsOf(word);
		if (!options?.length) return undefined;
		readings = readings.flatMap((reading) => options.map((option) => [...reading, ...option]));
		if (readings.length > MAX_TRANSCRIPT_READINGS) return undefined;
	}
	return readings;
}

/** /d/ between vowels as /t/, since both are tapped there. */
export const tapped = (ids: readonly PhonemeSymbolId[]): PhonemeSymbolId[] =>
	ids.map((id, index) =>
		id === "D" && isVowelPhoneme(ids[index - 1] ?? "P") && isVowelPhoneme(ids[index + 1] ?? "P")
			? "T"
			: id,
	);

/** Azure's answer for a one-word clip, with every sound judged against the clip's own pronunciation. */
export function scoreFromEvidence(evidence: RecordingEvidence, findWord?: WordFinder): ClipScore {
	const [word] = evidence.words;
	return {
		transcript: evidence.transcript,
		wordAccuracy: word?.accuracy,
		judgement: word ? judgeWord({ evidence: word, targetAccent: "en-us", findWord }) : null,
	};
}

const ipa = (id: PhonemeSymbolId) => `/${getIpaForPhonemeId(id) ?? id}/`;
const round = (value: number, digits = 2) => Number(value.toFixed(digits));

export function scoreChecks(
	score: ClipScore,
	target: ClipTarget,
	pronunciationsOf: PronunciationLookup,
	limits = CLIP_CHECK_LIMITS,
): ClipChecks {
	const heard = score.transcript?.words.join(" ") ?? "no speech";
	const swapped = (score.judgement?.sounds ?? []).flatMap(({ phonemeId, verdict }) =>
		verdict.type === "swapped"
			? [
					`${ipa(phonemeId)} heard as ${ipa(verdict.heard)}${verdict.heardWord ? ` (${verdict.heardWord})` : ""}`,
				]
			: [],
	);
	const accuracy = score.wordAccuracy;
	return {
		"word-heard": {
			passed: hearsTarget(score.transcript, target, pronunciationsOf),
			// `heardWords` reads this back from checks.json.
			detail: score.transcript
				? `heard "${heard}" at ${round(score.transcript.confidence)}`
				: heard,
		},
		"no-swapped-sound": score.judgement
			? { passed: swapped.length === 0, detail: swapped.join("; ") || "none swapped" }
			: { passed: false, detail: "no sound lined up" },
		"word-accuracy": {
			passed: accuracy !== undefined && accuracy >= limits.wordAccuracy,
			detail: accuracy === undefined ? "no word score" : `${round(accuracy)}`,
		},
	};
}

/** The words recognition heard, from a saved word-heard check: none for no speech. */
export function heardWords(check: CheckResult): string[] {
	if (check.detail === "no speech") return [];
	const heard = /^heard "(.*)" at [\d.]+$/.exec(check.detail);
	if (!heard) throw new Error(`Unexpected word-heard detail: ${check.detail}`);
	return heard[1].split(" ").filter(Boolean);
}

/** `batchLevelDb` is the median speech level of the clips checked together. */
export function audioChecks(
	audio: ClipAudio,
	soundCount: number,
	batchLevelDb: number,
	limits = CLIP_CHECK_LIMITS,
): ClipChecks {
	const expected = expectedSpeechMs(soundCount);
	const ratio = audio.speechMs / expected;
	const levelOffset = audio.speechLevelDb - batchLevelDb;
	return {
		duration: {
			passed: ratio >= limits.speechRatio.min && ratio <= limits.speechRatio.max,
			detail: `${audio.speechMs} ms of speech, ${round(ratio)}× the ${expected} ms expected`,
		},
		edges: {
			passed:
				audio.speechMs > 0 &&
				audio.leadingSilenceMs >= limits.leadingSilenceMs &&
				audio.trailingSilenceMs >= limits.trailingSilenceMs,
			detail: `${audio.leadingSilenceMs} ms before, ${Math.round(audio.trailingSilenceMs)} ms after`,
		},
		loudness: {
			passed: Math.abs(levelOffset) <= limits.loudnessRangeDb,
			detail: `${round(audio.speechLevelDb, 1)} dB, ${levelOffset >= 0 ? "+" : ""}${round(levelOffset, 1)} from the batch`,
		},
		clipping: {
			passed: audio.clippedSamples < limits.clippedSamples,
			detail: `${audio.clippedSamples} samples at full scale, peak ${round(audio.peak, 3)}`,
		},
	};
}

export const failedChecks = (checks: ClipChecks): CheckName[] =>
	checkNames.filter((name) => checks[name]?.passed === false);

export function median(values: readonly number[]): number {
	const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
	if (!sorted.length) return Number.NaN;
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
