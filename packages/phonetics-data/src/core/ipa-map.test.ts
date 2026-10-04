import { describe, expect, it } from "vitest";
import {
	ConsonantIpaMap,
	DiphthongIpaMap,
	getIpaForPhonemeId,
	getPhonemeCategory,
	getPhonemeType,
	isConsonantPhoneme,
	isVowelPhoneme,
	MonophthongIpaMap,
	PhonemeCount,
	PhonemeIpaMap,
	type PhonemeSymbolId,
	VowelIpaMap,
} from "../index";

describe("IPA classification", () => {
	it.each([
		"constructor",
		"toString",
		"__proto__",
	])("rejects inherited object property %s in sound classification guards", (token) => {
		const id = token as PhonemeSymbolId;
		expect(isVowelPhoneme(id)).toBe(false);
		expect(isConsonantPhoneme(id)).toBe(false);
	});

	it.each([
		["consonant", ConsonantIpaMap],
		["monophthong", MonophthongIpaMap],
		["diphthong", DiphthongIpaMap],
	] as const)("classifies every %s consistently", (type, map) => {
		for (const key of Object.keys(map)) {
			const id = key as PhonemeSymbolId;
			expect(getPhonemeType(id), id).toBe(type);
			expect(getPhonemeCategory(id), id).toBe(type === "consonant" ? "consonant" : "vowel");
			expect(isConsonantPhoneme(id), id).toBe(type === "consonant");
			expect(isVowelPhoneme(id), id).toBe(type !== "consonant");
		}
	});

	it("assigns each ID to exactly one type without losing IDs during composition", () => {
		const ids = [
			...Object.keys(ConsonantIpaMap),
			...Object.keys(MonophthongIpaMap),
			...Object.keys(DiphthongIpaMap),
		];
		expect(new Set(ids).size).toBe(ids.length);
		expect(Object.keys(PhonemeIpaMap).sort()).toEqual(ids.sort());
		expect(Object.keys(VowelIpaMap).sort()).toEqual(
			[...Object.keys(MonophthongIpaMap), ...Object.keys(DiphthongIpaMap)].sort(),
		);
		expect(PhonemeCount).toEqual({
			consonants: Object.keys(ConsonantIpaMap).length,
			monophthongs: Object.keys(MonophthongIpaMap).length,
			diphthongs: Object.keys(DiphthongIpaMap).length,
			vowels: Object.keys(VowelIpaMap).length,
			total: ids.length,
		});
	});

	it.each([
		["E", "ɛ"],
		["EE", "e"],
		["A", "ɑ"],
		["AA", "a"],
		["O", "ɔ"],
		["OO", "o"],
		["R", "ɹ"],
		["RX", "ɾ"],
		["RR", "r"],
		["AI", "aɪ"],
	] as const)("keeps %s mapped to its distinct IPA symbol %s", (id, ipa) => {
		expect(getIpaForPhonemeId(id)).toBe(ipa);
	});
});
