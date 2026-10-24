import { describe, expect, it, vi } from "vitest";
import { getWordAudioPath } from "../../registries/registries";

vi.mock("../../../data/en/word-audio.json", () => ({
	default: { voice: "jenny", words: ["saw", "seat", "sod"], voices: { guy: ["saw"] } },
}));

describe("getWordAudioPath with a second voice", () => {
	it("plays the words listed under another voice from that voice's folder", () => {
		expect(getWordAudioPath("en-us", "saw")).toBe("audio/en-us/words/guy/saw.ogg");
		expect(getWordAudioPath("en-us", " SAW ")).toBe("audio/en-us/words/guy/saw.ogg");
	});

	it("keeps every other word on the default voice", () => {
		expect(getWordAudioPath("en-us", "seat")).toBe("audio/en-us/words/jenny/seat.ogg");
		expect(getWordAudioPath("en-us", "sod")).toBe("audio/en-us/words/jenny/sod.ogg");
		expect(getWordAudioPath("en-us", "notaword")).toBeNull();
	});
});
