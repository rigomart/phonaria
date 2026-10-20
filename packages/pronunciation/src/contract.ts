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
};

export type RecordingEvidence = {
	/** One entry per target word, in the request's order. */
	readonly words: readonly WordEvidence[];
};

/** Reports evidence only; the judge decides verdicts. */
export interface Scorer {
	score(audio: WavAudio, request: ScoringRequest): Promise<RecordingEvidence>;
}

export type SoundVerdict =
	| { readonly type: "match" }
	| { readonly type: "swapped"; readonly heard: PhonemeSymbolId }
	| { readonly type: "unclear" };
