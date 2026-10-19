/** The rate the pronunciation scorer expects. */
export const SCORER_SAMPLE_RATE = 16_000;

/** Averages the channels of one stretch of audio into a single channel. */
export function mixToMono(channels: readonly Float32Array[]): Float32Array {
	const first = channels[0];
	if (!first) return new Float32Array(0);
	if (channels.length === 1) return first.slice();

	const mono = new Float32Array(first.length);
	for (const channel of channels) {
		for (let i = 0; i < mono.length; i++) mono[i] += channel[i] ?? 0;
	}
	for (let i = 0; i < mono.length; i++) mono[i] /= channels.length;
	return mono;
}

/**
 * Resamples mono audio at `sampleRate` to 16 kHz. Downsampling averages the
 * input samples each output sample covers, which also filters out most of
 * what would alias; upsampling interpolates linearly.
 */
export function resampleTo16k(samples: Float32Array, sampleRate: number): Float32Array {
	if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
		throw new RangeError(`Invalid sample rate: ${sampleRate}`);
	}
	if (sampleRate === SCORER_SAMPLE_RATE) return samples.slice();

	const ratio = sampleRate / SCORER_SAMPLE_RATE;
	const output = new Float32Array(Math.round(samples.length / ratio));

	if (ratio > 1) {
		for (let i = 0; i < output.length; i++) {
			const start = Math.floor(i * ratio);
			const end = Math.min(samples.length, Math.max(start + 1, Math.floor((i + 1) * ratio)));
			let sum = 0;
			for (let j = start; j < end; j++) sum += samples[j];
			output[i] = sum / (end - start);
		}
		return output;
	}

	for (let i = 0; i < output.length; i++) {
		const position = i * ratio;
		const index = Math.floor(position);
		const next = Math.min(index + 1, samples.length - 1);
		const fraction = position - index;
		output[i] = samples[index] * (1 - fraction) + samples[next] * fraction;
	}
	return output;
}
