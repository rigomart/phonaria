/**
 * The parts of a short-audio REST response (`format=detailed`) the scorer reads.
 * Offsets and durations are in 100-nanosecond ticks; scores are 0..100.
 */
export type AzureAssessmentResponse = {
	readonly RecognitionStatus: string;
	readonly NBest?: readonly AzureRecognition[];
};

export type AzureRecognition = {
	readonly Words?: readonly AzureWord[];
};

export type AzureWord = {
	readonly Word: string;
	/** `None`, `Mispronunciation`, `Omission` or `Insertion`. */
	readonly ErrorType?: string;
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
