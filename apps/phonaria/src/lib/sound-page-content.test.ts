import { type EnglishPhonemeSymbolId, getLanguagePhonemeIds } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { getPhonemeComparisons } from "./phoneme-comparisons";
import {
	compareSounds,
	getAllComparisons,
	getCommonWords,
	getNeighbourPages,
	getSharedSpellings,
	getSoundFamilies,
	getSoundFeatures,
	getSoundVariants,
	getVoicingPartner,
	getVowelNeighbours,
} from "./sound-page-content";

const sounds = getLanguagePhonemeIds("en-us") as readonly EnglishPhonemeSymbolId[];

describe("voicing partners", () => {
	it("pairs the eight consonants made alike but for the voice", () => {
		const pairs = sounds.flatMap((id) => {
			const partner = getVoicingPartner(id);
			return partner && id < partner ? [`${id}-${partner}`] : [];
		});
		expect(pairs.sort()).toEqual(["B-P", "CH-J", "D-T", "DH-TH", "F-V", "G-K", "S-Z", "SH-ZH"]);
	});
});

describe("vowel neighbours", () => {
	it("are plain vowels one step away on the high/mid/low, front/central/back chart, nearest first", () => {
		expect(
			getVowelNeighbours("UX"),
			"/u/ shares the cell; /ʌ/ and /ɔ/ one step down, tied",
		).toEqual(["U", "AH", "O"]);
		expect(getVowelNeighbours("I"), "/ɪ/ shares the cell, /ɛ/ one step down, /æ/ two").toEqual([
			"IX",
			"E",
		]);
	});

	it("leave out diphthongs and consonants", () => {
		expect(getVowelNeighbours("AI")).toEqual([]);
		expect(getVowelNeighbours("T")).toEqual([]);
		for (const id of sounds) expect(getVowelNeighbours(id), id).not.toContain("EI");
	});
});

describe("features", () => {
	it("are a consonant's voice, place and manner, straight from the data", () => {
		expect(getSoundFeatures("TH").map(({ label, value }) => [label, value])).toEqual([
			["Voice", "voiceless"],
			["Place", "dental"],
			["Manner", "fricative"],
		]);
		expect(getSoundFeatures("L").at(-1)?.value).toBe("lateral approximant");
	});

	it("are a vowel's height, front or back, lips and tense or lax, and where a diphthong starts and ends", () => {
		expect(getSoundFeatures("AE").map(({ value }) => value)).toEqual([
			"near-open",
			"front",
			"unrounded",
			"lax",
		]);
		expect(getSoundFeatures("AU").map(({ label }) => label)).toEqual(["Starts", "Ends", "Lips"]);
	});
});

describe("comparing two sounds", () => {
	it("sets apart the features that differ and names the shared ones once", () => {
		expect(compareSounds("TH", "T")).toEqual({
			differences: [
				{ label: "Place", own: "dental", other: "alveolar" },
				{ label: "Manner", own: "fricative", other: "plosive" },
			],
			shared: ["voiceless"],
		});
		expect(compareSounds("AE", "E")).toEqual({
			differences: [{ label: "Height", own: "near-open", other: "open-mid" }],
			shared: ["front", "unrounded", "lax"],
		});
	});

	it("finds a difference for every contrast in the catalog", () => {
		for (const id of sounds) {
			for (const { partnerId } of getAllComparisons(id)) {
				const { differences } = compareSounds(id, partnerId as EnglishPhonemeSymbolId);
				expect(differences.length, `${id}-${partnerId}`).toBeGreaterThan(0);
			}
		}
	});
});

describe("all comparisons", () => {
	it("keep every pair, not just the two the drawer shows", () => {
		const t = getAllComparisons("TH").find(({ partnerIpa }) => partnerIpa === "t");
		expect(t?.pairs.length).toBe(14);
		expect(getPhonemeComparisons("en-us", "TH")[0].pairs).toHaveLength(2);
	});
});

describe("shared spellings", () => {
	it("names the other sounds that list the same letters", () => {
		expect(getSharedSpellings("TH")).toEqual([
			{
				pattern: "th",
				others: [{ id: "DH", ipa: "ð", name: "voiced TH", word: "this", path: "/sounds/th-this" }],
			},
		]);
	});
});

describe("sounds near it", () => {
	it("gives a consonant its voicing partner, then the rest made the same way and in the same place", () => {
		const families = getSoundFamilies("TH");
		expect(families.map(({ label }) => label)).toEqual(["Voicing partner", "Other fricatives"]);
		expect(families[0].sounds.map(({ ipa }) => ipa)).toEqual(["ð"]);
		expect(families[1].sounds.map(({ ipa }) => ipa)).not.toContain("ð");
		expect(getSoundFamilies("T").map(({ label }) => label)).toEqual([
			"Voicing partner",
			"Other plosives",
			"Also alveolar",
		]);
	});

	it("gives schwa its neighbouring vowels and a diphthong the other diphthongs", () => {
		expect(getSoundFamilies("AX")[0].sounds.map(({ ipa }) => ipa)).toEqual(["ɝ", "ɛ", "ʌ", "ɔ"]);
		expect(getSoundFamilies("AI")[0]).toMatchObject({ label: "Other diphthongs" });
		expect(getSoundFamilies("AI")[0].sounds).toHaveLength(4);
	});

	it("never lists the sound itself, or a sound twice", () => {
		for (const id of sounds) {
			const listed = getSoundFamilies(id).flatMap(({ sounds }) => sounds.map((s) => s.id));
			expect(listed, id).not.toContain(id);
			expect(new Set(listed).size, id).toBe(listed.length);
		}
	});
});

describe("previous and next", () => {
	it("walk the sounds list, with nothing before the first or after the last", () => {
		expect(getNeighbourPages("TH")).toMatchObject({
			previous: { path: "/sounds/v-van" },
			next: { path: "/sounds/th-this" },
		});
		expect(getNeighbourPages("P").previous).toBeUndefined();
		expect(getNeighbourPages("OI").next).toBeUndefined();
	});
});

describe("common words", () => {
	it("lists the most frequent top-1k words by where the sound falls", () => {
		expect(getCommonWords("TH")).toEqual({
			start: ["think", "through", "three", "things", "thing", "thought"],
			inside: ["something", "without", "anything", "nothing", "everything", "months"],
			end: ["both", "health", "death", "south", "north", "month"],
		});
	});
});

describe("sound variants", () => {
	it("labels each variant of /t/ in plain words, with its example words", () => {
		expect(getSoundVariants("T")).toEqual([
			{
				ipa: "tʰ",
				label: "With a puff of air, at the start of a stressed syllable",
				words: ["top", "time"],
			},
			{ ipa: "ɾ", label: "A quick tap of the tongue, between vowels", words: ["water"] },
			{ ipa: "ʔ", label: "A catch in the throat, before an n sound", words: ["button"] },
		]);
	});

	it("has variants for the eight sounds with variant data only", () => {
		expect(sounds.filter((id) => getSoundVariants(id).length > 0).sort()).toEqual([
			"AE",
			"D",
			"ER",
			"I",
			"K",
			"L",
			"P",
			"T",
		]);
	});
});
