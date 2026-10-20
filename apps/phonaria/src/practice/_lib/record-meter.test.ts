import { describe, expect, it } from "vitest";
import { MAX_RECORDING_SECONDS, SPEECH_RMS_THRESHOLD } from "@/lib/recording/voice-activity";
import { formatElapsed, LEVEL_BARS, litBars, recordingProgress } from "./record-meter";

describe("litBars", () => {
	it("lights nothing below the level the recorder counts as speech", () => {
		expect(litBars(0)).toBe(0);
		expect(litBars(SPEECH_RMS_THRESHOLD * 0.9)).toBe(0);
	});

	it("lights more bars for louder input, up to all of them", () => {
		expect(litBars(SPEECH_RMS_THRESHOLD)).toBe(1);
		expect(litBars(0.1)).toBe(2);
		expect(litBars(0.4)).toBe(LEVEL_BARS);
		expect(litBars(1)).toBe(LEVEL_BARS);
	});
});

describe("recordingProgress", () => {
	it("runs from 0 to 1 over the time limit and stays inside it", () => {
		expect(recordingProgress(0)).toBe(0);
		expect(recordingProgress(MAX_RECORDING_SECONDS / 2)).toBe(0.5);
		expect(recordingProgress(MAX_RECORDING_SECONDS + 1)).toBe(1);
		expect(recordingProgress(-1)).toBe(0);
	});
});

describe("formatElapsed", () => {
	it("counts whole seconds up to the limit", () => {
		expect(formatElapsed(0)).toBe("0:00");
		expect(formatElapsed(2.7)).toBe("0:02");
		expect(formatElapsed(MAX_RECORDING_SECONDS + 3)).toBe(`0:0${MAX_RECORDING_SECONDS}`);
	});
});
