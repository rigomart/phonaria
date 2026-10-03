import { describe, expect, it } from "vitest";
import { buildAzureWordInput, getAzureIpa } from "./word-inputs";
import { collectWordsWithPhonemic, getWordPronunciation } from "./words";

describe("Azure IPA inputs", () => {
	it.each([
		["seat", "sit"],
		["adapt", "ə.ˈdæpt"],
		["adopt", "ə.ˈdɑpt"],
		["belief", "bɪ.ˈlif"],
		["believe", "bɪ.ˈliv"],
		["berry", "ˈbɛ.ɹi"],
		["body", "ˈbɑ.di"],
		["buddy", "ˈbʌ.di"],
		["closing", "ˈkloʊ.zɪŋ"],
		["clothing", "ˈkloʊ.ðɪŋ"],
		["liver", "ˈlɪ.vɚ"],
		["river", "ˈɹɪ.vɚ"],
		["rifle", "ˈɹaɪ.fəl"],
		["rival", "ˈɹaɪ.vəl"],
		["very", "ˈvɛ.ɹi"],
		["washing", "ˈwɑ.ʃɪŋ"],
		["watching", "ˈwɑ.tʃɪŋ"],
	])("preserves dictionary sounds and stress for %s", (word, ipa) => {
		const pronunciation = collectWordsWithPhonemic().find((entry) => entry.word === word);
		expect(pronunciation).toBeDefined();
		if (!pronunciation) throw new Error(`Missing fixture word: ${word}`);
		expect(getAzureIpa(pronunciation)).toBe(ipa);
		expect(buildAzureWordInput(pronunciation).text).toBe(
			`<phoneme alphabet="ipa" ph="${ipa}">${word}</phoneme>`,
		);
	});
	it("can build explicit pronunciation requests for the full catalog", () => {
		const inputs = collectWordsWithPhonemic().map(buildAzureWordInput);
		expect(inputs).toHaveLength(400);
		expect(inputs.every(({ text }) => text.startsWith('<phoneme alphabet="ipa"'))).toBe(true);
	});
	it("requires checked syllables for new or changed multisyllabic pronunciations", () => {
		expect(() => buildAzureWordInput(getWordPronunciation("hello", ["H AX0 L OU1"]))).toThrow(
			/syllable/i,
		);
		expect(() => buildAzureWordInput(getWordPronunciation("adapt", ["AX0 D A1 P T"]))).toThrow(
			/dictionary/i,
		);
	});
});
