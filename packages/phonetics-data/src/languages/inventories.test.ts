import { describe, expect, it } from "vitest";
import {
	getLanguagePhonemeCount,
	getLanguagePhonemeIds,
	getLanguagePhonemeInventory,
	getPhonemeType,
	isPhonemeInLanguage,
	PhonemeIpaMap,
	type PhonemeSymbolId,
	TARGET_ACCENTS,
} from "../index";

describe.each(TARGET_ACCENTS)("%s phoneme inventory", (accent) => {
	it("partitions its sounds without duplicates or omissions", () => {
		const inventory = getLanguagePhonemeInventory(accent);
		expect(inventory.vowels).toEqual([...inventory.monophthongs, ...inventory.diphthongs]);
		expect(inventory.phonemes).toEqual([...inventory.consonants, ...inventory.vowels]);
		for (const subset of [
			"consonants",
			"monophthongs",
			"diphthongs",
			"vowels",
			"phonemes",
		] as const) {
			const ids = getLanguagePhonemeIds(accent, subset);
			expect(new Set(ids).size, subset).toBe(ids.length);
			expect(ids, subset).toEqual(inventory[subset]);
		}
		expect(getLanguagePhonemeIds(accent)).toEqual(inventory.phonemes);
	});

	it("uses only core IDs of the correct sound type", () => {
		const inventory = getLanguagePhonemeInventory(accent);
		for (const [type, ids] of [
			["consonant", inventory.consonants],
			["monophthong", inventory.monophthongs],
			["diphthong", inventory.diphthongs],
		] as const) {
			for (const id of ids) {
				expect(Object.getOwnPropertyDescriptor(PhonemeIpaMap, id), id).toBeDefined();
				expect(getPhonemeType(id), id).toBe(type);
			}
		}
	});

	it("reports counts matching the sounds a consumer receives", () => {
		const inventory = getLanguagePhonemeInventory(accent);
		expect(getLanguagePhonemeCount(accent)).toEqual({
			consonants: inventory.consonants.length,
			monophthongs: inventory.monophthongs.length,
			diphthongs: inventory.diphthongs.length,
			vowels: inventory.vowels.length,
			total: inventory.phonemes.length,
		});
	});

	it("accepts exactly the IDs in its inventory", () => {
		const ids: readonly PhonemeSymbolId[] = getLanguagePhonemeIds(accent);
		for (const id of Object.keys(PhonemeIpaMap) as PhonemeSymbolId[]) {
			expect(isPhonemeInLanguage(accent, id), id).toBe(ids.includes(id));
		}
	});
});

describe("accent-specific sounds", () => {
	it.each([
		["en-us", "E", true],
		["en-us", "EE", false],
		["en-us", "TH", true],
		["en-us", "RR", false],
		["es-419", "E", false],
		["es-419", "EE", true],
		["es-419", "TH", false],
		["es-419", "RR", true],
		["es-419", "AX", false],
		["es-419", "P", true],
	] as const)("%s membership of %s is %s", (accent, id, expected) => {
		expect(isPhonemeInLanguage(accent, id)).toBe(expected);
	});
});
