import type { PhonemeSymbolId, TargetAccent } from "@phonaria/phonetics-data";

/** The bytes of a 16 kHz, mono, 16-bit PCM WAV file, header included. */
export type WavAudio = Uint8Array<ArrayBuffer>;

export type TargetWord = {
	readonly text: string;
	/** Base phoneme IDs without stress, one array per accepted pronunciation. */
	readonly acceptedPronunciations: readonly (readonly PhonemeSymbolId[])[];
};

/** One recording of the target words, said in order. A single word is a list of one. */
export type ScoringRequest = {
	readonly targetAccent: TargetAccent;
	readonly words: readonly TargetWord[];
};

/**
 * Every score is normalized to 0..1, higher meaning the audio fits that phoneme
 * better. Scores from different scorers are not comparable.
 */
export type RivalScore = {
	readonly phonemeId: PhonemeSymbolId;
	readonly score: number;
};

export type SoundEvidence = {
	readonly type: "scored";
	readonly phonemeId: PhonemeSymbolId;
	readonly startSeconds: number;
	readonly endSeconds: number;
	readonly targetScore: number;
	/** Other phonemes the scorer weighed for this span, never the target itself. */
	readonly rivals: readonly RivalScore[];
	/**
	 * How well the audio fits the target on its own, 0..1, where `targetScore` only
	 * ranks it against rivals. Absent when the scorer can't rate the target alone.
	 */
	readonly accuracy?: number;
};

/** A sound the scorer could not line up with the audio. */
export type MissingSoundEvidence = {
	readonly type: "missing";
	readonly phonemeId: PhonemeSymbolId;
};

export type PronunciationEvidence = {
	/** Position of this pronunciation in its target word's `acceptedPronunciations`. */
	readonly pronunciationIndex: number;
	/** One entry per sound of the pronunciation, in order. */
	readonly sounds: readonly (SoundEvidence | MissingSoundEvidence)[];
};

export type WordEvidence = {
	/** Only the accepted pronunciations the scorer could line up. Empty when the word wasn't heard. */
	readonly pronunciations: readonly PronunciationEvidence[];
	/** How well the audio fits the whole word, 0..1. Absent when the scorer gives no word score. */
	readonly accuracy?: number;
	/** The scorer found the recording doesn't hold this word, as opposed to having no evidence. */
	readonly omitted?: boolean;
};

/** What a recognizer heard with no target words to steer it. */
export type Transcript = {
	/** Lowercase words in the order said, without punctuation. Never empty. */
	readonly words: readonly string[];
	/** The recognizer's confidence in the whole transcript, 0..1. */
	readonly confidence: number;
};

export type RecordingEvidence = {
	/** One entry per target word, in the request's order. */
	readonly words: readonly WordEvidence[];
	/**
	 * What was said, transcribed independently of the target words. `null` when the
	 * recognizer heard no speech; absent when the scorer doesn't transcribe.
	 */
	readonly transcript?: Transcript | null;
	/** Words the scorer heard besides the target words. Absent when it doesn't look for them. */
	readonly insertedWords?: readonly string[];
};

/** Reports evidence only; the judge decides verdicts. */
export interface Scorer {
	score(audio: WavAudio, request: ScoringRequest): Promise<RecordingEvidence>;
}

export type SoundVerdict =
	| { readonly type: "match" }
	| { readonly type: "swapped"; readonly heard: PhonemeSymbolId }
	| { readonly type: "unclear"; readonly reason: UnclearReason };

/**
 * Why the judge didn't decide: `no-evidence` when the scorer couldn't line the
 * sound up, `close-call` when the target and a contrast partner are too close to
 * call, `other-sound` when a sound outside the contrast came out on top, the top
 * was a tie, or the target scored low with no rivals reported.
 */
export type UnclearReason = "no-evidence" | "close-call" | "other-sound";
