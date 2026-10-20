import { EnglishPhonemeContrasts } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { buildCatalogCases, caseForClip, recordingWordList } from "./cases";

describe("buildCatalogCases", () => {
	it("judges each pair both ways on the sound where it differs", () => {
		const cases = buildCatalogCases([
			{ id: "i-ix", phonemeIds: ["I", "IX"], minimalPairs: [{ words: ["seat", "sit"] }] },
		]);
		expect(
			cases.map(
				({ kind, recordingWord, targetWord, position, targetPhonemeId, expectedHeard }) => ({
					kind,
					said: `${recordingWord} as ${targetWord}`,
					position,
					targetPhonemeId,
					expectedHeard,
				}),
			),
		).toEqual([
			{
				kind: "correct",
				said: "seat as seat",
				position: 1,
				targetPhonemeId: "I",
				expectedHeard: "I",
			},
			{ kind: "swap", said: "sit as seat", position: 1, targetPhonemeId: "I", expectedHeard: "IX" },
			{
				kind: "correct",
				said: "sit as sit",
				position: 1,
				targetPhonemeId: "IX",
				expectedHeard: "IX",
			},
			{ kind: "swap", said: "seat as sit", position: 1, targetPhonemeId: "IX", expectedHeard: "I" },
		]);
		expect(cases[0].judgedPhonemeIds).toEqual(["I", "IX"]);
	});

	it("covers the whole catalog", () => {
		const pairs = EnglishPhonemeContrasts.reduce((sum, c) => sum + c.minimalPairs.length, 0);
		expect(buildCatalogCases()).toHaveLength(pairs * 4);
	});
});

describe("recordingWordList", () => {
	it("gives one pair per contrast with no word twice", () => {
		const list = recordingWordList();
		const words = list.flatMap((pair) => pair.words);
		expect(list.map((pair) => pair.contrastId)).toEqual(EnglishPhonemeContrasts.map((c) => c.id));
		expect(new Set(words).size).toBe(EnglishPhonemeContrasts.length * 2);
	});
});

describe("caseForClip", () => {
	const contrasts = [
		{ id: "i-ix", phonemeIds: ["I", "IX"], minimalPairs: [{ words: ["seat", "sit"] }] },
	] as const;

	it("finds the pair's case for correct and partner recordings", () => {
		const swap = caseForClip(
			{ target: "seat", partner: "sit", kind: "swap", said: "sit" },
			contrasts,
		);
		expect(swap).toMatchObject({
			kind: "swap",
			targetWord: "seat",
			recordingWord: "sit",
			expectedHeard: "IX",
		});
	});

	it("judges a wrong-word recording against the target as a correct one would be", () => {
		expect(
			caseForClip({ target: "seat", partner: "sit", kind: "phrase", said: "a seat" }, contrasts),
		).toMatchObject({
			contrastId: "i-ix",
			kind: "wrong-word",
			wrongWord: "phrase",
			targetWord: "seat",
			recordingWord: "a seat",
			position: 1,
		});
	});

	it("rejects words that aren't a catalog pair", () => {
		expect(() =>
			caseForClip({ target: "seat", partner: "sheep", kind: "correct", said: "seat" }, contrasts),
		).toThrow("aren't a minimal pair");
	});
});
