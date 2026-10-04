import type { CmuStressLevel } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import type { TranscribedSyllable } from "@/lib/types/g2p";
import { alignVariants } from "./variant-alignment";

/** Builds syllables from `[stress, "space separated symbols"]` pairs. */
function variant(...syllables: [CmuStressLevel, string][]): TranscribedSyllable[] {
	return syllables.map(([stress, symbols]) => ({
		stress,
		phonemes: symbols.split(" ").map((symbol, phonemeIndex) => ({
			symbol,
			cmuToken: symbol,
			phonemeId: null,
			wordIndex: 0,
			phonemeIndex,
		})),
	}));
}

describe("alignVariants", () => {
	it("carries over shared sounds and marks the changed one as new", () => {
		const either1 = variant(["primary", "i"], ["none", "ð ɝ"]);
		const either2 = variant(["primary", "aɪ"], ["none", "ð ɝ"]);

		expect(alignVariants(either1, either2)).toEqual({
			phonemes: [null, 1, 2],
			stressMarks: [0],
			syllableDots: [0],
		});
	});

	it("keeps the order of shared sounds when stress and vowels move", () => {
		const verb = variant(["none", "ɹ ə"], ["primary", "k ɔ ɹ d"]);
		const noun = variant(["primary", "ɹ ɛ"], ["none", "k ɝ d"]);

		expect(alignVariants(verb, noun).phonemes).toEqual([0, null, 2, null, 5]);
	});

	it("pairs stress marks by kind and leaves unmatched ones new", () => {
		const from = variant(["primary", "a"], ["none", "b"]);
		const to = variant(["secondary", "a"], ["primary", "b"]);

		expect(alignVariants(from, to).stressMarks).toEqual([null, 0]);
	});

	it("drops dots for syllables the target does not have", () => {
		const two = variant(["primary", "a"], ["none", "b"]);
		const three = variant(["primary", "a"], ["none", "b"], ["none", "c"]);

		expect(alignVariants(two, three).syllableDots).toEqual([0, null]);
		expect(alignVariants(three, two).syllableDots).toEqual([0]);
	});

	it("maps a variant onto itself one to one", () => {
		const read = variant(["primary", "ɹ i d"]);

		expect(alignVariants(read, read)).toEqual({
			phonemes: [0, 1, 2],
			stressMarks: [0],
			syllableDots: [],
		});
	});
});
