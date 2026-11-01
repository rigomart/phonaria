/**
 * Picks, for each en-us sound, the most frequent curated top-1k words where
 * the sound starts the word, sits inside it, or ends it, for the sound pages'
 * "Common words" section (#418).
 *
 * Usage:
 *   bun run --cwd packages/helper-scripts generate-common-words
 *
 * Writes packages/phonetics-data/data/en/common-words.json with no timestamp,
 * so the same top-1k list reproduces it exactly.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import {
	type EnglishPhonemeSymbolId,
	getLanguagePhonemeIds,
	getWordAudioForms,
	toBasePhonemeIds,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop1k } from "@phonaria/phonetics-data/data/en/curated-1k";
import { EnglishWordAudio } from "@phonaria/phonetics-data/data/en/word-audio";
import { EditorialFlags } from "./utils/editorial-flags";
import { ensureDirectoryForFile } from "./utils/fs";

const LIMIT = 6;
const outputPath = path.resolve(__dirname, "../../phonetics-data/data/en/common-words.json");

type Position = "start" | "inside" | "end";

/** The top-1k list is lowercase, so it can't show words always written with a capital. */
const CAPITALIZED = [
	"america",
	"american",
	"april",
	"august",
	"australia",
	"british",
	"china",
	"december",
	"england",
	"english",
	"europe",
	"european",
	"february",
	"french",
	"god",
	"india",
	"january",
	"july",
	"june",
	"london",
	"november",
	"october",
	"september",
	"washington",
	"york",
];

const ABBREVIATIONS_AND_INFORMAL = [
	"al",
	"co",
	"de",
	"dr",
	"etc",
	"gonna",
	"la",
	"lol",
	"mr",
	"non",
	"ok",
	"re",
	"st",
	"tv",
	"uk",
	"wanna",
];

const UNLISTED = new Set([
	...Object.values(EditorialFlags).flatMap((words) => [...words]),
	...CAPITALIZED,
	...ABBREVIATIONS_AND_INFORMAL,
]);

/** Only for words recorded more than once: "use" plays the verb, Y U1 Z. */
function playedPronunciation(word: string): string | undefined {
	return getWordAudioForms(EnglishWordAudio, "en-us", word)[0]?.pronunciation;
}

/** Single letters are read as letter names. */
function isPlainWord(word: string): boolean {
	return /^[a-z]{2,}$/.test(word);
}

function hasStartAndEnd(sounds: readonly string[]): boolean {
	return sounds.length >= 2;
}

function playsListedPronunciation(word: string, sounds: readonly string[]): boolean {
	const played = playedPronunciation(word);
	return played === undefined || toBasePhonemeIds(played).join(" ") === sounds.join(" ");
}

function isListedWord(word: string, sounds: readonly string[]): boolean {
	return (
		isPlainWord(word) &&
		hasStartAndEnd(sounds) &&
		!UNLISTED.has(word) &&
		playsListedPronunciation(word, sounds)
	);
}

function positionsOf(sounds: readonly string[], phonemeId: string): Position[] {
	const positions = new Set<Position>();
	sounds.forEach((sound, index) => {
		if (sound !== phonemeId) return;
		positions.add(index === 0 ? "start" : index === sounds.length - 1 ? "end" : "inside");
	});
	return [...positions];
}

/** The top-1k list is in frequency order, so the first matches are the most frequent. */
function pickCommonWords(
	words: Record<string, readonly string[]>,
	phonemeIds: readonly EnglishPhonemeSymbolId[],
	limit = LIMIT,
) {
	const entries = Object.entries(words).flatMap(([word, variants]) => {
		const first = variants[0];
		if (!first) return [];
		const sounds = toBasePhonemeIds(first);
		return isListedWord(word, sounds) ? [{ word, sounds }] : [];
	});
	return Object.fromEntries(
		phonemeIds.map((phonemeId) => {
			const lists: Record<Position, string[]> = { start: [], inside: [], end: [] };
			for (const { word, sounds } of entries) {
				for (const position of positionsOf(sounds, phonemeId)) {
					if (lists[position].length < limit) lists[position].push(word);
				}
			}
			return [phonemeId, lists];
		}),
	) as Record<EnglishPhonemeSymbolId, Record<Position, string[]>>;
}

function main() {
	const { meta, words } = EnglishCuratedTop1k;
	const payload = {
		meta: {
			source: `Curated top-1k list ${meta.version}, first pronunciation of each word`,
			limit: LIMIT,
			license: meta.license,
			attribution: meta.attribution,
		},
		phonemes: pickCommonWords(words, getLanguagePhonemeIds("en-us")),
	};
	ensureDirectoryForFile(outputPath);
	fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, "\t")}\n`);
	console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
}

main();
