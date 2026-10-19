import { describe, expect, it } from "vitest";
import {
	MAX_RECORDING_SECONDS,
	rootMeanSquare,
	SILENT_START,
	SPEECH_RMS_THRESHOLD,
	shouldStopRecording,
	TRAILING_SILENCE_SECONDS,
	trackVoiceActivity,
	type VoiceActivity,
} from "./voice-activity";

const RATE = 1_000;
const loud = (seconds: number) => new Float32Array(seconds * RATE).fill(SPEECH_RMS_THRESHOLD * 5);
const quiet = (seconds: number) => new Float32Array(seconds * RATE).fill(SPEECH_RMS_THRESHOLD / 5);

function track(...chunks: Float32Array[]): VoiceActivity {
	return chunks.reduce(
		(activity, chunk) => trackVoiceActivity(activity, chunk, RATE),
		SILENT_START,
	);
}

describe("rootMeanSquare", () => {
	it("measures the level of a signal", () => {
		expect(rootMeanSquare(new Float32Array([0.5, -0.5]))).toBeCloseTo(0.5);
		expect(rootMeanSquare(new Float32Array(0))).toBe(0);
	});
});

describe("shouldStopRecording", () => {
	it("keeps recording through silence before speech", () => {
		expect(shouldStopRecording(track(quiet(3)))).toBe(false);
	});

	it("stops after trailing silence once speech has started", () => {
		expect(shouldStopRecording(track(quiet(1), loud(0.5)))).toBe(false);
		expect(shouldStopRecording(track(quiet(1), loud(0.5), quiet(0.5)))).toBe(false);
		expect(shouldStopRecording(track(quiet(1), loud(0.5), quiet(TRAILING_SILENCE_SECONDS)))).toBe(
			true,
		);
	});

	it("restarts the silence count when speech resumes", () => {
		const activity = track(loud(0.5), quiet(0.5), loud(0.2), quiet(0.5));
		expect(activity.silenceSeconds).toBeCloseTo(0.5);
		expect(shouldStopRecording(activity)).toBe(false);
	});

	it("ignores a click too short to be speech", () => {
		expect(shouldStopRecording(track(loud(0.01), quiet(2)))).toBe(false);
	});

	it("stops at the time limit", () => {
		expect(shouldStopRecording(track(loud(MAX_RECORDING_SECONDS - 0.1)))).toBe(false);
		expect(shouldStopRecording(track(loud(MAX_RECORDING_SECONDS)))).toBe(true);
		expect(shouldStopRecording(track(quiet(MAX_RECORDING_SECONDS)))).toBe(true);
	});
});
