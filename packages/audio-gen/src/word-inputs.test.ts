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
		expect(() => buildAzureWordInput(getWordPronunciation("unreviewed", ["H AX0 L OU1"]))).toThrow(
			/syllable/i,
		);
		expect(() => buildAzureWordInput(getWordPronunciation("adapt", ["AX0 D A1 P T"]))).toThrow(
			/dictionary/i,
		);
	});
	it.each([
		["away", "ə.ˈweɪ"],
		["bigger", "ˈbɪ.ɡɚ"],
		["city", "ˈsɪ.ti"],
		["coffee", "ˈkɔ.fi"],
		["dogs", "dɔɡz"],
		["dinner", "ˈdɪ.nɚ"],
		["father", "ˈfɑ.ðɚ"],
		["happy", "ˈhæ.pi"],
		["hello", "hə.ˈloʊ"],
		["ladder", "ˈlæ.dɚ"],
		["lemon", "ˈlɛ.mən"],
		["letter", "ˈlɛ.tɚ"],
		["measure", "ˈmɛ.ʒɚ"],
		["mother", "ˈmʌ.ðɚ"],
		["nation", "ˈneɪ.ʃən"],
		["rabbit", "ˈɹæ.bət"],
		["sofa", "ˈsoʊ.fə"],
		["summer", "ˈsʌ.mɚ"],
		["vision", "ˈvɪ.ʒən"],
	])("preserves checked spelling syllables and stress for %s", (word, ipa) => {
		const pronunciation = collectWordsWithPhonemic("spelling").find((entry) => entry.word === word);
		if (!pronunciation) throw new Error(`Missing spelling word: ${word}`);
		expect(getAzureIpa(pronunciation)).toBe(ipa);
	});
});

describe("Practice checked syllables", () => {
	it.each([
		["assessment", "ə.ˈsɛs.mənt"],
		["annual", "ˈæn.ju.əl"],
		["familiar", "fə.ˈmɪl.jɚ"],
		["environment", "ɪn.ˈvaɪ.ɹən.mənt"],
		["seriously", "ˈsɪ.ɹi.əs.li"],
		["successful", "sək.ˈsɛs.fəl"],
		["useful", "ˈjus.fəl"],
		["visual", "ˈvɪ.ʒə.wəl"],
		["communication", "kə.ˌmju.nə.ˈkeɪ.ʃən"],
		["reaction", "ɹi.ˈæk.ʃən"],
	])("preserves reviewed Practice boundaries for %s", (word, ipa) => {
		const entry = collectWordsWithPhonemic("practice").find((entry) => entry.word === word);
		if (!entry) throw new Error(`Missing Practice word: ${word}`);
		expect(getAzureIpa(entry)).toBe(ipa);
	});
	it("preserves every pinned token and stress across the 358 inputs", () => {
		for (const entry of collectWordsWithPhonemic("practice")) {
			const ipa = getAzureIpa(entry);
			expect(ipa.split("."), entry.word).toHaveLength(entry.variant.match(/[012]/g)!.length);
			expect(ipa.match(/ˈ/g), entry.word).toHaveLength(entry.variant.match(/1/g)!.length);
			expect(ipa.match(/ˌ/g)?.length ?? 0, entry.word).toBe(entry.variant.match(/2/g)?.length ?? 0);
			expect(buildAzureWordInput(entry).text.match(/<phoneme /g), entry.word).toHaveLength(1);
		}
	});
});
