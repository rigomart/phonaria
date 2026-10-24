import { describe, expect, it } from "vitest";
import { EnglishCuratedTop10k } from "../../data/en/curated-10k";
import { isOFormOf, preferOForms } from "./o-forms";

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

describe("preferOForms", () => {
	it.each([
		["caught", ["K O1 T", "K A1 T"]],
		["bought", ["B O1 T", "B A1 T"]],
		["audience", ["O1 D I0 AX0 N S", "A1 D I0 AX0 N S"]],
	])("puts the /ɔ/ form of %s first", (word, expected) => {
		expect(variantsOf(word)).toEqual([...expected].reverse());
		expect(preferOForms(variantsOf(word))).toEqual(expected);
	});
	it("swaps only the pair, leaving the forms between them in place", () => {
		expect(preferOForms(["K A1 T", "K AH1 T", "K O1 T", "K I1 T"])).toEqual([
			"K O1 T",
			"K AH1 T",
			"K A1 T",
			"K I1 T",
		]);
	});
	it("keeps an /ɔ/ form that already comes first", () => {
		expect(preferOForms(variantsOf("because"))).toEqual(variantsOf("because"));
	});
	it("keeps the order of forms that differ in something else", () => {
		expect(preferOForms(variantsOf("the"))).toEqual(variantsOf("the"));
		expect(preferOForms(variantsOf("either"))).toEqual(variantsOf("either"));
	});
	it("returns a copy", () => {
		const variants = ["K A1 T", "K O1 T"];
		preferOForms(variants);
		expect(variants).toEqual(["K A1 T", "K O1 T"]);
	});
});
