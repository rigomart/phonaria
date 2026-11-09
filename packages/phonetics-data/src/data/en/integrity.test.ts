import { describe, expect, it } from "vitest";
import dictionaryJson from "../../../data/en/dict/cmudict.json";
import type { CmudictPayload } from "../../dict/types";
import {
	EnglishPhonemeAllophones,
	EnglishPhonemeSpellingPatterns,
	getLanguagePhonemeIds,
	getLanguagePhonemeInventory,
	parsePhonemePronunciation,
	preferOForms,
	toBasePhonemeIds,
	splitSpelledWord,
} from "../../index";
import type { PhonemeAllophoneContextKey } from "../../languages/types";
import { EnglishCmudictStatsData } from "./cmudict-stats";
import { EnglishCommonWords } from "./common-words";
import { EnglishCuratedTop1k } from "./curated-1k";
import { EnglishCuratedTop10k } from "./curated-10k";
import { EnglishPhonemeFrequencyData } from "./phoneme-frequency";
import { EnglishSpellingShares, OTHER_SPELLINGS_BELOW_PERCENTAGE } from "./spelling-shares";
import { EnglishWordAudio } from "./word-audio";
import { EnglishWordPageList } from "./word-page-list";
import { EnglishWordPages, getWordPage } from "./word-pages";

const dictionary: CmudictPayload = dictionaryJson;
const entries = Object.entries(dictionary.data);
const wordCount = entries.length;
const variantCount = entries.reduce((count, [, variants]) => count + variants.length, 0);
const multiplePronunciationCount = entries.filter(([, variants]) => variants.length > 1).length;

describe("dictionary integrity", () => {
	it("keeps metadata counts equal to the actual dictionary contents", () => {
		expect(wordCount).toBeGreaterThan(0);
		expect(dictionary.meta.wordCount).toBe(wordCount);
		expect(dictionary.meta.variantCount).toBe(variantCount);
	});

	it("contains nonempty, unique pronunciations with English IDs and representable stress", () => {
		const inventory = getLanguagePhonemeInventory("en-us");
		const consonants = new Set<string>(inventory.consonants);
		const vowels = new Set<string>(inventory.vowels);
		const errors: string[] = [];
		// Check independently of the permissive runtime token helpers. This also
		// rejects inherited object keys, raw ARPABET and consonants carrying stress.
		for (const [word, variants] of entries) {
			if (!word || word !== word.toUpperCase() || variants.length === 0) {
				errors.push(`${word}: missing word or pronunciations, or noncanonical word key`);
			}
			if (new Set(variants).size !== variants.length) errors.push(`${word}: duplicate variant`);
			for (const variant of variants) {
				if (!variant || variant !== variant.trim().split(/\s+/).join(" ")) {
					errors.push(`${word}: noncanonical pronunciation ${JSON.stringify(variant)}`);
				}
				for (const token of parsePhonemePronunciation(variant)) {
					const match = /^([A-Z]+)([012])?$/.exec(token);
					const id = match?.[1] ?? "";
					const stress = match?.[2];
					const validConsonant = consonants.has(id) && stress === undefined;
					const validVowel =
						vowels.has(id) &&
						stress !== undefined &&
						(id !== "AX" || stress === "0") &&
						(id !== "AH" || stress !== "0");
					if (!validConsonant && !validVowel) errors.push(`${word}: invalid token ${token}`);
				}
			}
		}
		expect(errors.slice(0, 10), `${errors.length} dictionary integrity errors`).toEqual([]);
	});
});

describe.each([
	["1k", EnglishCuratedTop1k],
	["10k", EnglishCuratedTop10k],
] as const)("curated %s integrity", (tier, data) => {
	it("reports its tier and actual word count", () => {
		expect(data.meta.tier).toBe(tier);
		expect(Object.keys(data.words).length).toBeGreaterThan(0);
		expect(data.meta.wordCount).toBe(Object.keys(data.words).length);
	});

	it("uses normalized lookup keys and retains all source-dictionary variants", () => {
		for (const [word, variants] of Object.entries(data.words)) {
			expect(word, word).toBe(word.toLowerCase());
			expect(variants, word).toEqual(dictionary.data[word.toUpperCase()]);
			expect(variants.length, word).toBeGreaterThan(0);
		}
	});
});

it("does not change a tier-1 pronunciation when tier-2 finishes loading", () => {
	for (const [word, variants] of Object.entries(EnglishCuratedTop1k.words)) {
		expect(EnglishCuratedTop10k.words[word], word).toEqual(variants);
	}
});

describe("dictionary statistics", () => {
	const stats = EnglishCmudictStatsData;

	it("describes the same source and independently counted words and variants", () => {
		expect(stats.meta.sourceUrl).toBe(dictionary.meta.sourceUrl);
		expect(stats.meta.source).toBe(dictionary.meta.source);
		expect(stats.meta.wordCount).toBe(wordCount);
		expect(stats.meta.variantCount).toBe(variantCount);
		expect(stats.meta.multiplePronunciationCount).toBe(multiplePronunciationCount);
		expect(stats.overview.words).toBe(wordCount);
		expect(stats.overview.variants).toBe(variantCount);
		expect(stats.overview.multiplePronunciationShare).toBeCloseTo(
			(multiplePronunciationCount / wordCount) * 100,
			8,
		);
	});

	it("counts phoneme tokens across variants but counts each covered word only once", () => {
		const tokenCounts = new Map<string, number>();
		const wordCounts = new Map<string, number>();
		for (const [, variants] of entries) {
			const wordSounds = new Set<string>();
			for (const variant of variants) {
				for (const token of variant.split(" ")) {
					const id = token.replace(/[012]$/, "");
					tokenCounts.set(id, (tokenCounts.get(id) ?? 0) + 1);
					wordSounds.add(id);
				}
			}
			for (const id of wordSounds) wordCounts.set(id, (wordCounts.get(id) ?? 0) + 1);
		}
		const ids = stats.phonemes.map(({ phonemeId }) => phonemeId);
		expect(new Set(ids).size).toBe(ids.length);
		expect([...ids].sort()).toEqual([...tokenCounts.keys()].sort());
		for (const row of stats.phonemes) {
			const coverage = wordCounts.get(row.phonemeId) ?? 0;
			expect(row.tokenCount, row.phonemeId).toBe(tokenCounts.get(row.phonemeId));
			expect(row.wordCoverage.count, row.phonemeId).toBe(coverage);
			expect(row.wordCoverage.percentage, row.phonemeId).toBeCloseTo(
				(coverage / wordCount) * 100,
				8,
			);
			expect(row.averageTokensPerWord, row.phonemeId).toBeCloseTo(row.tokenCount / coverage, 8);
		}
	});

	it("accounts for every word exactly once in the syllable distribution", () => {
		const distribution = new Map<number, number>();
		for (const [, variants] of entries) {
			// Stats use the first pronunciation with a vowel; consonant-only
			// interjections are represented as one syllable.
			const syllables =
				variants
					.map((variant) => variant.match(/[012]/g)?.length ?? 0)
					.find((count) => count > 0) ?? 1;
			distribution.set(syllables, (distribution.get(syllables) ?? 0) + 1);
		}
		const counts = stats.syllables.map(({ count }) => count);
		expect(new Set(counts).size).toBe(counts.length);
		expect([...counts].sort((a, b) => a - b)).toEqual(
			[...distribution.keys()].sort((a, b) => a - b),
		);
		expect(stats.syllables.reduce((total, row) => total + row.words, 0)).toBe(wordCount);
		for (const row of stats.syllables) {
			expect(row.words, `${row.count} syllables`).toBe(distribution.get(row.count));
			expect(row.count).toBeGreaterThan(0);
			expect(Number.isInteger(row.count)).toBe(true);
			expect(row.words).toBeGreaterThan(0);
			expect(row.percentage).toBeCloseTo((row.words / wordCount) * 100, 8);
		}
	});
});

describe("phoneme frequency", () => {
	const rows = EnglishPhonemeFrequencyData.phonemes;

	it("covers every English sound exactly once", () => {
		const ids = rows.map(({ phonemeId }) => phonemeId);
		expect(new Set(ids).size).toBe(ids.length);
		expect([...ids].sort()).toEqual([...getLanguagePhonemeIds("en-us")].sort());
	});

	it("splits speech into shares that add up to 100%", () => {
		const total = rows.reduce((sum, row) => sum + row.percentage, 0);
		// Each share is rounded to four decimals.
		expect(Math.abs(total - 100)).toBeLessThan(rows.length * 0.00005);
		for (const row of rows) expect(row.percentage, row.phonemeId).toBeGreaterThan(0);
	});

	it("ranks every sound by its share, most common first", () => {
		expect(rows.map((row) => row.rank)).toEqual(rows.map((_, index) => index + 1));
		for (let index = 1; index < rows.length; index++) {
			expect(rows[index - 1].percentage).toBeGreaterThanOrEqual(rows[index].percentage);
		}
	});
});

describe("teaching examples", () => {
	it("marks the letters that spell the sound in each spelling example", () => {
		for (const [id, entry] of Object.entries(EnglishPhonemeSpellingPatterns)) {
			for (const example of entry.examples) {
				const segments = splitSpelledWord(example.spelled);
				expect(segments.map(({ text }) => text).join(""), `${id}: ${example.spelled}`).toBe(
					example.word,
				);
				expect(
					segments.some(({ highlighted }) => highlighted),
					`${id}: ${example.spelled}`,
				).toBe(true);
			}
		}
	});

	it.each([
		[
			"spelling patterns",
			Object.entries(EnglishPhonemeSpellingPatterns).map(
				([id, entry]) => [id, entry.examples] as const,
			),
		],
		[
			"allophones",
			Object.entries(EnglishPhonemeAllophones).map(
				([id, allophones]) =>
					[id, (allophones ?? []).flatMap((allophone) => allophone.examples)] as const,
			),
		],
	] as const)("uses real words containing the advertised sound in %s", (_name, groups) => {
		for (const [id, examples] of groups) {
			expect(examples.length, id).toBeGreaterThan(0);
			for (const example of examples) {
				const variants = dictionary.data[example.word.toUpperCase()] ?? [];
				expect(variants.length, example.word).toBeGreaterThan(0);
				if ("phonemic" in example) {
					expect(example.phonemic.trim().length, example.word).toBeGreaterThan(0);
				}
				expect(
					variants.some((variant) =>
						variant.split(" ").some((token) => token.replace(/[012]$/, "") === id),
					),
					`${id}: ${example.word} does not contain the sound it illustrates`,
				).toBe(true);
			}
		}
	});
});

describe("allophone examples", () => {
	const vowelIds = new Set<string>(getLanguagePhonemeInventory("en-us").vowels);
	const recorded = new Set(EnglishWordAudio.words);
	const voiceOnConsonants = new Set(["B", "D", "G", "V", "DH", "Z", "ZH", "J"]);
	const voiceOffConsonants = new Set(["P", "T", "K", "F", "TH", "S", "SH", "CH"]);

	type Sound = { id: string; stress: number | undefined };
	const soundsOf = (word: string): Sound[] => {
		const [first] = dictionary.data[word.toUpperCase()] ?? [];
		if (!first) throw new Error(`${word} is not in the dictionary`);
		return parsePhonemePronunciation(first).map((token) => {
			const stress = /[012]$/.exec(token)?.[0];
			return {
				id: stress ? token.slice(0, -1) : token,
				stress: stress ? Number(stress) : undefined,
			};
		});
	};
	const isVowel = (sound?: Sound) => sound !== undefined && vowelIds.has(sound.id);
	const isWeakVowel = (sound?: Sound) => isVowel(sound) && sound?.stress === 0;
	const endsInWeakN = (sounds: Sound[], at: number) =>
		sounds[at]?.id === "AX" &&
		sounds[at]?.stress === 0 &&
		sounds[at + 1]?.id === "N" &&
		at + 2 === sounds.length;
	const afterVowelOrR = (sounds: Sound[], at: number) =>
		isVowel(sounds[at - 1]) || (sounds[at - 1]?.id === "R" && isVowel(sounds[at - 2]));

	const fitsContext: Record<
		PhonemeAllophoneContextKey,
		(sounds: Sound[], at: number, word: string) => boolean
	> = {
		aspirated: (sounds, at) =>
			isVowel(sounds[at + 1]) &&
			(at === 0 || (sounds[at + 1]?.stress ?? 0) > 0) &&
			sounds[at - 1]?.id !== "S",
		"unaspirated-after-s": (sounds, at, word) =>
			at === 1 && sounds[0]?.id === "S" && word.startsWith("s") && isVowel(sounds[2]),
		flap: (sounds, at) =>
			afterVowelOrR(sounds, at) && isWeakVowel(sounds[at + 1]) && !endsInWeakN(sounds, at + 1),
		"glottal-stop": (sounds, at) =>
			afterVowelOrR(sounds, at) &&
			(endsInWeakN(sounds, at + 1) ||
				(sounds[at + 1] !== undefined &&
					!isVowel(sounds[at + 1]) &&
					!["R", "W", "Y"].includes(sounds[at + 1]?.id ?? ""))),
		"syllabic-n": (sounds, at) =>
			at === sounds.length - 1 &&
			endsInWeakN(sounds, at - 1) &&
			["T", "D", "S", "Z"].includes(sounds[at - 2]?.id ?? ""),
		"dark-l": (sounds, at) =>
			isVowel(sounds[at - 1]) && sounds[at - 1]?.id !== "AX" && !isVowel(sounds[at + 1]),
		"syllabic-l": (sounds, at, word) =>
			at === sounds.length - 1 &&
			isWeakVowel(sounds[at - 1]) &&
			sounds[at - 1]?.id === "AX" &&
			!isVowel(sounds[at - 2]) &&
			word.endsWith("le"),
		"longer-before-voice-on": (sounds, at) =>
			sounds.filter(isVowel).length === 1 && at === sounds.length - 2,
		"raised-before-m-n": (sounds, at, word) =>
			(sounds[at]?.stress ?? 0) > 0 &&
			["M", "N"].includes(sounds[at + 1]?.id ?? "") &&
			/a[mn]/.test(word),
		"weak-r-vowel": (sounds, at) => sounds[at]?.stress === 0,
	};

	const examples = Object.entries(EnglishPhonemeAllophones).flatMap(([id, allophones]) =>
		(allophones ?? []).flatMap(({ contextKey, examples }) =>
			examples.map(({ word }, index) => ({ id, contextKey, word, index, count: examples.length })),
		),
	);

	it.each(examples)("$id $contextKey: $word fits its context", ({ id, contextKey, word }) => {
		const sounds = soundsOf(word);
		const at = sounds.map((sound) => sound.id).lastIndexOf(id);
		expect(at, `${word} has no ${id}`).toBeGreaterThanOrEqual(0);
		expect(fitsContext[contextKey](sounds, at, word)).toBe(true);
	});

	it.each(examples)("$id $contextKey: $word has a recording", ({ word }) => {
		expect(recorded.has(word)).toBe(true);
	});

	it("pairs each longer vowel with the same vowel before a consonant with the voice off", () => {
		const pairs = examples.filter(({ contextKey }) => contextKey === "longer-before-voice-on");
		expect(pairs.length).toBeGreaterThan(0);
		for (const { id, word, index, count } of pairs) {
			expect(count, id).toBe(2);
			const last = soundsOf(word).at(-1)?.id ?? "";
			const expected = index === 0 ? voiceOnConsonants : voiceOffConsonants;
			expect(expected.has(last), `${id}: ${word} ends in ${last}`).toBe(true);
		}
	});
});

describe("common words", () => {
	it("covers every English sound", () => {
		expect(Object.keys(EnglishCommonWords).sort()).toEqual(
			[...getLanguagePhonemeIds("en-us")].sort(),
		);
	});

	it("lists top-1k words, most frequent first, where the first pronunciation has the sound", () => {
		const rank = new Map(Object.keys(EnglishCuratedTop1k.words).map((word, i) => [word, i]));
		const errors: string[] = [];
		for (const [phonemeId, lists] of Object.entries(EnglishCommonWords)) {
			for (const position of ["start", "inside", "end"] as const) {
				const words = lists[position];
				if (words.length > 6) errors.push(`${phonemeId} ${position}: more than 6 words`);
				const ranks = words.map((word) => rank.get(word) ?? -1);
				if (ranks.some((r, i) => r < 0 || (i > 0 && r < ranks[i - 1]))) {
					errors.push(`${phonemeId} ${position}: not in the top-1k list, or out of order`);
				}
				for (const word of words) {
					const sounds = toBasePhonemeIds(EnglishCuratedTop1k.words[word]?.[0] ?? "X");
					const found =
						position === "start"
							? sounds[0] === phonemeId
							: position === "end"
								? sounds.at(-1) === phonemeId
								: sounds.slice(1, -1).includes(phonemeId as (typeof sounds)[number]);
					if (!found) errors.push(`${phonemeId} ${position}: ${word}`);
				}
			}
		}
		expect(errors).toEqual([]);
	});

	it("lists only words whose play button plays the pronunciation the lists read", () => {
		const listed = new Set(
			Object.values(EnglishCommonWords).flatMap(({ start, inside, end }) => [
				...start,
				...inside,
				...end,
			]),
		);
		const mismatches = Object.entries(EnglishWordAudio.forms ?? {}).flatMap(([word, forms]) => {
			const main = forms.find(({ n }) => n === undefined);
			const first = EnglishCuratedTop1k.words[word]?.[0];
			if (!listed.has(word) || !main || !first) return [];
			const same =
				toBasePhonemeIds(main.pronunciation).join(" ") === toBasePhonemeIds(first).join(" ");
			return same ? [] : [word];
		});
		expect(mismatches).toEqual([]);
	});
});

describe("spelling shares", () => {
	const top10k = EnglishCuratedTop10k.words as Record<string, readonly string[]>;
	const recorded = new Set(EnglishWordAudio.words);

	it("covers every English sound, each spelling once", () => {
		expect(Object.keys(EnglishSpellingShares).sort()).toEqual(
			[...getLanguagePhonemeIds("en-us")].sort(),
		);
		for (const [phonemeId, { spellings, other }] of Object.entries(EnglishSpellingShares)) {
			const names = [...spellings, ...other].map(({ spelling }) => spelling);
			expect(new Set(names).size, phonemeId).toBe(names.length);
		}
	});

	it("ranks spellings from most to least common, the rare ones under other, adding up to 100%", () => {
		for (const [phonemeId, { spellings, other }] of Object.entries(EnglishSpellingShares)) {
			const all = [...spellings, ...other].map(({ percentage }) => percentage);
			expect(all, phonemeId).toEqual([...all].sort((a, b) => b - a));
			expect(spellings.every((row) => row.percentage >= OTHER_SPELLINGS_BELOW_PERCENTAGE)).toBe(
				true,
			);
			expect(other.every((row) => row.percentage < OTHER_SPELLINGS_BELOW_PERCENTAGE)).toBe(true);
			expect(all.reduce((sum, value) => sum + value, 0)).toBeCloseTo(100, 1);
		}
	});

	it("names the most frequent example word, which leads its place's list", () => {
		for (const { topWord, words } of Object.values(EnglishSpellingShares).flatMap((entry) => [
			...entry.spellings,
			...entry.other,
		])) {
			const firsts = [words.start[0], words.inside[0], words.end[0]].filter(Boolean);
			if (topWord === null) expect(firsts).toEqual([]);
			else expect(firsts).toContain(topWord);
		}
	});

	it("gives recorded top-10k example words whose marked letters are the spelling", () => {
		const errors: string[] = [];
		for (const [phonemeId, entry] of Object.entries(EnglishSpellingShares)) {
			for (const { spelling, words } of [...entry.spellings, ...entry.other]) {
				for (const position of ["start", "inside", "end"] as const) {
					for (const spelled of words[position]) {
						const segments = splitSpelledWord(spelled);
						const word = segments.map(({ text }) => text).join("");
						const marked = segments
							.filter(({ highlighted }) => highlighted)
							.map(({ text }) => text);
						const expected = spelling.includes("-") ? spelling.split("-") : [spelling];
						const variants = top10k[word];
						const first = variants ? preferOForms(word, variants)[0] : undefined;
						if (!first) errors.push(`${phonemeId} ${spelled}: not in the top-10k list`);
						else if (!toBasePhonemeIds(first).includes(phonemeId as never))
							errors.push(`${phonemeId} ${spelled}: the sound isn't in ${first}`);
						if (!recorded.has(word)) errors.push(`${phonemeId} ${spelled}: no recording`);
						if (marked.join("|") !== expected.join("|"))
							errors.push(`${phonemeId} ${spelled}: marks ${marked.join("|")}, not ${spelling}`);
					}
				}
			}
		}
		expect(errors).toEqual([]);
	});
});

describe("word pages", () => {
	const top10k = EnglishCuratedTop10k.words as Record<string, readonly string[]>;

	it("lists 100 to 150 distinct lowercase words", () => {
		const words = EnglishWordPages.map(({ word }) => word);
		expect(words.length).toBeGreaterThanOrEqual(100);
		expect(words.length).toBeLessThanOrEqual(150);
		expect(new Set(words).size).toBe(words.length);
		for (const word of words) expect(word).toMatch(/^[a-z]{3,}$/);
		expect(getWordPage("enough")?.word).toBe("enough");
		expect(getWordPage("will")).toBeUndefined();
		expect(EnglishWordPageList).toEqual(words);
	});

	it("gives each word its first top-10k pronunciation (an /ɔ/ form first), split over its letters", () => {
		const errors: string[] = [];
		for (const { word, pronunciation, segments } of EnglishWordPages) {
			const variants = top10k[word];
			if (!variants || preferOForms(word, variants)[0] !== pronunciation)
				errors.push(`${word}: not its first pronunciation as the app orders them`);
			if (segments.map(({ letters }) => letters).join("") !== word)
				errors.push(`${word}: letters don't spell the word`);
			if (segments.flatMap(({ sounds }) => sounds).join(" ") !== pronunciation)
				errors.push(`${word}: sounds don't make the pronunciation`);
		}
		expect(errors).toEqual([]);
	});

	it("has a recording of that pronunciation for every word", () => {
		const recorded = new Set(EnglishWordAudio.words);
		for (const { word, pronunciation } of EnglishWordPages) {
			expect(recorded.has(word), word).toBe(true);
			const main = EnglishWordAudio.forms?.[word]?.find(({ n }) => n === undefined);
			if (main) {
				expect(toBasePhonemeIds(main.pronunciation), word).toEqual(toBasePhonemeIds(pronunciation));
			}
		}
	});

	it("gives other recorded words with each rare spelling, its letters marked", () => {
		const recorded = new Set(EnglishWordAudio.words);
		for (const { word, rareSpellings } of EnglishWordPages) {
			for (const { spelling, phonemeId, others } of rareSpellings) {
				expect(others.length, word).toBeLessThanOrEqual(3);
				for (const spelled of others) {
					const segments = splitSpelledWord(spelled);
					const other = segments.map(({ text }) => text).join("");
					const marked = segments.filter(({ highlighted }) => highlighted).map(({ text }) => text);
					const variants = top10k[other];
					expect(other, `${word}: ${spelled}`).not.toBe(word);
					expect(recorded.has(other), `${word}: ${spelled}`).toBe(true);
					expect(marked.join("-"), `${word}: ${spelled}`).toBe(spelling);
					expect(
						variants && toBasePhonemeIds(preferOForms(other, variants)[0]),
						`${word}: ${spelled}`,
					).toContain(phonemeId);
				}
			}
		}
		const women = EnglishWordPages.find(({ word }) => word === "women");
		expect(women?.rareSpellings[0].others).toEqual([]);
	});

	it("names at least one rare spelling per word, each a spelling of one of its sounds", () => {
		for (const { word, segments, rareSpellings } of EnglishWordPages) {
			expect(rareSpellings.length, word).toBeGreaterThan(0);
			for (const { spelling, phonemeId, percentage } of rareSpellings) {
				expect(percentage, word).toBeLessThan(OTHER_SPELLINGS_BELOW_PERCENTAGE);
				const segment = segments.find(
					(s) =>
						(s.spelling ?? s.letters) === spelling &&
						s.sounds.length === 1 &&
						toBasePhonemeIds(s.sounds[0])[0] === phonemeId,
				);
				expect(segment, `${word}: ${spelling} for ${phonemeId}`).toBeDefined();
			}
		}
	});
});
