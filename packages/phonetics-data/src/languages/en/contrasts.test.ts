import { describe, expect, it } from "vitest";
import type { PhonemeSymbolId } from "../../core/ipa-map";
import { EnglishCuratedTop10k } from "../../data/en/curated-10k";
import { isPhonemeInLanguage } from "../inventories";
import { EnglishContrastsByPhonemeId, EnglishPhonemeContrasts } from "./contrasts";
import { findSubstitution, getSinglePronunciation } from "./minimal-pairs";

const dictionary = EnglishCuratedTop10k.words;

/** The word's single pronunciation, failing with the contrast and word named. */
function pronunciationOf(contrastId: string, word: string): readonly PhonemeSymbolId[] {
	const variants = dictionary[word];
	if (!variants) {
		throw new Error(`${contrastId}: "${word}" is not in the curated top-10k words`);
	}
	const pronunciation = getSinglePronunciation(variants);
	if (!pronunciation) {
		throw new Error(
			`${contrastId}: "${word}" has competing pronunciations (${variants.join(" | ")})`,
		);
	}
	return pronunciation;
}

/** Stress digits of a CMU variant, e.g. "1 0" for "S IX1 T IX0". */
function stressPattern(variant: string): string {
	return variant
		.replace(/[^012 ]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function substitutionOf(contrastId: string, [first, second]: readonly [string, string]) {
	return findSubstitution(pronunciationOf(contrastId, first), pronunciationOf(contrastId, second));
}

describe("EnglishPhonemeContrasts", () => {
	it("is not empty", () => {
		expect(EnglishPhonemeContrasts.length).toBeGreaterThan(0);
	});

	it("has unique ids", () => {
		const ids = EnglishPhonemeContrasts.map((contrast) => contrast.id);
		const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
		expect(duplicates, "duplicate contrast ids").toEqual([]);
	});

	it("covers each pair of sounds at most once, in either order", () => {
		const seen = new Map<string, string>();
		for (const contrast of EnglishPhonemeContrasts) {
			const key = [...contrast.phonemeIds].sort().join(" ");
			expect(seen.get(key), `${contrast.id} repeats the sounds of ${seen.get(key)}`).toBe(
				undefined,
			);
			seen.set(key, contrast.id);
		}
	});

	describe.each(EnglishPhonemeContrasts)("$id", (contrast) => {
		const { id, phonemeIds, tip, minimalPairs } = contrast;

		it("derives its id from its phoneme IDs", () => {
			expect(id).toBe(phonemeIds.map((phonemeId) => phonemeId.toLowerCase()).join("-"));
		});

		it("contrasts two different en-us phonemes", () => {
			expect(phonemeIds[0], `${id}: both phoneme IDs are the same`).not.toBe(phonemeIds[1]);
			for (const phonemeId of phonemeIds) {
				expect(
					isPhonemeInLanguage("en-us", phonemeId),
					`${id}: ${phonemeId} is not in the en-us inventory`,
				).toBe(true);
			}
		});

		it("has a one-sentence tip", () => {
			const trimmed = tip.trim();
			expect(trimmed, `${id}: tip is empty`).not.toBe("");
			expect(trimmed, `${id}: tip should end with a full stop`).toMatch(/[.!?]$/);
			expect(trimmed, `${id}: tip should be a single sentence`).not.toMatch(/[.!?]\s/);
		});

		it("has at least one minimal pair and no duplicates", () => {
			expect(minimalPairs.length, `${id}: no minimal pairs`).toBeGreaterThan(0);
			const keys = minimalPairs.map(({ words }) => words.join("/"));
			const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
			expect(duplicates, `${id}: duplicate minimal pairs`).toEqual([]);
		});

		it.each(
			minimalPairs.map(({ words }) => words),
		)("%s / %s differ only by the contrasted sounds", (first, second) => {
			const substitution = substitutionOf(id, [first, second]);
			expect(
				substitution,
				`${id}: "${first}" and "${second}" do not differ by exactly one sound`,
			).not.toBeNull();
			expect(
				[substitution?.from, substitution?.to],
				`${id}: "${first}" / "${second}" should swap ${phonemeIds[0]} for ${phonemeIds[1]}`,
			).toEqual(phonemeIds);
		});

		it.each(
			minimalPairs.map(({ words }) => words),
		)("%s / %s share a stress pattern", (first, second) => {
			// Sound IDs ignore stress, so a pair stressed on different syllables would
			// otherwise pass while sounding like more than one difference.
			const patternsOf = (word: string) => new Set((dictionary[word] ?? []).map(stressPattern));
			const secondPatterns = patternsOf(second);
			const shared = [...patternsOf(first)].some((pattern) => secondPatterns.has(pattern));
			expect(shared, `${id}: "${first}" and "${second}" are stressed differently`).toBe(true);
		});
	});
});

describe("EnglishContrastsByPhonemeId", () => {
	it("indexes a contrast under both of its sounds", () => {
		const fromI = EnglishContrastsByPhonemeId.I?.find((match) => match.contrastId === "i-ix");
		const fromIx = EnglishContrastsByPhonemeId.IX?.find((match) => match.contrastId === "i-ix");

		expect(fromI?.partnerId).toBe("IX");
		expect(fromI?.minimalPairs[0]?.words).toEqual(["seat", "sit"]);
		expect(fromIx?.partnerId).toBe("I");
		expect(fromIx?.minimalPairs[0]?.words).toEqual(["sit", "seat"]);
	});

	it("orients every pair so its first word holds the looked-up sound", () => {
		for (const [phonemeId, matches] of Object.entries(EnglishContrastsByPhonemeId)) {
			for (const match of matches ?? []) {
				for (const { words } of match.minimalPairs) {
					const substitution = substitutionOf(match.contrastId, words);
					expect(
						[substitution?.from, substitution?.to],
						`${match.contrastId} under ${phonemeId}: "${words[0]}" / "${words[1]}" is misoriented`,
					).toEqual([phonemeId, match.partnerId]);
				}
			}
		}
	});

	it("lists each contrast exactly twice", () => {
		const entries = Object.values(EnglishContrastsByPhonemeId).flatMap((matches) => matches ?? []);
		expect(entries).toHaveLength(EnglishPhonemeContrasts.length * 2);
	});
});
