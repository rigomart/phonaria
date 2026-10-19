import type { PhonemeSymbolId, TargetAccent } from "@phonaria/phonetics-data";

/** The bytes of a 16 kHz, mono, 16-bit PCM WAV file, header included. */
export type WavAudio = Uint8Array;

export type ScoringRequest = {
	readonly targetAccent: TargetAccent;
	readonly word: string;
	/** Base phoneme IDs without stress, one array per accepted pronunciation. */
	readonly acceptedPronunciations: readonly (readonly PhonemeSymbolId[])[];
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
	/** Position of this pronunciation in the request's `acceptedPronunciations`. */
	readonly pronunciationIndex: number;
	/** One entry per sound of the pronunciation, in order. */
	readonly sounds: readonly (SoundEvidence | MissingSoundEvidence)[];
};

export type WordEvidence = {
	/** Only the accepted pronunciations the scorer could line up. */
	readonly pronunciations: readonly PronunciationEvidence[];
};

/** Reports evidence only; the judge decides verdicts. */
export interface Scorer {
	score(audio: WavAudio, request: ScoringRequest): Promise<WordEvidence>;
}

export type SoundVerdict =
	| { readonly type: "match" }
	| { readonly type: "swapped"; readonly heard: PhonemeSymbolId }
	| { readonly type: "unclear" };
