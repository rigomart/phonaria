import { EnglishPhonemeContrasts, getWordAudioPath } from "@phonaria/phonetics-data";
import { EnglishWordAudio } from "@phonaria/phonetics-data/data/en/word-audio";
import { describe, expect, it } from "vitest";
import { getHeadlinePair } from "./headline-pairs";
import {
	contrastPageDescription,
	contrastPageHeading,
	contrastPageHref,
	getContrastPage,
	listContrastPagePaths,
} from "./minimal-pairs";

describe("contrast pages", () => {
	it("has one page per catalog contrast, at its ID, in catalog order", () => {
		expect(listContrastPagePaths()).toEqual(
			EnglishPhonemeContrasts.map((contrast) => `/minimal-pairs/${contrast.id}`),
		);
	});

	it("holds the contrast's sounds and every one of its pairs", () => {
		const page = getContrastPage("th-s");
		expect(page?.category).toBe("consonant");
		expect(page?.sounds.map(({ id, ipa, label }) => ({ id, ipa, label }))).toEqual([
			{ id: "TH", ipa: "θ", label: "Voiceless dental fricative" },
			{ id: "S", ipa: "s", label: "Voiceless alveolar fricative" },
		]);
		expect(page?.pairs).toHaveLength(11);
		expect(page?.pairs).toContainEqual(["think", "sink"]);
	});

	it("links each sound to its page and to the other contrasts it is in", () => {
		const [th, s] = getContrastPage("th-s")?.sounds ?? [];
		expect(th?.path).toBe("/sounds/th-thin");
		expect(s?.path).toBe("/sounds/s-sun");
		expect(th?.otherContrasts).toEqual([
			{ id: "th-t", ipas: ["θ", "t"], example: ["three", "tree"] },
		]);
		expect(s?.otherContrasts.map(({ id }) => id)).toEqual(["s-z", "s-sh"]);
	});

	it("has no page for an unknown contrast", () => {
		expect(getContrastPage("th-zz")).toBeUndefined();
	});

	it("adds the practice word to the URL only when there is one", () => {
		expect(contrastPageHref("i-ix")).toBe("/minimal-pairs/i-ix");
		expect(contrastPageHref("i-ix", "ship")).toBe("/minimal-pairs/i-ix?word=ship");
	});
});

describe("how the two sounds differ", () => {
	const difference = (id: string) => getContrastPage(id)?.difference;

	it("says, in plain words, only what differs", () => {
		expect(difference("p-b")).toBe(
			"/p/ is made with the voice off. /b/ is made with the voice on. Everything else is the same.",
		);
		expect(difference("th-s")).toBe(
			"/θ/ is made with the tongue between the teeth. /s/ is made with the tongue tip on the gum ridge behind the top teeth. Everything else is the same.",
		);
	});

	it("says what the air does when that differs", () => {
		expect(difference("ch-sh")).toBe(
			"/tʃ/ is made by stopping the air and releasing it as a hiss. /ʃ/ is made by pushing air through a narrow gap. Everything else is the same.",
		);
		expect(difference("th-t")).toBe(
			"/θ/ is made with the tongue between the teeth, pushing air through a narrow gap. /t/ is made with the tongue tip on the gum ridge behind the top teeth, stopping the air and releasing it. Everything else is the same.",
		);
	});

	it("compares vowels by how open the mouth is, where the tongue sits and the lips", () => {
		expect(difference("i-ix")).toBe(
			"Compared with /ɪ/, /i/ is said with the mouth less open and the tongue further forward.",
		);
		expect(difference("ux-ah")).toBe(
			"Compared with /ʊ/, /ʌ/ is said with the mouth more open, the tongue further back and the lips relaxed.",
		);
	});

	it("compares diphthongs by where they start and end", () => {
		expect(difference("ai-ei")).toBe(
			"Compared with /aɪ/, /eɪ/ starts with the mouth less open. Both end the same way.",
		);
	});

	it("compares every contrast in the catalog rather than falling back to the two labels", () => {
		for (const { id } of EnglishPhonemeContrasts) {
			expect(difference(id), id).toMatch(/ is made |^Compared with /);
		}
	});
});

describe("headline pairs", () => {
	it("leads each page with its headline pair, and names first the sound in its first word", () => {
		const page = getContrastPage("i-ix");
		expect(page?.headline).toEqual(["ship", "sheep"]);
		expect(page?.sounds.map(({ ipa }) => ipa)).toEqual(["ɪ", "i"]);
		expect(page?.pairs[0]).toEqual(["sit", "seat"]);
		expect(page && contrastPageHeading(page)).toBe("/ɪ/ vs /i/: ship vs sheep");
	});

	it("keeps the catalog's sound order and first pair where the map has no entry", () => {
		const page = getContrastPage("p-b");
		expect(page?.headline).toEqual(["pat", "bat"]);
		expect(page?.sounds.map(({ ipa }) => ipa)).toEqual(["p", "b"]);
	});

	it("picks a pair from its own contrast for every contrast", () => {
		for (const contrast of EnglishPhonemeContrasts) {
			const page = getContrastPage(contrast.id);
			const pairs = page?.pairs.map((pair) => pair.join(" ")) ?? [];
			expect(pairs, contrast.id).toContain(page?.headline.join(" "));
		}
	});

	it("has a recording of both words of every headline pair, so 'with audio' stays true", () => {
		for (const { id } of EnglishPhonemeContrasts) {
			for (const word of getHeadlinePair(id)) {
				expect(getWordAudioPath(EnglishWordAudio, "en-us", word), `${id}: ${word}`).not.toBeNull();
			}
		}
	});
});

describe("contrast page descriptions", () => {
	const describeContrast = (id: string) => {
		const page = getContrastPage(id);
		return page && contrastPageDescription(page);
	};

	it("counts the pairs past the two it names", () => {
		expect(describeContrast("th-s")).toBe(
			"Hear the difference between think and sink, thin and sin, and 9 more word pairs that differ only by the voiceless TH /θ/ and S /s/ sounds, with recordings.",
		);
	});

	it("says one more pair, in the singular, for a contrast with three", () => {
		expect(getContrastPage("ch-j")?.pairs).toHaveLength(3);
		expect(describeContrast("ch-j")).toBe(
			"Hear the difference between rich and ridge, batch and badge, and one more word pair that differs only by the CH /tʃ/ and J /dʒ/ sounds, with recordings.",
		);
	});

	it("names both pairs of a contrast with two", () => {
		expect(getContrastPage("dh-z")?.pairs).toHaveLength(2);
		expect(describeContrast("dh-z")).toMatch(
			/^Hear the difference between \w+ and \w+, and \w+ and \w+, two word pairs that differ only by the voiced TH \/ð\/ and Z \/z\/ sounds, with recordings\.$/,
		);
	});
});
