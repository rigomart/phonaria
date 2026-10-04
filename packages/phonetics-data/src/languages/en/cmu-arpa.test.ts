import { describe, expect, it } from "vitest";
import type { PhonemeSymbolId } from "../../core/ipa-map";
import { getLanguagePhonemeIds } from "../inventories";
import {
	CmuArpaMap,
	cmuVariantToIpa,
	extractBasePhonemeId,
	getArpabetForEnglishPhonemeId,
	getCmuArpaForEnglishPhonemeId,
	getPhonemeIdForCmuArpa,
	isCmuArpaToken,
	isEnglishPhonemeSymbolId,
	isValidPhonemeToken,
	phonemeVariantToCmuArpa,
	tryExtractBasePhonemeId,
} from "./cmu-arpa";

describe("phonemeVariantToCmuArpa", () => {
	it.each([
		["S I1 T", "S IY1 T"],
		["H AX0 L OU1", "HH AH0 L OW1"],
		["J U2 ER0", "JH UW2 ER0"],
		["  SH IX1  P ", "SH IH1 P"],
	])("converts %s without changing its sounds or stress", (input, expected) => {
		expect(phonemeVariantToCmuArpa(input)).toBe(expected);
	});
	it.each([
		"",
		"S UNKNOWN T",
		"S I T",
		"AX1",
		"AH0",
		"P1",
		"EE1",
	])("rejects an invalid or unrepresentable pronunciation: %s", (input) => {
		expect(() => phonemeVariantToCmuArpa(input)).toThrow();
	});
});

describe("CMU mappings", () => {
	it.each([
		["AH0", "AX"],
		["AH1", "AH"],
		["AH2", "AH"],
		["HH", "H"],
		["JH", "J"],
		["IY1", "I"],
		["IH1", "IX"],
		["AA1", "A"],
		["AO1", "O"],
		["EY1", "EI"],
		["ER0", "ER"],
	] as const)("maps raw CMU %s to the correct internal sound %s", (token, id) => {
		expect(getPhonemeIdForCmuArpa(token)).toBe(id);
	});

	it.each([
		["AX", ["AH0"]],
		["AH", ["AH1", "AH2"]],
		["I", ["IY0", "IY1", "IY2"]],
		["ER", ["ER0", "ER1", "ER2"]],
		["H", ["HH"]],
		["J", ["JH"]],
	] as const)("returns all and only the CMU tokens for %s", (id, expected) => {
		expect(getCmuArpaForEnglishPhonemeId(id).sort()).toEqual([...expected].sort());
	});

	it("can represent every English sound and round-trip every CMU token with its stress", () => {
		for (const id of getLanguagePhonemeIds("en-us")) {
			expect(getCmuArpaForEnglishPhonemeId(id).length, id).toBeGreaterThan(0);
			expect(isEnglishPhonemeSymbolId(id), id).toBe(true);
		}
		for (const [token, id] of Object.entries(CmuArpaMap)) {
			const stress = token.match(/[012]$/)?.[0] ?? "";
			expect(phonemeVariantToCmuArpa(id + stress), token).toBe(token);
		}
	});

	it.each([
		["H", "HH"],
		["J", "JH"],
		["IX", "IH"],
		["OU", "OW"],
		["AX", "AX"],
	] as const)("uses the search label %s → %s without stress", (id, expected) => {
		expect(getArpabetForEnglishPhonemeId(id)).toBe(expected);
	});

	it.each([
		"EE",
		"AA",
		"OO",
		"NY",
		"RX",
		"RR",
		"X",
		"YH",
	] as const)("does not treat Spanish-only %s as an English sound", (id) =>
		expect(isEnglishPhonemeSymbolId(id)).toBe(false));

	it.each([
		"",
		"UNKNOWN",
		"IY",
		"AH3",
		"P1",
		"I1",
		"HH1",
	])("rejects invalid raw CMU token %s", (token) => expect(isCmuArpaToken(token)).toBe(false));
});

describe("internal phoneme tokens", () => {
	it.each([
		["P", "P"],
		["IX0", "IX"],
		["I1", "I"],
		["OU2", "OU"],
		["AX0", "AX"],
	] as const)("extracts the sound in %s", (token, expected) => {
		expect(tryExtractBasePhonemeId(token)).toBe(expected);
		expect(extractBasePhonemeId(token)).toBe(expected);
		expect(isValidPhonemeToken(token)).toBe(true);
	});

	it.each([
		"",
		"UNKNOWN",
		"IY1",
		"I3",
		"I11",
		" I1",
		"I1 ",
		"i1",
	])("rejects malformed or raw-CMU token %s", (token) => {
		expect(tryExtractBasePhonemeId(token)).toBeNull();
		expect(isValidPhonemeToken(token)).toBe(false);
		expect(() => extractBasePhonemeId(token)).toThrow();
	});
});

describe("internal pronunciation to IPA", () => {
	it.each([
		["P AE1 T", "pæt"],
		["H AX0 L OU1", "həloʊ"],
		["AX0 B AU1 T", "əbaʊt"],
		["J U2 ER0", "dʒuɝ"],
		["  SH\tIX1\nP  ", "ʃɪp"],
		["", ""],
		["   ", ""],
	])("renders %s as %s", (variant, expected) => {
		expect(cmuVariantToIpa(variant)).toBe(expected);
	});

	it("skips unknown tokens in its documented tolerant conversion mode", () => {
		expect(cmuVariantToIpa("P UNKNOWN AE1 T")).toBe("pæt");
		expect(cmuVariantToIpa("UNKNOWN")).toBe("");
	});
});

describe("inherited-property validation regressions", () => {
	it.each([
		"constructor",
		"toString",
		"__proto__",
	])("rejects inherited object property %s as a raw CMU token", (token) =>
		expect(isCmuArpaToken(token)).toBe(false));
	it.each([
		"constructor",
		"toString",
		"__proto__",
	])("rejects inherited object property %s as an internal sound", (token) => {
		for (const suffix of ["", "0", "1", "2"]) {
			const stressedToken = token + suffix;
			expect(tryExtractBasePhonemeId(stressedToken)).toBeNull();
			expect(isValidPhonemeToken(stressedToken)).toBe(false);
			expect(() => extractBasePhonemeId(stressedToken)).toThrow();
			expect(() => phonemeVariantToCmuArpa(`P ${stressedToken} AE1 T`)).toThrow();
			expect(cmuVariantToIpa(`P ${stressedToken} AE1 T`)).toBe("pæt");
		}
	});
	it.each([
		"constructor",
		"toString",
		"__proto__",
	])("rejects inherited object property %s as an English sound", (token) =>
		expect(isEnglishPhonemeSymbolId(token as PhonemeSymbolId)).toBe(false));
});
