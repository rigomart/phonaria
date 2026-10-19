import { useEffect, useState, useSyncExternalStore } from "react";
import { createWavRecorder, type WavRecorderState } from "@/lib/recording/wav-recorder";

export type { WavRecorderState };

/**
 * Records the learner as 16 kHz mono WAV for the pronunciation scorer. Stops on
 * its own at the time limit or after trailing silence, and releases the
 * microphone on stop and on unmount. Sending the audio is the caller's job.
 */
export function useWavRecorder() {
	const [recorder] = useState(createWavRecorder);
	const state = useSyncExternalStore(recorder.subscribe, recorder.getState, recorder.getState);

	useEffect(() => recorder.cancel, [recorder]);

	return { state, start: recorder.start, stop: recorder.stop, cancel: recorder.cancel };
}
