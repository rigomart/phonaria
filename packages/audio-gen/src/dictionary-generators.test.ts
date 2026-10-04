import type { CmudictPayload } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { parseCmudict } from "../../helper-scripts/src/cmudict-parser";
import { generateStats } from "../../helper-scripts/src/cmudict-stats";
import { buildTrieFromCmudict } from "../../helper-scripts/src/phoneme-trie-to-json";
import { normalizeDictionaryPronunciations } from "../../helper-scripts/src/validate-cmudict";

function dictionary(variant: string): CmudictPayload {
	return {
		meta: {
			formatVersion: 2,
			source: "test",
			sourceUrl: "test",
			generatedAt: "test",
			wordCount: 1,
			variantCount: 1,
			skippedLineCount: 0,
			deduplicatedVariantCount: 0,
		},
		data: { SHIP: [variant] },
	};
}

describe("dictionary generators", () => {
	it("imports raw CMU, preserving stress and normalizing whitespace", () => {
		const parsed = parseCmudict(
			";;; comment\nSHIP\tSH IH1  P\nSHIP(2) SH IH1 P # duplicate\nABOUT AH0 B AW1 T\n",
		);
		expect(parsed.result).toEqual({ SHIP: ["SH IX1 P"], ABOUT: ["AX0 B AU1 T"] });
		expect(parsed.deduplicatedVariantCount).toBe(1);
	});
	it.each([
		"",
		"   ",
		"SH UNKNOWN IH1 P",
		"SH IX1 P",
		"SH IH P",
		"SH1 IH1 P",
		"constructor IH1 P",
	])("rejects malformed raw input without emitting a shortened pronunciation: %s", (input) => {
		expect(() => parseCmudict(`SHIP ${input}`)).toThrow(/SHIP.*line 1/);
	});
	it("uses normalized stored pronunciations for statistics and search paths", () => {
		const input = dictionary("  SH\tIX1\nP  ");
		expect(normalizeDictionaryPronunciations(input.data)).toEqual({ SHIP: ["SH IX1 P"] });
		const { stats } = generateStats(input);
		expect(stats.phonemes.map(({ phonemeId, tokenCount }) => [phonemeId, tokenCount])).toEqual([
			["SH", 1],
			["IX", 1],
			["P", 1],
		]);
		expect(stats.syllables).toEqual([{ count: 1, words: 1, percentage: 100 }]);
		const { trie, totalEntries } = buildTrieFromCmudict(input);
		expect(totalEntries).toBe(1);
		expect(trie.next.SH.next.IH.next.P.words).toEqual(["SHIP"]);
	});
	it("rejects words with no pronunciations", () => {
		const input = dictionary("SH IX1 P");
		input.data.SHIP = [];
		expect(() => normalizeDictionaryPronunciations(input.data)).toThrow(/SHIP/);
		expect(() => generateStats(input)).toThrow(/SHIP/);
		expect(() => buildTrieFromCmudict(input)).toThrow(/SHIP/);
	});
	it.each([
		"SH UNKNOWN IX1 P",
		"SH IX P",
		"SH1 IX1 P",
		"AX1",
		"AH0",
		"EE1",
		"",
		" \t\n",
		"constructor IX1 P",
	])("rejects a malformed stored pronunciation before generating output: %j", (input) => {
		expect(() => normalizeDictionaryPronunciations(dictionary(input).data)).toThrow(/SHIP/);
		expect(() => generateStats(dictionary(input))).toThrow(/SHIP/);
		expect(() => buildTrieFromCmudict(dictionary(input))).toThrow(/SHIP/);
	});
});
