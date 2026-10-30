import {
	EnglishPhonemeSpellingPatterns,
	getLanguagePhonemeIds,
	type EnglishPhonemeSymbolId,
} from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import {
	findSoundPagePath,
	getPhonemeIdForSoundSlug,
	getSoundSlug,
	listSoundPagePaths,
	soundPageDescription,
	soundPagePath,
	soundPageTitle,
} from "./sound-pages";

const sounds = getLanguagePhonemeIds("en-us");

describe("sound slugs", () => {
	it("gives every en-us sound exactly one slug, each naming only that sound", () => {
		const slugs = sounds.map(getSoundSlug);
		expect(new Set(slugs).size).toBe(sounds.length);
		for (const phonemeId of sounds) {
			expect(getPhonemeIdForSoundSlug(getSoundSlug(phonemeId))).toBe(phonemeId);
		}
	});

	it("uses readable lowercase words, never IDs or IPA", () => {
		for (const phonemeId of sounds) {
			expect(getSoundSlug(phonemeId)).toMatch(/^[a-z]+(-[a-z]+)?$/);
		}
	});

	it("ends each slug with a word from the sound's spelling examples", () => {
		const spellings = EnglishPhonemeSpellingPatterns as Partial<
			Record<EnglishPhonemeSymbolId, { examples: readonly { word: string }[] }>
		>;
		for (const phonemeId of sounds) {
			const slug = getSoundSlug(phonemeId);
			if (slug === "schwa") continue;
			const words = spellings[phonemeId]?.examples.map(({ word }) => word);
			expect(words, slug).toContain(slug.split("-").at(-1));
		}
	});

	it("keeps the slugs the spec names", () => {
		expect(getSoundSlug("TH")).toBe("th-thin");
		expect(getSoundSlug("AX")).toBe("schwa");
		expect(getSoundSlug("AE")).toBe("ae-cat");
	});

	it("finds no sound for an unknown slug, an ID or IPA", () => {
		expect(getPhonemeIdForSoundSlug("th")).toBeUndefined();
		expect(getPhonemeIdForSoundSlug("TH")).toBeUndefined();
		expect(getPhonemeIdForSoundSlug("θ")).toBeUndefined();
		expect(getPhonemeIdForSoundSlug("constructor")).toBeUndefined();
	});

	it("puts each sound's page under /sounds", () => {
		expect(soundPagePath("TH")).toBe("/sounds/th-thin");
	});

	it("finds a page only for an en-us sound", () => {
		expect(findSoundPagePath("en-us", "TH")).toBe("/sounds/th-thin");
		expect(findSoundPagePath("es-419", "S")).toBeUndefined();
		expect(findSoundPagePath("en-us", "EE")).toBeUndefined();
	});

	it("lists every sound's page once, consonants then vowels", () => {
		const paths = listSoundPagePaths();
		expect(new Set(paths).size).toBe(sounds.length);
		expect(paths).toHaveLength(sounds.length);
		expect(paths[0]).toBe("/sounds/p-pat");
		expect(paths.at(-1)).toBe("/sounds/oy-boy");
	});
});

describe("soundPageTitle", () => {
	it("names the sound by its symbol and the letters that spell it in the slug's word", () => {
		expect(soundPageTitle("TH")).toBe("The /θ/ sound (th in 'thin'): how to pronounce it");
		expect(soundPageTitle("DH")).toBe("The /ð/ sound (th in 'this'): how to pronounce it");
	});

	it("joins split spellings with a hyphen, as the patterns write them", () => {
		expect(soundPageTitle("AI")).toBe("The /aɪ/ sound (i-e in 'time'): how to pronounce it");
	});

	it("uses the first spelling example when the slug has no word", () => {
		expect(soundPageTitle("AX")).toBe("The /ə/ sound (a in 'sofa'): how to pronounce it");
	});
});

describe("soundPageDescription", () => {
	it("says what the sound is and what its page covers", () => {
		expect(soundPageDescription("TH")).toBe(
			"How to say /θ/ as in 'thin', the voiceless dental fricative: how it's made, spellings (th), minimal pairs with /t/ and /s/, and how common it is.",
		);
	});

	it("describes a diphthong by its glide", () => {
		expect(soundPageDescription("AI")).toMatch(
			/^How to say \/aɪ\/ as in 'time', a vowel that glides from \/a\/ to \/ɪ\/: /,
		);
	});

	it("leaves minimal pairs out for a sound without contrasts", () => {
		expect(soundPageDescription("H")).toBe(
			"How to say /h/ as in 'house', the voiceless glottal fricative: how it's made, spellings (h), and how common it is.",
		);
	});
});
