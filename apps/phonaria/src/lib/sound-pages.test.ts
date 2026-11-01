import {
	EnglishPhonemeSpellingPatterns,
	getLanguagePhonemeIds,
	type EnglishPhonemeSymbolId,
} from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import {
	findSoundHeading,
	findSoundPagePath,
	getPhonemeIdForSoundSlug,
	getSoundName,
	getSoundSlug,
	listSoundPagePaths,
	soundHeading,
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

describe("sound names", () => {
	it("gives every en-us sound a heading with its everyday name and symbol", () => {
		for (const phonemeId of sounds) {
			expect(soundHeading(phonemeId)).toMatch(/^[A-Z][A-Za-z ]* \/.+\/$/);
		}
	});

	it("uses the names the spec lists", () => {
		expect(soundHeading("TH")).toBe("Voiceless TH /θ/");
		expect(soundHeading("DH")).toBe("Voiced TH /ð/");
		expect(soundHeading("AX")).toBe("Schwa /ə/");
		expect(soundHeading("I")).toBe("Long E /i/");
		expect(soundHeading("O")).toBe("AW /ɔ/");
		expect(soundHeading("P")).toBe("P /p/");
		expect(getSoundName("AE")).toBe("short A");
	});

	it("names only en-us sounds", () => {
		expect(findSoundHeading("en-us", "TH")).toBe("Voiceless TH /θ/");
		expect(findSoundHeading("es-419", "S")).toBeUndefined();
		expect(findSoundHeading("en-us", "EE")).toBeUndefined();
	});
});

describe("soundPageTitle", () => {
	it("names the sound, its symbol and the word in its slug", () => {
		expect(soundPageTitle("TH")).toBe("How to pronounce the voiceless TH sound /θ/ (as in 'thin')");
		expect(soundPageTitle("AI")).toBe("How to pronounce the long I sound /aɪ/ (as in 'time')");
	});

	it("uses the first spelling example when the slug has no word", () => {
		expect(soundPageTitle("AX")).toBe("How to pronounce the schwa sound /ə/ (as in 'sofa')");
	});
});

describe("soundPageDescription", () => {
	it("names two example words and each contrast's headline pair", () => {
		expect(soundPageDescription("TH")).toBe(
			"How to say the voiceless TH sound /θ/ in 'thin' and 'think': how it's made, how it's spelled, and minimal pairs like three vs tree and think vs sink.",
		);
		expect(soundPageDescription("IX")).toBe(
			"How to say the short I sound /ɪ/ in 'sit' and 'big': how it's made, how it's spelled, and minimal pairs like ship vs sheep.",
		);
	});

	it("lists at most three pairs", () => {
		for (const phonemeId of sounds) {
			const pairs = soundPageDescription(phonemeId).match(/ vs /g) ?? [];
			expect(pairs.length, phonemeId).toBeLessThanOrEqual(3);
		}
	});

	it("leaves minimal pairs out for a sound without contrasts", () => {
		expect(soundPageDescription("H")).toBe(
			"How to say the H sound /h/ in 'house' and 'hello': how it's made and how it's spelled.",
		);
	});
});
