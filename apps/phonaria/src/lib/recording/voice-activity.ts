export const MAX_RECORDING_SECONDS = 5;
/** Root-mean-square level, on a -1..1 signal, above which a stretch of audio counts as speech. */
export const SPEECH_RMS_THRESHOLD = 0.02;
/** Loud audio needed before trailing silence can end a recording, so a click doesn't count as speech. */
const SPEECH_ONSET_SECONDS = 0.1;
export const TRAILING_SILENCE_SECONDS = 0.8;

export type VoiceActivity = {
	readonly elapsedSeconds: number;
	readonly speechSeconds: number;
	/** Quiet time since the last loud stretch. */
	readonly silenceSeconds: number;
};

export const SILENT_START: VoiceActivity = {
	elapsedSeconds: 0,
	speechSeconds: 0,
	silenceSeconds: 0,
};

export function rootMeanSquare(samples: Float32Array): number {
	if (samples.length === 0) return 0;
	let sum = 0;
	for (const sample of samples) sum += sample * sample;
	return Math.sqrt(sum / samples.length);
}

export function trackVoiceActivity(
	activity: VoiceActivity,
	samples: Float32Array,
	sampleRate: number,
): VoiceActivity {
	const seconds = samples.length / sampleRate;
	const loud = rootMeanSquare(samples) >= SPEECH_RMS_THRESHOLD;
	return {
		elapsedSeconds: activity.elapsedSeconds + seconds,
		speechSeconds: loud ? activity.speechSeconds + seconds : activity.speechSeconds,
		silenceSeconds: loud ? 0 : activity.silenceSeconds + seconds,
	};
}

/** True at the time limit, or once speech has started and then gone quiet. */
export function shouldStopRecording(activity: VoiceActivity): boolean {
	if (activity.elapsedSeconds >= MAX_RECORDING_SECONDS) return true;
	return (
		activity.speechSeconds >= SPEECH_ONSET_SECONDS &&
		activity.silenceSeconds >= TRAILING_SILENCE_SECONDS
	);
}
