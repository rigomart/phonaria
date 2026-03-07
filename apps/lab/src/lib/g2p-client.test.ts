import { describe, expect, it } from "vitest";
import type { G2PResponse } from "./g2p/model";
import { transformToTranscriptionResult } from "./g2p-client";

describe("transformToTranscriptionResult", () => {
	it("transforms a single word with known phonemes", () => {
		const response: G2PResponse = {
			words: [
				{
					word: "the",
					variants: [
						[
							{
								phonemes: [
									{ ipa: "ð", phonemeId: "DH", cmuToken: "DH" },
									{ ipa: "ə", phonemeId: "AX", cmuToken: "AX0" },
								],
								stress: "none",
							},
						],
					],
					source: "cmudict",
				},
			],
		};

		const result = transformToTranscriptionResult(response, "the");

		expect(result.originalText).toBe("the");
		expect(result.words).toHaveLength(1);
		expect(result.words[0].word).toBe("the");
		expect(result.words[0].wordIndex).toBe(0);
		expect(result.words[0].selectedVariantIndex).toBe(0);
		expect(result.words[0].source).toBe("cmudict");
		expect(result.timestamp).toBeInstanceOf(Date);
	});

	it("maps known phonemes with IPA symbols", () => {
		const response: G2PResponse = {
			words: [
				{
					word: "the",
					variants: [
						[
							{
								phonemes: [{ ipa: "ð", phonemeId: "DH", cmuToken: "DH" }],
								stress: "none",
							},
						],
					],
					source: "cmudict",
				},
			],
		};

		const result = transformToTranscriptionResult(response, "the");
		const phoneme = result.words[0].variants[0][0].phonemes[0];

		expect(phoneme.symbol).toBe("ð");
		expect(phoneme.ipa).toBe("ð");
		expect(phoneme.phonemeId).toBe("DH");
		expect(phoneme.wordIndex).toBe(0);
		expect(phoneme.phonemeIndex).toBe(0);
	});

	it("maps unknown phonemes with cmuToken as symbol", () => {
		const response: G2PResponse = {
			words: [
				{
					word: "xyz",
					variants: [
						[
							{
								phonemes: [{ phonemeId: null, cmuToken: "x" }],
								stress: "none",
							},
						],
					],
					source: "fallback",
				},
			],
		};

		const result = transformToTranscriptionResult(response, "xyz");
		const phoneme = result.words[0].variants[0][0].phonemes[0];

		expect(phoneme.symbol).toBe("x");
		expect(phoneme.ipa).toBeUndefined();
		expect(phoneme.phonemeId).toBeNull();
	});

	it("transforms multiple words", () => {
		const response: G2PResponse = {
			words: [
				{
					word: "the",
					variants: [
						[
							{
								phonemes: [{ ipa: "ð", phonemeId: "DH", cmuToken: "DH" }],
								stress: "none",
							},
						],
					],
					source: "cmudict",
				},
				{
					word: "end",
					variants: [
						[
							{
								phonemes: [{ ipa: "ɛ", phonemeId: "E", cmuToken: "E1" }],
								stress: "primary",
							},
						],
					],
					source: "cmudict",
				},
			],
		};

		const result = transformToTranscriptionResult(response, "the end");
		expect(result.words).toHaveLength(2);
		expect(result.words[0].wordIndex).toBe(0);
		expect(result.words[1].wordIndex).toBe(1);
	});

	it("sets correct phoneme indices across syllables", () => {
		const response: G2PResponse = {
			words: [
				{
					word: "about",
					variants: [
						[
							{
								phonemes: [{ ipa: "ə", phonemeId: "AX", cmuToken: "AX0" }],
								stress: "none",
							},
							{
								phonemes: [
									{ ipa: "b", phonemeId: "B", cmuToken: "B" },
									{ ipa: "aʊ", phonemeId: "AU", cmuToken: "AU1" },
									{ ipa: "t", phonemeId: "T", cmuToken: "T" },
								],
								stress: "primary",
							},
						],
					],
					source: "cmudict",
				},
			],
		};

		const result = transformToTranscriptionResult(response, "about");
		const syllable1 = result.words[0].variants[0][0];
		const syllable2 = result.words[0].variants[0][1];

		expect(syllable1.phonemes[0].phonemeIndex).toBe(0);
		expect(syllable2.phonemes[0].phonemeIndex).toBe(1);
		expect(syllable2.phonemes[1].phonemeIndex).toBe(2);
		expect(syllable2.phonemes[2].phonemeIndex).toBe(3);
	});
});
