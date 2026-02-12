import { describe, expect, it } from "vitest";
import { spanishGraphemeToPhonemes } from "./rules";
import { assignSpanishStressWithAccentIndex } from "./stress";
import { syllabifySpanish } from "./syllabifier";

function stressPattern(word: string): string[] {
	const { phonemes, accentedVowelIndex } = spanishGraphemeToPhonemes(word);
	const syllables = syllabifySpanish(phonemes, accentedVowelIndex);
	const stressed = assignSpanishStressWithAccentIndex(syllables, word, accentedVowelIndex);
	return stressed.map((s) => s.stress);
}

describe("assignSpanishStressWithAccentIndex", () => {
	it("stresses penultimate for words ending in vowel: casa", () => {
		expect(stressPattern("casa")).toEqual(["primary", "none"]);
	});

	it("stresses ultimate for words ending in consonant (not n/s): hablar", () => {
		expect(stressPattern("hablar")).toEqual(["none", "primary"]);
	});

	it("stresses penultimate for words ending in n: comen", () => {
		expect(stressPattern("comen")).toEqual(["primary", "none"]);
	});

	it("stresses penultimate for words ending in s: casas", () => {
		expect(stressPattern("casas")).toEqual(["primary", "none"]);
	});

	it("accent overrides to ultimate: café", () => {
		expect(stressPattern("café")).toEqual(["none", "primary"]);
	});

	it("accent overrides to antepenultimate: árbol", () => {
		expect(stressPattern("árbol")).toEqual(["primary", "none"]);
	});

	it("monosyllable gets primary stress: sol", () => {
		expect(stressPattern("sol")).toEqual(["primary"]);
	});

	it("accent on penultimate: lápiz", () => {
		expect(stressPattern("lápiz")).toEqual(["primary", "none"]);
	});

	it("accent on antepenultimate: música", () => {
		expect(stressPattern("música")).toEqual(["primary", "none", "none"]);
	});

	it("default penultimate for 3-syllable word ending in vowel: bonito", () => {
		expect(stressPattern("bonito")).toEqual(["none", "primary", "none"]);
	});
});
