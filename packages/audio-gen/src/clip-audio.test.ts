import { describe, expect, it } from "vitest";
import { analyzeClip } from "./clip-audio";

const rate = 24_000;
function clip(parts: { ms: number; amplitude: number }[]): Float32Array {
	const samples: number[] = [];
	for (const { ms, amplitude } of parts) {
		for (let index = 0; index < (rate * ms) / 1000; index++)
			samples.push(amplitude * Math.sin((2 * Math.PI * 220 * index) / rate));
	}
	return Float32Array.from(samples);
}

describe("analyzeClip", () => {
	it("measures the speech between the silences, not the file", () => {
		const audio = analyzeClip(
			clip([
				{ ms: 170, amplitude: 0 },
				{ ms: 500, amplitude: 0.1 },
				{ ms: 1160, amplitude: 0 },
			]),
			rate,
		);
		expect(audio.durationMs).toBeCloseTo(1830);
		expect(audio.leadingSilenceMs).toBe(170);
		expect(audio.speechMs).toBe(500);
		expect(audio.trailingSilenceMs).toBeCloseTo(1160);
		// A sine's RMS is its amplitude over √2: 0.1 is −23 dB.
		expect(audio.speechLevelDb).toBeCloseTo(-23, 0);
		expect(audio.clippedSamples).toBe(0);
	});

	it("counts quiet sounds within range of the loudest as speech", () => {
		const audio = analyzeClip(
			clip([
				{ ms: 150, amplitude: 0 },
				{ ms: 300, amplitude: 0.3 },
				{ ms: 100, amplitude: 0.003 },
				{ ms: 1000, amplitude: 0 },
			]),
			rate,
		);
		expect(audio.speechMs).toBe(400);
	});

	it("finds a word cut off at the end, and clipping", () => {
		const audio = analyzeClip(
			clip([
				{ ms: 150, amplitude: 0 },
				{ ms: 600, amplitude: 1.2 },
			]),
			rate,
		);
		expect(audio.trailingSilenceMs).toBe(0);
		expect(audio.clippedSamples).toBeGreaterThan(100);
		expect(audio.peak).toBeCloseTo(1.2, 1);
	});

	it("reports no speech in silence", () => {
		const audio = analyzeClip(clip([{ ms: 1800, amplitude: 0 }]), rate);
		expect(audio.speechMs).toBe(0);
		expect(audio.speechLevelDb).toBe(-Infinity);
	});
});
