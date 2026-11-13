import {
	type EnglishPhonemeSymbolId,
	getLanguagePhonemeIds,
	isVowelPhoneme,
} from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { getPhonemeComparisons } from "./phoneme-comparisons";
import {
	compareSounds,
	describeHowItsMade,
	getAllComparisons,
	getCommonWords,
	getNeighbourPages,
	getSharedSpellings,
	getSoundFeatures,
	getSoundVariants,
} from "./sound-page-content";

const sounds = getLanguagePhonemeIds("en-us") as readonly EnglishPhonemeSymbolId[];

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
	it("sets apart the features that differ", () => {
		expect(compareSounds("TH", "T")).toEqual([
			{ label: "Place", own: "dental", other: "alveolar" },
			{ label: "Manner", own: "fricative", other: "plosive" },
		]);
		expect(compareSounds("AE", "E")).toEqual([
			{ label: "Height", own: "near-open", other: "open-mid" },
		]);
	});

	it("finds a difference for every contrast in the catalog", () => {
		for (const id of sounds) {
			for (const { partnerId } of getAllComparisons(id)) {
				const differences = compareSounds(id, partnerId as EnglishPhonemeSymbolId);
				expect(differences.length, `${id}-${partnerId}`).toBeGreaterThan(0);
			}
		}
	});
});

describe("how a sound is made", () => {
	it("is a consonant's place, manner and voicing in one plain sentence", () => {
		expect(describeHowItsMade("T")).toBe(
			"/t/ is made with the tongue tip on the gum ridge behind the top teeth, stopping the air and releasing it, with the voice off.",
		);
	});

	it("has no sentence yet for a vowel", () => {
		expect(describeHowItsMade("AE")).toBeUndefined();
		expect(describeHowItsMade("AU")).toBeUndefined();
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
	it("says what each variant of /t/ sounds like and when, with its example words", () => {
		expect(getSoundVariants("T")).toEqual([
			{
				ipa: "tʰ",
				sound: "A short burst of air comes out after the sound. You can feel it on your hand.",
				when: "at the start of a word, or at the start of a stressed syllable.",
				words: ["top", "attack"],
			},
			{
				ipa: "t",
				sound: "No burst of air, so it sounds closer to b, d or g.",
				when: "right after s at the start of a word.",
				words: ["stop", "stay"],
			},
			{
				ipa: "ɾ",
				sound: "Sounds like a very quick d: the tongue taps the roof of the mouth once.",
				when: "after a vowel or r, if the next vowel is not stressed.",
				words: ["water", "city", "party"],
			},
			{
				ipa: "ʔ",
				sound: "No t sound. The air stops in the throat for a moment instead.",
				when: "before a consonant, as in button and football, and often at the end of a sentence.",
				words: ["button", "football"],
			},
		]);
	});

	it("gives every vowel but the schwa a variant, and the consonants that change most", () => {
		expect(sounds.filter((id) => getSoundVariants(id).length > 0).sort()).toEqual(
			[
				...sounds.filter((id) => id !== "AX" && isVowelPhoneme(id)),
				"D",
				"K",
				"L",
				"N",
				"P",
				"T",
			].sort(),
		);
	});
});
