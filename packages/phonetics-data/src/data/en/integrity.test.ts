import { describe, expect, it } from "vitest";
import dictionaryJson from "../../../data/en/dict/cmudict.json";
import type { CmudictPayload } from "../../dict/types";
import {
	EnglishPhonemeAllophones,
	EnglishPhonemeSpellingPatterns,
	getLanguagePhonemeInventory,
	parsePhonemePronunciation,
} from "../../index";
import { EnglishCmudictStatsData } from "./cmudict-stats";
import { EnglishCuratedTop1k } from "./curated-1k";
import { EnglishCuratedTop10k } from "./curated-10k";

const dictionary: CmudictPayload = dictionaryJson;
const entries = Object.entries(dictionary.data);
const wordCount = entries.length;
const variantCount = entries.reduce((count, [, variants]) => count + variants.length, 0);
const multiplePronunciationCount = entries.filter(([, variants]) => variants.length > 1).length;

describe("dictionary integrity", () => {
	it("keeps metadata counts equal to the actual dictionary contents", () => {
		expect(wordCount).toBeGreaterThan(0);
		expect(dictionary.meta.wordCount).toBe(wordCount);
		expect(dictionary.meta.variantCount).toBe(variantCount);
	});

	it("contains nonempty, unique pronunciations with English IDs and representable stress", () => {
		const inventory = getLanguagePhonemeInventory("en-us");
		const consonants = new Set<string>(inventory.consonants);
		const vowels = new Set<string>(inventory.vowels);
		const errors: string[] = [];
		// Check independently of the permissive runtime token helpers. This also
		// rejects inherited object keys, raw ARPABET and consonants carrying stress.
		for (const [word, variants] of entries) {
			if (!word || word !== word.toUpperCase() || variants.length === 0) {
				errors.push(`${word}: missing word or pronunciations, or noncanonical word key`);
			}
			if (new Set(variants).size !== variants.length) errors.push(`${word}: duplicate variant`);
			for (const variant of variants) {
				if (!variant || variant !== variant.trim().split(/\s+/).join(" ")) {
					errors.push(`${word}: noncanonical pronunciation ${JSON.stringify(variant)}`);
				}
				for (const token of parsePhonemePronunciation(variant)) {
					const match = /^([A-Z]+)([012])?$/.exec(token);
					const id = match?.[1] ?? "";
					const stress = match?.[2];
					const validConsonant = consonants.has(id) && stress === undefined;
					const validVowel =
						vowels.has(id) &&
						stress !== undefined &&
						(id !== "AX" || stress === "0") &&
						(id !== "AH" || stress !== "0");
					if (!validConsonant && !validVowel) errors.push(`${word}: invalid token ${token}`);
				}
			}
		}
		expect(errors.slice(0, 10), `${errors.length} dictionary integrity errors`).toEqual([]);
	});
});

describe.each([
	["1k", EnglishCuratedTop1k],
	["10k", EnglishCuratedTop10k],
] as const)("curated %s integrity", (tier, data) => {
	it("reports its tier and actual word count", () => {
		expect(data.meta.tier).toBe(tier);
		expect(Object.keys(data.words).length).toBeGreaterThan(0);
		expect(data.meta.wordCount).toBe(Object.keys(data.words).length);
	});

	it("uses normalized lookup keys and retains all source-dictionary variants", () => {
		for (const [word, variants] of Object.entries(data.words)) {
			expect(word, word).toBe(word.toLowerCase());
			expect(variants, word).toEqual(dictionary.data[word.toUpperCase()]);
			expect(variants.length, word).toBeGreaterThan(0);
		}
	});
});

it("does not change a tier-1 pronunciation when tier-2 finishes loading", () => {
	for (const [word, variants] of Object.entries(EnglishCuratedTop1k.words)) {
		expect(EnglishCuratedTop10k.words[word], word).toEqual(variants);
	}
});

describe("dictionary statistics", () => {
	const stats = EnglishCmudictStatsData;

	it("describes the same source and independently counted words and variants", () => {
		expect(stats.meta.sourceUrl).toBe(dictionary.meta.sourceUrl);
		expect(stats.meta.source).toBe(dictionary.meta.source);
		expect(stats.meta.wordCount).toBe(wordCount);
		expect(stats.meta.variantCount).toBe(variantCount);
		expect(stats.meta.multiplePronunciationCount).toBe(multiplePronunciationCount);
		expect(stats.overview.words).toBe(wordCount);
		expect(stats.overview.variants).toBe(variantCount);
		expect(stats.overview.multiplePronunciationShare).toBeCloseTo(
			(multiplePronunciationCount / wordCount) * 100,
			8,
		);
	});

	it("counts phoneme tokens across variants but counts each covered word only once", () => {
		const tokenCounts = new Map<string, number>();
		const wordCounts = new Map<string, number>();
		for (const [, variants] of entries) {
			const wordSounds = new Set<string>();
			for (const variant of variants) {
				for (const token of variant.split(" ")) {
					const id = token.replace(/[012]$/, "");
					tokenCounts.set(id, (tokenCounts.get(id) ?? 0) + 1);
					wordSounds.add(id);
				}
			}
			for (const id of wordSounds) wordCounts.set(id, (wordCounts.get(id) ?? 0) + 1);
		}
		const ids = stats.phonemes.map(({ phonemeId }) => phonemeId);
		expect(new Set(ids).size).toBe(ids.length);
		expect([...ids].sort()).toEqual([...tokenCounts.keys()].sort());
		for (const row of stats.phonemes) {
			const coverage = wordCounts.get(row.phonemeId) ?? 0;
			expect(row.tokenCount, row.phonemeId).toBe(tokenCounts.get(row.phonemeId));
			expect(row.wordCoverage.count, row.phonemeId).toBe(coverage);
			expect(row.wordCoverage.percentage, row.phonemeId).toBeCloseTo(
				(coverage / wordCount) * 100,
				8,
			);
			expect(row.averageTokensPerWord, row.phonemeId).toBeCloseTo(row.tokenCount / coverage, 8);
		}
	});

	it("accounts for every word exactly once in the syllable distribution", () => {
		const distribution = new Map<number, number>();
		for (const [, variants] of entries) {
			// Stats use the first pronunciation with a vowel; consonant-only
			// interjections are represented as one syllable.
			const syllables =
				variants
					.map((variant) => variant.match(/[012]/g)?.length ?? 0)
					.find((count) => count > 0) ?? 1;
			distribution.set(syllables, (distribution.get(syllables) ?? 0) + 1);
		}
		const counts = stats.syllables.map(({ count }) => count);
		expect(new Set(counts).size).toBe(counts.length);
		expect([...counts].sort((a, b) => a - b)).toEqual(
			[...distribution.keys()].sort((a, b) => a - b),
		);
		expect(stats.syllables.reduce((total, row) => total + row.words, 0)).toBe(wordCount);
		for (const row of stats.syllables) {
			expect(row.words, `${row.count} syllables`).toBe(distribution.get(row.count));
			expect(row.count).toBeGreaterThan(0);
			expect(Number.isInteger(row.count)).toBe(true);
			expect(row.words).toBeGreaterThan(0);
			expect(row.percentage).toBeCloseTo((row.words / wordCount) * 100, 8);
		}
	});
});

describe("teaching examples", () => {
	it.each([
		[
			"spelling patterns",
			Object.entries(EnglishPhonemeSpellingPatterns).map(
				([id, entry]) => [id, entry.examples] as const,
			),
		],
		[
			"allophones",
			Object.entries(EnglishPhonemeAllophones).map(
				([id, allophones]) =>
					[id, (allophones ?? []).flatMap((allophone) => allophone.examples)] as const,
			),
		],
	] as const)("uses real words containing the advertised sound in %s", (_name, groups) => {
		for (const [id, examples] of groups) {
			expect(examples.length, id).toBeGreaterThan(0);
			for (const example of examples) {
				const variants = dictionary.data[example.word.toUpperCase()] ?? [];
				expect(variants.length, example.word).toBeGreaterThan(0);
				expect(example.phonemic.trim().length, example.word).toBeGreaterThan(0);
				expect(
					variants.some((variant) =>
						variant.split(" ").some((token) => token.replace(/[012]$/, "") === id),
					),
					`${id}: ${example.word} does not contain the sound it illustrates`,
				).toBe(true);
			}
		}
	});
});
