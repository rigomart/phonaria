import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

/** What the waveform says about a clip, independent of the word. Times in milliseconds. */
export type ClipAudio = {
	readonly durationMs: number;
	/** From the first to the last frame loud enough to be speech; 0 when there is none. */
	readonly speechMs: number;
	readonly leadingSilenceMs: number;
	readonly trailingSilenceMs: number;
	/** RMS level of the speech frames, in dB below full scale. */
	readonly speechLevelDb: number;
	/** The largest absolute sample, where 1 is full scale. */
	readonly peak: number;
	readonly clippedSamples: number;
};

const FRAME_MS = 10;
/** A frame is speech when it is within this many dB of the loudest frame... */
const SPEECH_RANGE_DB = 45;
/** ...and above this absolute level, so a near-silent clip has no speech. */
const SPEECH_FLOOR_DB = -60;
const CLIPPED_LEVEL = 0.999;

const toDb = (rms: number) => (rms > 0 ? 20 * Math.log10(rms) : -Infinity);

/**
 * Azure pads short clips to at least 1.8265 s, so the file's length says little about
 * the word. Speech runs from the first to the last frame near the loudest one.
 */
export function analyzeClip(samples: Float32Array, sampleRate: number): ClipAudio {
	const frameLength = Math.round((sampleRate * FRAME_MS) / 1000);
	const frameCount = Math.floor(samples.length / frameLength);
	const frameSquares: number[] = [];
	let peak = 0;
	let clippedSamples = 0;
	for (let frame = 0; frame < frameCount; frame++) {
		let sum = 0;
		for (let index = frame * frameLength; index < (frame + 1) * frameLength; index++) {
			const value = Math.abs(samples[index]);
			sum += value * value;
			if (value > peak) peak = value;
			if (value >= CLIPPED_LEVEL) clippedSamples++;
		}
		frameSquares.push(sum / frameLength);
	}
	const durationMs = (samples.length / sampleRate) * 1000;
	const levels = frameSquares.map((square) => toDb(Math.sqrt(square)));
	const threshold = Math.max(Math.max(...levels) - SPEECH_RANGE_DB, SPEECH_FLOOR_DB);
	const first = levels.findIndex((level) => level >= threshold);
	if (first === -1) {
		return {
			durationMs,
			speechMs: 0,
			leadingSilenceMs: durationMs,
			trailingSilenceMs: durationMs,
			speechLevelDb: -Infinity,
			peak,
			clippedSamples,
		};
	}
	let last = levels.length - 1;
	while (levels[last] < threshold) last--;
	const speech = frameSquares.slice(first, last + 1).filter((_, index) => {
		return levels[first + index] >= threshold;
	});
	const speechStartMs = first * FRAME_MS;
	const speechEndMs = (last + 1) * FRAME_MS;
	return {
		durationMs,
		speechMs: speechEndMs - speechStartMs,
		leadingSilenceMs: speechStartMs,
		trailingSilenceMs: Math.max(durationMs - speechEndMs, 0),
		speechLevelDb: toDb(Math.sqrt(speech.reduce((sum, square) => sum + square, 0) / speech.length)),
		peak,
		clippedSamples,
	};
}

export const DECODE_SAMPLE_RATE = 24_000;

/** The clip's samples as 32-bit floats at Azure's native 24 kHz, mono, unclamped. */
export async function decodeClip(file: string): Promise<Float32Array> {
	const { stdout } = await run(
		"ffmpeg",
		[
			"-nostdin",
			"-loglevel",
			"error",
			"-i",
			file,
			"-ac",
			"1",
			"-ar",
			String(DECODE_SAMPLE_RATE),
			"-f",
			"f32le",
			"-",
		],
		{ encoding: "buffer", maxBuffer: 64 * 1024 * 1024 },
	);
	const bytes = new Uint8Array(stdout);
	return new Float32Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 4));
}
