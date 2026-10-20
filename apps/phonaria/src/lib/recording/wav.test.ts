import { describe, expect, it } from "vitest";
import { encodeWav, readWavFormat, WAV_HEADER_BYTES } from "./wav";

function ascii(bytes: Uint8Array, offset: number, length: number): string {
	return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

describe("encodeWav", () => {
	const samples = new Float32Array([0, 0.5, -0.5, 1, -1, 2, -2]);
	const wav = encodeWav(samples);
	const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);

	it("writes a 16 kHz mono 16-bit PCM header", () => {
		expect(ascii(wav, 0, 4)).toBe("RIFF");
		expect(view.getUint32(4, true)).toBe(wav.length - 8);
		expect(ascii(wav, 8, 4)).toBe("WAVE");
		expect(ascii(wav, 12, 4)).toBe("fmt ");
		expect(view.getUint32(16, true)).toBe(16);
		expect(view.getUint16(20, true)).toBe(1);
		expect(view.getUint16(22, true)).toBe(1);
		expect(view.getUint32(24, true)).toBe(16_000);
		expect(view.getUint32(28, true)).toBe(32_000);
		expect(view.getUint16(32, true)).toBe(2);
		expect(view.getUint16(34, true)).toBe(16);
		expect(ascii(wav, 36, 4)).toBe("data");
	});

	it("holds two bytes per sample after the header", () => {
		expect(view.getUint32(40, true)).toBe(samples.length * 2);
		expect(wav).toHaveLength(WAV_HEADER_BYTES + samples.length * 2);
	});

	it("scales samples to 16-bit and clips the ones out of range", () => {
		const pcm = Array.from(samples, (_, i) => view.getInt16(WAV_HEADER_BYTES + i * 2, true));
		expect(pcm).toEqual([0, 16_384, -16_384, 32_767, -32_768, 32_767, -32_768]);
	});

	it("encodes an empty recording as a header alone", () => {
		const empty = encodeWav(new Float32Array(0));
		expect(empty).toHaveLength(WAV_HEADER_BYTES);
		expect(new DataView(empty.buffer).getUint32(40, true)).toBe(0);
	});
});

function riff(...chunks: [string, Uint8Array][]): Uint8Array {
	const parts = chunks.flatMap(([id, body]) => {
		const header = new Uint8Array(8);
		header.set(Array.from(id, (char) => char.charCodeAt(0)));
		new DataView(header.buffer).setUint32(4, body.length, true);
		return body.length % 2 ? [header, body, new Uint8Array(1)] : [header, body];
	});
	const bytes = new Uint8Array(12 + parts.reduce((total, part) => total + part.length, 0));
	bytes.set(Array.from("RIFF", (char) => char.charCodeAt(0)));
	new DataView(bytes.buffer).setUint32(4, bytes.length - 8, true);
	bytes.set(
		Array.from("WAVE", (char) => char.charCodeAt(0)),
		8,
	);
	let offset = 12;
	for (const part of parts) {
		bytes.set(part, offset);
		offset += part.length;
	}
	return bytes;
}

function fmt(audioFormat: number, channels: number, sampleRate: number, bits: number): Uint8Array {
	const body = new Uint8Array(16);
	const view = new DataView(body.buffer);
	view.setUint16(0, audioFormat, true);
	view.setUint16(2, channels, true);
	view.setUint32(4, sampleRate, true);
	view.setUint32(8, (sampleRate * channels * bits) / 8, true);
	view.setUint16(12, (channels * bits) / 8, true);
	view.setUint16(14, bits, true);
	return body;
}

describe("readWavFormat", () => {
	it("reads back what encodeWav writes", () => {
		expect(readWavFormat(encodeWav(new Float32Array(100)))).toEqual({
			audioFormat: 1,
			channels: 1,
			sampleRate: 16_000,
			bitsPerSample: 16,
			dataBytes: 200,
		});
	});

	it("skips other chunks, including odd-sized ones", () => {
		const wav = riff(
			["fmt ", fmt(1, 2, 44_100, 24)],
			["LIST", new Uint8Array(7)],
			["data", new Uint8Array(12)],
		);
		expect(readWavFormat(wav)).toEqual({
			audioFormat: 1,
			channels: 2,
			sampleRate: 44_100,
			bitsPerSample: 24,
			dataBytes: 12,
		});
	});

	it("rejects bytes that aren't a RIFF WAVE file", () => {
		expect(readWavFormat(new Uint8Array(0))).toBeNull();
		expect(readWavFormat(new TextEncoder().encode("OggS not a wav file at all"))).toBeNull();
	});

	it("rejects a file with no format before its data", () => {
		expect(readWavFormat(riff(["data", new Uint8Array(4)]))).toBeNull();
		expect(readWavFormat(riff(["fmt ", fmt(1, 1, 16_000, 16)]))).toBeNull();
	});

	it("reads a file with a LIST chunk before its data, as ffmpeg writes it", () => {
		const software = [...charCodes("INFOISFT"), 13, 0, 0, 0, ...charCodes("Lavf61.7.100"), 0, 0];
		const wav = riff(
			["fmt ", fmt(1, 1, 16_000, 16)],
			["LIST", new Uint8Array(software)],
			["data", new Uint8Array(320)],
		);
		expect(readWavFormat(wav)).toMatchObject({ sampleRate: 16_000, dataBytes: 320 });
	});

	it("rejects a data size smaller than the audio that follows it", () => {
		const wav = encodeWav(new Float32Array(16_000).fill(0.1));
		setUint32(wav, 40, 3_200);
		expect(readWavFormat(wav)).toBeNull();
	});

	it("rejects a data size larger than the audio present", () => {
		const wav = encodeWav(new Float32Array(100));
		setUint32(wav, 40, 202);
		expect(readWavFormat(wav)).toBeNull();
	});

	it("rejects a RIFF size that doesn't match the file", () => {
		for (const size of [0, 200, 1_000]) {
			const wav = encodeWav(new Float32Array(100));
			setUint32(wav, 4, size);
			expect(readWavFormat(wav), String(size)).toBeNull();
		}
		const wav = encodeWav(new Float32Array(100));
		expect(readWavFormat(wav.subarray(0, wav.length - 1))).toBeNull();
	});

	it("rejects a truncated chunk after the data", () => {
		const whole = riff(
			["fmt ", fmt(1, 1, 16_000, 16)],
			["data", new Uint8Array(4)],
			["LIST", new Uint8Array(10)],
		);
		for (const cut of [3, 14]) {
			const truncated = whole.slice(0, whole.length - cut);
			setUint32(truncated, 4, truncated.length - 8);
			expect(readWavFormat(truncated), String(cut)).toBeNull();
		}
	});

	it("rejects data that isn't a whole number of sample frames", () => {
		expect(
			readWavFormat(riff(["fmt ", fmt(1, 1, 16_000, 16)], ["data", new Uint8Array(3)])),
		).toBeNull();
		expect(
			readWavFormat(riff(["fmt ", fmt(1, 2, 16_000, 16)], ["data", new Uint8Array(6)])),
		).toBeNull();
	});

	it("rejects a format whose frame size or byte rate disagrees with it", () => {
		const blockAlign = fmt(1, 1, 16_000, 16);
		new DataView(blockAlign.buffer).setUint16(12, 4, true);
		const byteRate = fmt(1, 1, 16_000, 16);
		new DataView(byteRate.buffer).setUint32(8, 44_100, true);
		for (const format of [blockAlign, byteRate]) {
			expect(readWavFormat(riff(["fmt ", format], ["data", new Uint8Array(4)]))).toBeNull();
		}
	});
});

function charCodes(text: string): number[] {
	return Array.from(text, (char) => char.charCodeAt(0));
}

function setUint32(bytes: Uint8Array, offset: number, value: number) {
	new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).setUint32(offset, value, true);
}
