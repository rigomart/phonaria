import { describe, expect, it } from "vitest";
import { mixToMono, resampleTo16k, SCORER_SAMPLE_RATE } from "./resample";

function tone(seconds: number, sampleRate: number, frequency: number): Float32Array {
	const samples = new Float32Array(Math.round(seconds * sampleRate));
	for (let i = 0; i < samples.length; i++) {
		samples[i] = 0.5 * Math.sin((2 * Math.PI * frequency * i) / sampleRate);
	}
	return samples;
}

describe("mixToMono", () => {
	it("averages the channels sample by sample", () => {
		const mono = mixToMono([new Float32Array([1, 0.5, -1]), new Float32Array([0, 0.5, 1])]);
		expect(Array.from(mono)).toEqual([0.5, 0.5, 0]);
	});

	it("copies a single channel", () => {
		const channel = new Float32Array([0.25, -0.25]);
		const mono = mixToMono([channel]);
		expect(Array.from(mono)).toEqual([0.25, -0.25]);
		expect(mono).not.toBe(channel);
	});

	it("returns no samples for no channels", () => {
		expect(mixToMono([])).toHaveLength(0);
	});
});

describe("resampleTo16k", () => {
	it.each([8_000, 16_000, 22_050, 44_100, 48_000, 96_000])(
		"keeps one second at %i Hz one second long at 16 kHz",
		(sampleRate) => {
			const output = resampleTo16k(new Float32Array(sampleRate), sampleRate);
			expect(output).toHaveLength(SCORER_SAMPLE_RATE);
		},
	);

	it("scales length with duration", () => {
		expect(resampleTo16k(new Float32Array(48_000 * 2.5), 48_000)).toHaveLength(40_000);
		expect(resampleTo16k(new Float32Array(441), 44_100)).toHaveLength(160);
	});

	it("keeps a constant level", () => {
		for (const sampleRate of [8_000, 44_100, 48_000]) {
			const output = resampleTo16k(new Float32Array(sampleRate).fill(0.3), sampleRate);
			for (const sample of output) expect(sample).toBeCloseTo(0.3, 6);
		}
	});

	it("keeps a tone at its pitch", () => {
		const frequency = 440;
		const output = resampleTo16k(tone(1, 48_000, frequency), 48_000);
		let crossings = 0;
		for (let i = 1; i < output.length; i++) {
			if (output[i - 1] < 0 && output[i] >= 0) crossings++;
		}
		expect(crossings).toBeGreaterThanOrEqual(frequency - 1);
		expect(crossings).toBeLessThanOrEqual(frequency + 1);
	});

	it("interpolates between samples when upsampling", () => {
		expect(Array.from(resampleTo16k(new Float32Array([0, 1, 0]), 8_000))).toEqual([
			0, 0.5, 1, 0.5, 0, 0,
		]);
	});

	it("returns a copy at 16 kHz", () => {
		const input = new Float32Array([0.1, 0.2]);
		const output = resampleTo16k(input, 16_000);
		expect(output).toEqual(input);
		expect(output).not.toBe(input);
	});

	it("returns no samples for no input", () => {
		expect(resampleTo16k(new Float32Array(0), 48_000)).toHaveLength(0);
	});

	it("rejects a rate that is not positive", () => {
		expect(() => resampleTo16k(new Float32Array(1), 0)).toThrow(RangeError);
		expect(() => resampleTo16k(new Float32Array(1), Number.NaN)).toThrow(RangeError);
	});
});
