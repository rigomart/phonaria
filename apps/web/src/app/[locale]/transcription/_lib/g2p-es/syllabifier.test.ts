import { describe, expect, it } from "vitest";
import { spanishGraphemeToPhonemes } from "./rules";
import { syllabifySpanish } from "./syllabifier";

function syllableIds(word: string): string[][] {
	const { phonemes, accentedVowelIndex } = spanishGraphemeToPhonemes(word);
	const syllables = syllabifySpanish(phonemes, accentedVowelIndex);
	return syllables.map((s) => s.phonemes.map((p) => p.phonemeId));
}

describe("syllabifySpanish", () => {
	it("handles CV.CV: casa", () => {
		expect(syllableIds("casa")).toEqual([
			["K", "AA"],
			["S", "AA"],
		]);
	});

	it("handles CV.CV: mesa", () => {
		expect(syllableIds("mesa")).toEqual([
			["M", "EE"],
			["S", "AA"],
		]);
	});

	it("handles CVC.CV: cantar", () => {
		expect(syllableIds("cantar")).toEqual([
			["K", "AA", "N"],
			["T", "AA", "RX"],
		]);
	});

	it("handles CVC.CV: parte", () => {
		expect(syllableIds("parte")).toEqual([
			["P", "AA", "RX"],
			["T", "EE"],
		]);
	});

	it("handles onset clusters: precio", () => {
		expect(syllableIds("precio")).toEqual([
			["P", "RX", "EE"],
			["S", "I", "OO"],
		]);
	});

	it("handles onset clusters: brazo", () => {
		expect(syllableIds("brazo")).toEqual([
			["B", "RX", "AA"],
			["S", "OO"],
		]);
	});

	it("handles diphthongs: causa", () => {
		expect(syllableIds("causa")).toEqual([
			["K", "AA", "U"],
			["S", "AA"],
		]);
	});

	it("handles diphthongs: puerta", () => {
		expect(syllableIds("puerta")).toEqual([
			["P", "U", "EE", "RX"],
			["T", "AA"],
		]);
	});

	it("handles hiatus with accent: día", () => {
		// d-i(accented)-a -> di.a (hiatus because accented high vowel)
		expect(syllableIds("día")).toEqual([["D", "I"], ["AA"]]);
	});

	it("handles hiatus with accent: país", () => {
		// p-a-i(accented)-s -> pa.is
		expect(syllableIds("país")).toEqual([
			["P", "AA"],
			["I", "S"],
		]);
	});

	it("handles single syllable: sol", () => {
		expect(syllableIds("sol")).toEqual([["S", "OO", "L"]]);
	});

	it("handles CCV.CV: plato", () => {
		expect(syllableIds("plato")).toEqual([
			["P", "L", "AA"],
			["T", "OO"],
		]);
	});

	it("handles V.CV: agua", () => {
		expect(syllableIds("agua")).toEqual([["AA"], ["G", "U", "AA"]]);
	});
});
