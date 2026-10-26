import { describe, expect, it } from "vitest";
import { transformToTranscriptionResult } from "./g2p-client";
import { extractIpaText, extractWordIpa, extractWordPronunciation } from "./ipa-copy";
import { cmuToSyllables, lookupTier1 } from "./phoneme-lookup/shared";
import type { TranscriptionResult } from "./types/g2p";

function makeResult(words: TranscriptionResult["words"]): TranscriptionResult {
	return { originalText: "test", words, timestamp: new Date() };
}

describe("extractIpaText", () => {
	it("returns IPA for a single word", () => {
		const result = makeResult([
			{
				word: "the",
				variants: [
					[
						{
							phonemes: [
								{ symbol: "ð", cmuToken: "DH", phonemeId: "DH", wordIndex: 0, phonemeIndex: 0 },
								{ symbol: "ə", cmuToken: "AX0", phonemeId: "AX", wordIndex: 0, phonemeIndex: 1 },
							],
							stress: "none",
						},
					],
				],
				selectedVariantIndex: 0,
				wordIndex: 0,
				source: "cmudict",
			},
		]);

		expect(extractIpaText(result, [0])).toBe("ðə");
	});

	it("adds stress markers", () => {
		const result = makeResult([
			{
				word: "about",
				variants: [
					[
						{
							phonemes: [
								{ symbol: "ə", cmuToken: "AX0", phonemeId: "AX", wordIndex: 0, phonemeIndex: 0 },
							],
							stress: "none",
						},
						{
							phonemes: [
								{ symbol: "b", cmuToken: "B", phonemeId: "B", wordIndex: 0, phonemeIndex: 1 },
								{ symbol: "aʊ", cmuToken: "AU1", phonemeId: "AU", wordIndex: 0, phonemeIndex: 2 },
								{ symbol: "t", cmuToken: "T", phonemeId: "T", wordIndex: 0, phonemeIndex: 3 },
							],
							stress: "primary",
						},
					],
				],
				selectedVariantIndex: 0,
				wordIndex: 0,
				source: "cmudict",
			},
		]);

		expect(extractIpaText(result, [0])).toBe("ə.ˈbaʊt");
	});

	it("joins multiple words with space", () => {
		const result = makeResult([
			{
				word: "the",
				variants: [
					[
						{
							phonemes: [
								{ symbol: "ð", cmuToken: "DH", phonemeId: "DH", wordIndex: 0, phonemeIndex: 0 },
							],
							stress: "none",
						},
					],
				],
				selectedVariantIndex: 0,
				wordIndex: 0,
				source: "cmudict",
			},
			{
				word: "end",
				variants: [
					[
						{
							phonemes: [
								{ symbol: "ɛ", cmuToken: "E1", phonemeId: "E", wordIndex: 1, phonemeIndex: 0 },
							],
							stress: "primary",
						},
					],
				],
				selectedVariantIndex: 0,
				wordIndex: 1,
				source: "cmudict",
			},
		]);

		expect(extractIpaText(result, [0, 0])).toBe("ð ˈɛ");
	});

	it("skips fallback words", () => {
		const result = makeResult([
			{
				word: "the",
				variants: [
					[
						{
							phonemes: [
								{ symbol: "ð", cmuToken: "DH", phonemeId: "DH", wordIndex: 0, phonemeIndex: 0 },
							],
							stress: "none",
						},
					],
				],
				selectedVariantIndex: 0,
				wordIndex: 0,
				source: "cmudict",
			},
			{
				word: "xyz",
				variants: [
					[
						{
							phonemes: [
								{ symbol: "x", cmuToken: "x", phonemeId: null, wordIndex: 1, phonemeIndex: 0 },
							],
							stress: "none",
						},
					],
				],
				selectedVariantIndex: 0,
				wordIndex: 1,
				source: "fallback",
			},
		]);

		expect(extractIpaText(result, [0, 0])).toBe("ð");
	});

	it("returns empty string for empty result", () => {
		const result = makeResult([]);
		expect(extractIpaText(result, [])).toBe("");
	});

	it("uses selected variant index", () => {
		const result = makeResult([
			{
				word: "the",
				variants: [
					[
						{
							phonemes: [
								{ symbol: "ð", cmuToken: "DH", phonemeId: "DH", wordIndex: 0, phonemeIndex: 0 },
								{ symbol: "ə", cmuToken: "AX0", phonemeId: "AX", wordIndex: 0, phonemeIndex: 1 },
							],
							stress: "none",
						},
					],
					[
						{
							phonemes: [
								{ symbol: "ð", cmuToken: "DH", phonemeId: "DH", wordIndex: 0, phonemeIndex: 0 },
								{ symbol: "ʌ", cmuToken: "AH1", phonemeId: "AH", wordIndex: 0, phonemeIndex: 1 },
							],
							stress: "primary",
						},
					],
				],
				selectedVariantIndex: 0,
				wordIndex: 0,
				source: "cmudict",
			},
		]);

		expect(extractIpaText(result, [1])).toBe("ˈðʌ");
	});
});

describe("extractWordIpa", () => {
	it("returns IPA for the selected CMU variant", () => {
		expect(
			extractWordIpa(
				{
					source: "cmudict",
					variants: [
						[
							{
								phonemes: [
									{ symbol: "ð", cmuToken: "DH", phonemeId: "DH", wordIndex: 0, phonemeIndex: 0 },
									{ symbol: "ə", cmuToken: "AX0", phonemeId: "AX", wordIndex: 0, phonemeIndex: 1 },
								],
								stress: "none",
							},
						],
						[
							{
								phonemes: [
									{ symbol: "ð", cmuToken: "DH", phonemeId: "DH", wordIndex: 0, phonemeIndex: 0 },
									{ symbol: "ʌ", cmuToken: "AH1", phonemeId: "AH", wordIndex: 0, phonemeIndex: 1 },
								],
								stress: "primary",
							},
						],
					],
				},
				1,
			),
		).toBe("ˈðʌ");
	});

	it("returns empty string for fallback words", () => {
		expect(
			extractWordIpa(
				{
					source: "fallback",
					variants: [
						[
							{
								phonemes: [
									{ symbol: "x", cmuToken: "x", phonemeId: null, wordIndex: 1, phonemeIndex: 0 },
								],
								stress: "none",
							},
						],
					],
				},
				0,
			),
		).toBe("");
	});
});

describe("extractWordPronunciation", () => {
	it("gives each variant back in the dictionary's notation, as the manifest writes it", () => {
		const variants = lookupTier1("read") ?? [];
		const [read] = transformToTranscriptionResult(
			{ words: [{ word: "read", variants: variants.map(cmuToSyllables), source: "cmudict" }] },
			"read",
		).words;
		expect(extractWordPronunciation(read, 0)).toBe("R E1 D");
		expect(extractWordPronunciation(read, 1)).toBe("R I1 D");
		expect(extractWordPronunciation({ ...read, source: "fallback" }, 0)).toBe("");
	});
});
