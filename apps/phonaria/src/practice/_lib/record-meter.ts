import { MAX_RECORDING_SECONDS, SPEECH_RMS_THRESHOLD } from "@/lib/recording/voice-activity";

export const LEVEL_BARS = 3;

/**
 * Lit bars for an input level. The first lights at the level the recorder
 * already counts as speech, so a lit bar means "this is being heard".
 */
export function litBars(level: number): number {
	if (level < SPEECH_RMS_THRESHOLD) return 0;
	if (level < SPEECH_RMS_THRESHOLD * 3) return 1;
	if (level < SPEECH_RMS_THRESHOLD * 8) return 2;
	return LEVEL_BARS;
}

/** Share of the time limit used, 0..1. */
export function recordingProgress(elapsedSeconds: number): number {
	return Math.min(1, Math.max(0, elapsedSeconds / MAX_RECORDING_SECONDS));
}

/** "0:02" style, counting whole seconds up to the limit. */
export function formatElapsed(elapsedSeconds: number): string {
	const seconds = Math.min(MAX_RECORDING_SECONDS, Math.max(0, Math.floor(elapsedSeconds)));
	return `0:${String(seconds).padStart(2, "0")}`;
}
