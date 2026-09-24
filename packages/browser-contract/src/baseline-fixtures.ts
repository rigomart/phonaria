import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CLIENT_HIT_WORD, MISSING_WORD, SERVER_HIT_WORD } from "./constants";

const PHONETICS_EN = join(dirname(fileURLToPath(import.meta.url)), "../../phonetics-data/data/en");

interface CuratedFile {
	words: Record<string, string[]>;
}

interface CmudictFile {
	data: Record<string, string[]>;
}

let top1kWords: Record<string, string[]> | undefined;
let top10kWords: Record<string, string[]> | undefined;
let cmudictData: Record<string, string[]> | undefined;

function readJson<T>(relativePath: string): T {
	return JSON.parse(readFileSync(join(PHONETICS_EN, relativePath), "utf8")) as T;
}

export function curatedTop1kWords(): Record<string, string[]> {
	top1kWords ??= readJson<CuratedFile>("curated/top-1k.json").words;
	return top1kWords;
}

export function curatedTop10kWords(): Record<string, string[]> {
	top10kWords ??= readJson<CuratedFile>("curated/top-10k.json").words;
	return top10kWords;
}

export function cmudictPronunciations(word: string): string[] | undefined {
	cmudictData ??= readJson<CmudictFile>("dict/cmudict.json").data;
	return cmudictData[word.toUpperCase()];
}

export function isClientHitWord(word: string): boolean {
	return word in curatedTop1kWords() || word in curatedTop10kWords();
}

export function isServerHitWord(word: string): boolean {
	if (isClientHitWord(word)) return false;
	const pronunciations = cmudictPronunciations(word);
	return Array.isArray(pronunciations) && pronunciations.length > 0;
}

export function clientHitFixtureIntent(word: string = CLIENT_HIT_WORD): string {
	return `Five warm submissions of "${word}" after one uncounted warmup transcription of the same word (loads the lazy curated-10k chunk into the HTTP cache so cold chunk download is not mixed into every sample). ${word} is a client-tier hit: present in curated-10k, absent from curated-1k, so lookup finishes without the Turso/CMUdict server action. Reloaded landing page; wall-clock from submit click until the word label is visible.`;
}

export function serverHitFixtureIntent(word: string = SERVER_HIT_WORD): string {
	return `Five warm submissions of "${word}" after one uncounted warmup transcription of the same word (primes the Turso/CMUdict lookup so a cold database hit is not mixed into the counted samples). ${word} is absent from curated-1k and curated-10k and present in packages/phonetics-data/data/en/dict/cmudict.json (key ${word.toUpperCase()}), the same dictionary loaded into Turso. This is a successful server lookup (IPA details visible), not the functional not-found fixture "${MISSING_WORD}". Reloaded landing page; wall-clock from submit click until the word label is visible.`;
}
