import { type EnglishPhonemeSymbolId, getLanguagePhonemeIds } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { getPhonemeComparisons } from "./phoneme-comparisons";
import {
	getCommonWords,
	getRelatedSounds,
	getSoundVariants,
	getVoicingPartner,
	getVowelNeighbours,
	howItsMade,
	soundSummary,
} from "./sound-page-content";

const sounds = getLanguagePhonemeIds("en-us") as readonly EnglishPhonemeSymbolId[];

describe("the summary line", () => {
	it("names the letters in two example words, once when they spell it the same way", () => {
		expect(soundSummary("TH")).toBe(
			"/θ/ is the th in 'thin' and 'think'. Its voiced partner is /ð/, the th in 'this'.",
		);
		expect(soundSummary("T")).toBe(
			"/t/ is the t in 'top' and the tt in 'letter'. Its voiced partner is /d/, the d in 'day'.",
		);
		expect(soundSummary("AX")).toBe("/ə/ is the a in 'sofa' and the o in 'lemon'.");
	});

	it("names the voiceless partner of a voiced sound, and no partner where there is none", () => {
		expect(soundSummary("DH")).toContain("Its voiceless partner is /θ/, the th in 'thin'.");
		expect(soundSummary("H")).toBe("/h/ is the h in 'house' and 'hello'.");
	});
});

describe("voicing partners", () => {
	it("pairs the eight consonants made alike but for the voice", () => {
		const pairs = sounds.flatMap((id) => {
			const partner = getVoicingPartner(id);
			return partner && id < partner ? [`${id}-${partner}`] : [];
		});
		expect(pairs.sort()).toEqual(["B-P", "CH-J", "D-T", "DH-TH", "F-V", "G-K", "S-Z", "SH-ZH"]);
	});
});

describe("how it's made", () => {
	it("says a consonant's place, manner and voicing in the contrast pages' words", () => {
		expect(howItsMade("TH")).toBe(
			"/θ/ is made with the tongue between the teeth, pushing air through a narrow gap, with the voice off.",
		);
	});

	it("words every sound's features in plain language, with no feature names left over", () => {
		for (const id of sounds) {
			expect(howItsMade(id), id).not.toMatch(
				/alveolar|dental|velar|plosive|fricative|nasal|approximant|close|open|-mid|near-|unrounded/,
			);
		}
	});

	it("says where the tongue and lips are for a vowel, and where a diphthong glides", () => {
		expect(howItsMade("AX")).toBe(
			"/ə/ is made with the tongue halfway up and in the middle, and the lips relaxed.",
		);
		expect(howItsMade("ER")).toBe(
			"/ɝ/ is made with the tongue fairly low and in the middle, bunched up as for r, and the lips relaxed.",
		);
		expect(howItsMade("AU")).toBe(
			"/aʊ/ starts with the tongue very low, toward the front, and glides to fairly high, toward the back, rounding the lips.",
		);
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

describe("related sounds", () => {
	it("links /θ/ to /ð/, its voicing partner with the same spelling", () => {
		expect(getRelatedSounds("TH")).toEqual([
			{ id: "DH", ipa: "ð", name: "voiced TH", word: "this", path: "/sounds/th-this" },
		]);
	});

	it("gives schwa its neighbouring vowels though it has no contrasts", () => {
		expect(getRelatedSounds("AX").map(({ ipa }) => ipa)).toEqual(["æ", "ɝ", "ɛ", "ʌ"]);
	});

	it("never lists the sound, a contrast partner, or more than four", () => {
		for (const id of sounds) {
			const related = getRelatedSounds(id).map((sound) => sound.id);
			const partners = getPhonemeComparisons("en-us", id).map(({ partnerId }) => partnerId);
			expect(related.length, id).toBeLessThanOrEqual(4);
			expect(new Set(related).size, id).toBe(related.length);
			expect(related, id).not.toContain(id);
			for (const partner of partners) expect(related, id).not.toContain(partner);
		}
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
