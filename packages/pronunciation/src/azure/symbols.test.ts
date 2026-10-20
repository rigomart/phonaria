import { getLanguagePhonemeIds, isPhonemeInLanguage } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { AzureIpaPhonemeMap, phonemeIdsForAzureSymbol } from "./symbols";

const entries = Object.entries(AzureIpaPhonemeMap);

describe("Azure IPA symbols", () => {
	it("gives every one of the 40 en-us phonemes a symbol of its own", () => {
		const phonemes = getLanguagePhonemeIds("en-us");
		expect(phonemes).toHaveLength(40);
		const single = new Set(entries.filter(([, ids]) => ids.length === 1).map(([, [id]]) => id));
		expect(phonemes.filter((id) => !single.has(id))).toEqual([]);
	});

	it("maps only to en-us phonemes", () => {
		for (const [, ids] of entries) {
			for (const id of ids) expect(isPhonemeInLanguage("en-us", id)).toBe(true);
		}
	});

	it("writes Azure's two-sound units as two phonemes", () => {
		expect(entries.filter(([, ids]) => ids.length > 1)).toEqual([
			["ju", ["Y", "U"]],
			["ɪɹ", ["IX", "R"]],
			["ɛɹ", ["E", "R"]],
			["ʊɹ", ["UX", "R"]],
			["aɪɹ", ["AI", "R"]],
			["aʊɹ", ["AU", "R"]],
			["ɔɹ", ["O", "R"]],
			["ɑɹ", ["A", "R"]],
		]);
	});

	it("maps both r-colored schwas to ER, as Phonaria's dictionary writes them", () => {
		expect(phonemeIdsForAzureSymbol("ɝ")).toEqual(["ER"]);
		expect(phonemeIdsForAzureSymbol("ɚ")).toEqual(["ER"]);
	});

	it("accepts Azure's ASCII g and the IPA ɡ", () => {
		expect(phonemeIdsForAzureSymbol("g")).toEqual(["G"]);
		expect(phonemeIdsForAzureSymbol("ɡ")).toEqual(["G"]);
	});

	it("returns null for a symbol outside the phone set", () => {
		expect(phonemeIdsForAzureSymbol("ɾ")).toBeNull();
		expect(phonemeIdsForAzureSymbol("constructor")).toBeNull();
	});
});
