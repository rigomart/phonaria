import { getLanguagePhonemeIds } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import {
	CONSONANT_KEYS,
	describeSound,
	getSound,
	PALETTE_KEYS,
	searchSounds,
	VOWEL_KEYS,
} from "./sound-palette";

describe("palette coverage", () => {
	it("covers the English inventory exactly once each", () => {
		const inventory = [...getLanguagePhonemeIds("en-us")].sort();
		const palette = PALETTE_KEYS.map((key) => key.id).sort();
		expect(palette).toEqual(inventory);
	});

	it("splits consonants from vowels with no overlap", () => {
		expect([...CONSONANT_KEYS, ...VOWEL_KEYS]).toEqual(PALETTE_KEYS);
		const consonants = new Set(CONSONANT_KEYS.map((key) => key.id));
		expect(VOWEL_KEYS.some((key) => consonants.has(key.id))).toBe(false);
	});

	it("carries the IPA symbol, ARPABET label, and articulatory label", () => {
		expect(getSound("AX")).toMatchObject({ ipa: "ə", arpabet: "AX" });
		expect(getSound("AX").label).toMatch(/central/i);
		expect(getSound("H").arpabet).toBe("HH");
	});
});

describe("describeSound", () => {
	it("leads with the learner's nickname when there is one", () => {
		expect(describeSound(getSound("AX"))).toBe("schwa, /ə/");
	});

	it("falls back to the articulatory label", () => {
		expect(describeSound(getSound("P"))).toBe("voiceless bilabial plosive, /p/");
	});
});

describe("searchSounds", () => {
	it("returns nothing for an empty query so the palette stays undimmed", () => {
		expect(searchSounds("")).toEqual([]);
		expect(searchSounds("   ")).toEqual([]);
	});

	it("ranks the IPA symbol first", () => {
		expect(searchSounds("ə")[0]?.id).toBe("AX");
		expect(searchSounds("ʃ")[0]?.id).toBe("SH");
	});

	it("ranks the phoneme ID first, case-insensitively", () => {
		expect(searchSounds("AX")[0]?.id).toBe("AX");
		expect(searchSounds("ax")[0]?.id).toBe("AX");
		expect(searchSounds("sh")[0]?.id).toBe("SH");
	});

	it("ranks the ARPABET label first", () => {
		expect(searchSounds("HH")[0]?.id).toBe("H");
		expect(searchSounds("jh")[0]?.id).toBe("J");
	});

	it("ranks a learner nickname first", () => {
		expect(searchSounds("schwa")[0]?.id).toBe("AX");
		expect(searchSounds("eth")[0]?.id).toBe("DH");
	});

	it("ranks an example word first", () => {
		expect(searchSounds("cat")[0]?.id).toBe("AE");
		expect(searchSounds("boy")[0]?.id).toBe("OI");
	});

	it("matches articulatory labels in plain language", () => {
		const ids = searchSounds("bilabial").map((sound) => sound.id);
		expect(ids).toContain("P");
		expect(ids).toContain("B");
		expect(ids).toContain("M");
		expect(ids).not.toContain("S");
	});

	it("lets one exact hit beat a pile of weak ones", () => {
		// /w/ matches "away" and "approximant"; /ɑ/'s ID *is* the query.
		expect(searchSounds("a")[0]?.id).toBe("A");
	});

	it("reads 'uh' as the learner's name for schwa, not ARPABET's /ʊ/", () => {
		const ids = searchSounds("uh").map((sound) => sound.id);
		expect(ids[0]).toBe("AX");
		expect(ids).toContain("UX");
	});

	it("prefers an exact match over a longer word that merely starts with it", () => {
		// "ash" is AE's nickname; "ahead" (H) only contains the letters.
		expect(searchSounds("ash")[0]?.id).toBe("AE");
	});

	it("never returns the same sound twice", () => {
		const ids = searchSounds("a").map((sound) => sound.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("returns an empty list when nothing matches", () => {
		expect(searchSounds("qqqq")).toEqual([]);
	});

	it("ties break by palette order so the dropdown is stable", () => {
		const plosives = searchSounds("plosive").map((sound) => sound.id);
		expect(plosives).toEqual(["P", "B", "T", "D", "K", "G"]);
	});
});
