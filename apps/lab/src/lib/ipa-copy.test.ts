import { describe, expect, it } from "vitest";
import { extractIpaText } from "./ipa-copy";
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
