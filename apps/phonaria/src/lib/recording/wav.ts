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

export type WavFormat = {
	/** 1 is integer PCM. */
	readonly audioFormat: number;
	readonly channels: number;
	readonly sampleRate: number;
	readonly bitsPerSample: number;
	readonly dataBytes: number;
};

/**
 * Reads the format and data size of a RIFF WAVE file. Returns null unless the whole
 * file is well formed: the RIFF size matches the bytes, every chunk fits with its
 * padding, one `fmt ` comes before one `data`, and the data is whole sample frames.
 * So `dataBytes` is always the audio actually present, never a size the header claims.
 */
export function readWavFormat(bytes: Uint8Array): WavFormat | null {
	if (bytes.length < 12 || readAscii(bytes, 0) !== "RIFF" || readAscii(bytes, 8) !== "WAVE") {
		return null;
	}
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	if (view.getUint32(4, true) !== bytes.length - 8) return null;

	let format: Omit<WavFormat, "dataBytes"> | null = null;
	let dataBytes: number | null = null;
	let offset = 12;
	while (offset < bytes.length) {
		if (offset + 8 > bytes.length) return null;
		const id = readAscii(bytes, offset);
		if (!CHUNK_ID.test(id)) return null;
		const size = view.getUint32(offset + 4, true);
		const body = offset + 8;
		// Chunks are padded to an even length.
		const next = body + size + (size % 2);
		if (next > bytes.length) return null;
		if (id === "fmt ") {
			if (format || dataBytes !== null || size < 16) return null;
			format = readFmt(view, body);
			if (!format) return null;
		} else if (id === "data") {
			if (!format || dataBytes !== null) return null;
			dataBytes = size;
		}
		offset = next;
	}
	if (!format || dataBytes === null) return null;
	if (dataBytes % ((format.channels * format.bitsPerSample) / 8) !== 0) return null;
	return { ...format, dataBytes };
}

const CHUNK_ID = /^[ -~]{4}$/;

function readFmt(view: DataView, body: number): Omit<WavFormat, "dataBytes"> | null {
	const channels = view.getUint16(body + 2, true);
	const sampleRate = view.getUint32(body + 4, true);
	const byteRate = view.getUint32(body + 8, true);
	const blockAlign = view.getUint16(body + 12, true);
	const bitsPerSample = view.getUint16(body + 14, true);
	if (channels === 0 || sampleRate === 0 || bitsPerSample === 0 || bitsPerSample % 8 !== 0) {
		return null;
	}
	if (blockAlign !== (channels * bitsPerSample) / 8 || byteRate !== sampleRate * blockAlign) {
		return null;
	}
	return { audioFormat: view.getUint16(body, true), channels, sampleRate, bitsPerSample };
}

function readAscii(bytes: Uint8Array, offset: number): string {
	return String.fromCharCode(...bytes.subarray(offset, offset + 4));
}
