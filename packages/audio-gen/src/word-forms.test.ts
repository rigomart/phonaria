import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { describe, expect, it } from "vitest";
import { collectCuratedWords, pickPronunciation } from "./curated-words";
import { recordedBeforeTop10k } from "./fixtures/recorded-before-top-10k";
import { isFormCandidate, rejectedForms } from "./form-candidates";
import { curatedPronunciations } from "./reviewed-pronunciations";
import { formSlug, isFormSlug, wordForms } from "./word-forms";
import { getWordPronunciation } from "./words";

// The top-10k as planned before its upload, whose candidate forms were reviewed.
const planned = collectCuratedWords("top-10k", { recorded: recordedBeforeTop10k }).words;
const rejected = new Set(Object.values(rejectedForms).flat());

describe("reviewed word forms", () => {
	it("lists only words the top-10k plans, so every form gets planned", () => {
		const plannedWords = new Set(planned.map(({ word }) => word));
		expect(Object.keys(wordForms).filter((word) => !plannedWords.has(word))).toEqual([]);
	});
	it.each(Object.entries(wordForms))("numbers and labels every form of %s", (word, forms) => {
		expect(forms.extra.map(({ n }) => n)).toEqual(forms.extra.map((_, index) => index + 2));
		const variants = [
			pickPronunciation(word, EnglishCuratedTop10k.words[word]).variant,
			...forms.extra.map(({ variant }) => variant),
		];
		expect(new Set(variants).size, word).toBe(variants.length);
		for (const variant of variants)
			expect(() => getWordPronunciation(word, [variant])).not.toThrow();
		for (const { label } of [...(forms.primary ? [forms.primary] : []), ...forms.extra])
			expect(label.trim()).not.toBe("");
	});
	it("pins a word's main form in one place only", () => {
		const both = Object.keys(wordForms).filter(
			(word) => wordForms[word].primary && curatedPronunciations[word],
		);
		expect(both).toEqual([]);
	});
	it('adds "also said" forms only where the rules find a difference a learner hears', () => {
		for (const [word, forms] of Object.entries(wordForms)) {
			if (forms.primary) continue;
			const chosen = pickPronunciation(word, EnglishCuratedTop10k.words[word]).variant;
			for (const { variant, label } of forms.extra) {
				expect(label).toBe("also said");
				expect(isFormCandidate(chosen, variant), `${word}: ${variant}`).toBe(true);
			}
		}
	});
	it("has reviewed every candidate form, and rejects only current candidates", () => {
		const unreviewed: string[] = [];
		const candidates = new Set<string>();
		for (const { word, variants } of planned) {
			const forms = wordForms[word];
			if (forms?.primary) continue;
			const chosen = pickPronunciation(word, variants).variant;
			for (const variant of new Set(variants)) {
				if (variant === chosen || !isFormCandidate(chosen, variant)) continue;
				const entry = `${word}: ${variant}`;
				candidates.add(entry);
				if (!forms?.extra.some((form) => form.variant === variant) && !rejected.has(entry))
					unreviewed.push(entry);
			}
		}
		expect(unreviewed).toEqual([]);
		expect([...rejected].filter((entry) => !candidates.has(entry))).toEqual([]);
	});
});

describe("form candidates", () => {
	it.each([
		["data", "D EI1 T AX0", "D AE1 T AX0", true],
		["record", "R E1 K ER0 D", "R IX0 K O1 R D", false],
		["research", "R I0 S ER1 CH", "R I1 S ER0 CH", true],
		["every", "E1 V ER0 I0", "E1 V R I0", false],
		["passes", "P AE1 S AX0 Z", "P AE1 S IX0 Z", false],
		["with", "W IX1 DH", "W IX1 TH", false],
		["law", "L O1", "L A1", false],
		["carry", "K AE1 R I0", "K E1 R I0", false],
		["when", "W E1 N", "W IX1 N", false],
		["the", "DH AH1", "DH AX0", false],
		["fifteen", "F IX0 F T I1 N", "F IX1 F T I1 N", false],
	])("judges %s: %s vs %s", (_word, chosen, other, expected) => {
		expect(isFormCandidate(chosen, other)).toBe(expected);
	});
});

describe("form file names", () => {
	it("keeps the plain word for the main form and adds --n for others", () => {
		expect(formSlug("minute")).toBe("minute");
		expect(formSlug("minute", 2)).toBe("minute--2");
		expect(["minute", "minute--2"].every(isFormSlug)).toBe(true);
		expect(["minute-2", "minute--1", "minute--10", "it's", "Minute"].some(isFormSlug)).toBe(false);
	});
});
