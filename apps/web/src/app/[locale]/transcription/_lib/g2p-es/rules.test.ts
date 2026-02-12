import { describe, expect, it } from "vitest";
import { spanishGraphemeToPhonemes } from "./rules";

function ids(word: string): string[] {
	return spanishGraphemeToPhonemes(word).phonemes.map((p) => p.phonemeId);
}

describe("spanishGraphemeToPhonemes", () => {
	it("handles simple vowels: casa", () => {
		expect(ids("casa")).toEqual(["K", "AA", "S", "AA"]);
	});

	it("handles seseo: cerveza", () => {
		expect(ids("cerveza")).toEqual(["S", "EE", "RX", "B", "EE", "S", "AA"]);
	});

	it("handles yeismo: calle", () => {
		expect(ids("calle")).toEqual(["K", "AA", "YH", "EE"]);
	});

	it("handles ch digraph: chico", () => {
		expect(ids("chico")).toEqual(["CH", "I", "K", "OO"]);
	});

	it("handles rr digraph: perro", () => {
		expect(ids("perro")).toEqual(["P", "EE", "RR", "OO"]);
	});

	it("handles ll digraph: llave", () => {
		expect(ids("llave")).toEqual(["YH", "AA", "B", "EE"]);
	});

	it("handles silent h: hola", () => {
		expect(ids("hola")).toEqual(["OO", "L", "AA"]);
	});

	it("handles b/v merger: vaca = baca", () => {
		expect(ids("vaca")).toEqual(["B", "AA", "K", "AA"]);
		expect(ids("baca")).toEqual(["B", "AA", "K", "AA"]);
	});

	it("handles word-initial r as trill: rosa", () => {
		expect(ids("rosa")).toEqual(["RR", "OO", "S", "AA"]);
	});

	it("handles intervocalic r as tap: pero", () => {
		expect(ids("pero")).toEqual(["P", "EE", "RX", "OO"]);
	});

	it("handles r after n as trill: enredo", () => {
		expect(ids("enredo")).toEqual(["EE", "N", "RR", "EE", "D", "OO"]);
	});

	it("handles qu + e/i: queso", () => {
		expect(ids("queso")).toEqual(["K", "EE", "S", "OO"]);
	});

	it("handles gu + e/i (silent u): guitarra", () => {
		expect(ids("guitarra")).toEqual(["G", "I", "T", "AA", "RR", "AA"]);
	});

	it("handles g + u with dieresis: pingüino", () => {
		expect(ids("pingüino")).toEqual(["P", "I", "N", "G", "W", "I", "N", "OO"]);
	});

	it("handles ñ: niño", () => {
		expect(ids("niño")).toEqual(["N", "I", "NY", "OO"]);
	});

	it("handles x as K+S: examen", () => {
		expect(ids("examen")).toEqual(["EE", "K", "S", "AA", "M", "EE", "N"]);
	});

	it("handles z as seseo: zapato", () => {
		expect(ids("zapato")).toEqual(["S", "AA", "P", "AA", "T", "OO"]);
	});

	it("handles j: joven", () => {
		expect(ids("joven")).toEqual(["X", "OO", "B", "EE", "N"]);
	});

	it("handles g before e/i as /x/: gente", () => {
		expect(ids("gente")).toEqual(["X", "EE", "N", "T", "EE"]);
	});

	it("handles y before vowel: yo", () => {
		expect(ids("yo")).toEqual(["YH", "OO"]);
	});

	it("handles word-final y as vowel: hoy", () => {
		expect(ids("hoy")).toEqual(["OO", "I"]);
	});

	it("handles accented vowels: café", () => {
		const result = spanishGraphemeToPhonemes("café");
		expect(result.phonemes.map((p) => p.phonemeId)).toEqual(["K", "AA", "F", "EE"]);
		expect(result.accentedVowelIndex).toBe(3);
	});

	it("handles accented i: país", () => {
		const result = spanishGraphemeToPhonemes("país");
		expect(result.phonemes.map((p) => p.phonemeId)).toEqual(["P", "AA", "I", "S"]);
		expect(result.accentedVowelIndex).toBe(2);
	});

	it("handles r after l: alrededor", () => {
		expect(ids("alrededor")).toEqual(["AA", "L", "RR", "EE", "D", "EE", "D", "OO", "RX"]);
	});

	it("handles r after s: israel", () => {
		expect(ids("israel")).toEqual(["I", "S", "RR", "AA", "EE", "L"]);
	});
});
