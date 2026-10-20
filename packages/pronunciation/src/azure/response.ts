/**
 * The parts of a short-audio REST response (`format=detailed`) the scorer reads.
 * Offsets and durations are in 100-nanosecond ticks; scores are 0..100.
 */
export type AzureAssessmentResponse = {
	readonly RecognitionStatus: string;
	readonly NBest?: readonly AzureRecognition[];
};

/**
 * A plain recognition response: the same endpoint with no assessment header.
 * `RecognitionStatus` is `Success`, or `NoMatch`, `InitialSilenceTimeout` or
 * `BabbleTimeout` when Azure heard no speech it could transcribe.
 */
export type AzureRecognitionResponse = AzureAssessmentResponse;

export type AzureRecognition = {
	/**
	 * The words recognized, lowercase and spelled out, e.g. `the ship is`. Read from
	 * plain recognition only: an assessment steers it towards the reference text.
	 */
	readonly Lexical?: string;
	/** 0..1, for `Lexical`. */
	readonly Confidence?: number;
	readonly Words?: readonly AzureWord[];
};

export type AzureWord = {
	readonly Word: string;
	/** `None`, `Mispronunciation`, `Omission` or `Insertion`. */
	readonly ErrorType?: string;
	/** How well the audio fits the word, absolute. */
	readonly AccuracyScore?: number;
	readonly Phonemes?: readonly AzurePhoneme[];
};

export type AzurePhoneme = {
	/** The phoneme Azure expected from its own lexicon, not the one it heard. */
	readonly Phoneme: string;
	readonly Offset: number;
	readonly Duration: number;
	/** How well the audio fits `Phoneme`. */
	readonly AccuracyScore: number;
	/** The phonemes that best fit the audio, best first. The top one always scores 100. */
	readonly NBestPhonemes?: readonly AzureNBestPhoneme[];
};

export type AzureNBestPhoneme = {
	readonly Phoneme: string;
	readonly Score: number;
};
