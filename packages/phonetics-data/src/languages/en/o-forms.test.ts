import { describe, expect, it } from "vitest";
import { EnglishCuratedTop10k } from "../../data/en/curated-10k";
import { isOFormOf, OFormExceptions, preferOForms, spellsOVowel } from "./o-forms";

const variantsOf = (word: string) => EnglishCuratedTop10k.words[word];

describe("isOFormOf", () => {
	it("accepts one /ɑ/ said as /ɔ/ at the same stress", () => {
		expect(isOFormOf("K O1 T", "K A1 T")).toBe(true);
		expect(isOFormOf("P R OU1 T AX0 K O2 L", "P R OU1 T AX0 K A2 L")).toBe(true);
	});
	it.each([
		["the other direction", "K A1 T", "K O1 T"],
		["a stress change", "K O2 T", "K A1 T"],
		["a second change", "K O1 D", "K A1 T"],
		["another vowel", "K AH1 T", "K A1 T"],
		["a different length", "K O1 T S", "K A1 T"],
		["the same form", "K A1 T", "K A1 T"],
	])("rejects %s", (_, oForm, aForm) => {
		expect(isOFormOf(oForm, aForm)).toBe(false);
	});
});

describe("spellsOVowel", () => {
	it.each([
		"caught",
		"awe",
		"bought",
		"cough",
		"august",
		"talk",
		"salt",
		"fall",
		"boss",
		"soft",
		"cloth",
		"fog",
		"long",
	])("marks %s as THOUGHT or CLOTH", (word) => {
		expect(spellsOVowel(word)).toBe(true);
	});
	it.each(["lot", "doctor", "on", "beyond", "want", "watch", "swallow", "protocol", "golf"])(
		"leaves %s alone",
		(word) => {
			expect(spellsOVowel(word)).toBe(false);
		},
	);
	it.each([...OFormExceptions.keys()])("lists %s as an exception", (word) => {
		expect(spellsOVowel(word)).toBe(false);
	});
});

describe("preferOForms", () => {
	it.each([
		["caught", ["K O1 T", "K A1 T"]],
		["bought", ["B O1 T", "B A1 T"]],
		["boss", ["B O1 S", "B A1 S"]],
		["august", ["O1 G AX0 S T", "A1 G AX0 S T"]],
	])("puts the /ɔ/ form of %s first", (word, expected) => {
		expect(variantsOf(word)).toEqual([...expected].reverse());
		expect(preferOForms(word, variantsOf(word))).toEqual(expected);
	});
	it("puts the /ɔ/ form of long first", () => {
		expect(preferOForms("long", ["L A1 NG", "L O1 NG"])).toEqual(["L O1 NG", "L A1 NG"]);
	});
	it.each(["lot", "doctor", "on", "want", "watch", "beyond", "gospel"])(
		"keeps CMU order for %s",
		(word) => {
			expect(
				variantsOf(word).some((oForm) => variantsOf(word).some((a) => isOFormOf(oForm, a))),
			).toBe(true);
			expect(preferOForms(word, variantsOf(word))).toEqual(variantsOf(word));
		},
	);
	it("swaps only the pair, leaving the forms between them in place", () => {
		expect(preferOForms("caught", ["K A1 T", "K AH1 T", "K O1 T", "K I1 T"])).toEqual([
			"K O1 T",
			"K AH1 T",
			"K A1 T",
			"K I1 T",
		]);
	});
	it("keeps the order when the pairs differ at more than one vowel", () => {
		const variants = ["K A1 T A0", "K O1 T A0", "K A1 T O0"];
		expect(preferOForms("caughta", variants)).toEqual(variants);
	});
	it("keeps an /ɔ/ form that already comes first", () => {
		expect(preferOForms("because", variantsOf("because"))).toEqual(variantsOf("because"));
	});
	it("keeps the order of forms that differ in something else", () => {
		expect(preferOForms("the", variantsOf("the"))).toEqual(variantsOf("the"));
		expect(preferOForms("either", variantsOf("either"))).toEqual(variantsOf("either"));
	});
	it("ignores the word's case", () => {
		expect(preferOForms("CAUGHT", ["K A1 T", "K O1 T"])).toEqual(["K O1 T", "K A1 T"]);
	});
	it("returns a copy", () => {
		const variants = ["K A1 T", "K O1 T"];
		preferOForms("caught", variants);
		expect(variants).toEqual(["K A1 T", "K O1 T"]);
	});
});
