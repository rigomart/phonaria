import { describe, expect, it } from "vitest";
import { encodeWav, WAV_HEADER_BYTES } from "./wav";

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
