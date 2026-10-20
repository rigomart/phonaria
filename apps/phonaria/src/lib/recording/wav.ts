import type { WavAudio } from "@phonaria/pronunciation";
import { SCORER_SAMPLE_RATE } from "./resample";

export const WAV_HEADER_BYTES = 44;
const BYTES_PER_SAMPLE = 2;

/** Encodes 16 kHz mono samples in -1..1 as a 16-bit PCM WAV file. Samples outside the range are clipped. */
export function encodeWav(samples: Float32Array): WavAudio {
	const dataBytes = samples.length * BYTES_PER_SAMPLE;
	const bytes = new Uint8Array(WAV_HEADER_BYTES + dataBytes);
	const view = new DataView(bytes.buffer);

	writeAscii(view, 0, "RIFF");
	view.setUint32(4, WAV_HEADER_BYTES - 8 + dataBytes, true);
	writeAscii(view, 8, "WAVE");
	writeAscii(view, 12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, SCORER_SAMPLE_RATE, true);
	view.setUint32(28, SCORER_SAMPLE_RATE * BYTES_PER_SAMPLE, true);
	view.setUint16(32, BYTES_PER_SAMPLE, true);
	view.setUint16(34, BYTES_PER_SAMPLE * 8, true);
	writeAscii(view, 36, "data");
	view.setUint32(40, dataBytes, true);

	for (let i = 0; i < samples.length; i++) {
		const sample = Math.max(-1, Math.min(1, samples[i] || 0));
		view.setInt16(
			WAV_HEADER_BYTES + i * BYTES_PER_SAMPLE,
			Math.round(sample < 0 ? sample * 0x8000 : sample * 0x7fff),
			true,
		);
	}
	return bytes;
}

function writeAscii(view: DataView, offset: number, text: string) {
	for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
}
