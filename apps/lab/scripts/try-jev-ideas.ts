#!/usr/bin/env bun
/**
 * Experiment: three more places Jev might fit beyond Transcription's current decisions.
 *
 * 1. weak-forms: pick the weak or strong form of a function word from the sentence
 *    ("I can swim" /kən/ vs "Yes, I can" /kæn/). Groups come from CMUDict stress alone.
 * 2. sound-finder: map a learner's plain-words description ("sh like in shoe") to a
 *    phoneme. Options are built only from `EnglishPhonemeSpellingPatterns`.
 * 3. word-pool: screen the Practice word pool once, offline, for words that read badly
 *    in play. No labels exist, so it prints what Jev flags for review.
 *
 * Usage:
 *   bun --cwd apps/lab ./scripts/try-jev-ideas.ts [--only weak-forms|sound-finder|word-pool]
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	EnglishPhonemeSpellingPatterns,
	getIpaForPhonemeId,
	getLanguagePhonemeIds,
	getPhonemeCategory,
} from "@phonaria/phonetics-data";
import { SchwaTopic } from "../src/lib/practice/topics/schwa";
import { EditorialBlocklist, loadWordPoolForTopic } from "../src/lib/practice/word-pool";
import {
	askChoice,
	askJev,
	type Endpoint,
	OFFER_CONFIDENCE,
	resolveEndpoint,
	usage,
} from "./try-jev";

const CMUDICT_PATH = resolve(
	import.meta.dirname,
	"../../../packages/phonetics-data/data/en/dict/cmudict.json",
);

function toIpa(pronunciation: string): string {
	return pronunciation
		.split(" ")
		.map((token) => {
			const match = token.match(/^([A-Z]+)([012])?$/);
			if (!match) return "?";
			const stress = match[2] === "1" ? "ˈ" : match[2] === "2" ? "ˌ" : "";
			return stress + getIpaForPhonemeId(match[1] as never);
		})
		.join("");
}

/** Runs `task` over `items` with at most `limit` requests in flight. */
async function mapLimited<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>) {
	const results: R[] = new Array(items.length);
	let next = 0;
	await Promise.all(
		Array.from({ length: Math.min(limit, items.length) }, async () => {
			while (next < items.length) {
				const index = next++;
				results[index] = await task(items[index] as T);
			}
		}),
	);
	return results;
}

// ---------------------------------------------------------------------------
// 1. Weak and strong forms of function words

type FormCase = { word: string; sentence: string; want: "weak" | "strong" };

const FORM_CASES: FormCase[] = [
	{ word: "can", sentence: "I can swim.", want: "weak" },
	{ word: "can", sentence: "Yes, I can.", want: "strong" },
	{ word: "to", sentence: "I want to go home.", want: "weak" },
	{ word: "to", sentence: "Who did you give it to?", want: "strong" },
	{ word: "for", sentence: "This gift is for you.", want: "weak" },
	{ word: "for", sentence: "What is this button for?", want: "strong" },
	{ word: "that", sentence: "I think that he is right.", want: "weak" },
	{ word: "that", sentence: "I like that one better.", want: "strong" },
	{ word: "was", sentence: "She was very happy.", want: "weak" },
	{ word: "was", sentence: "Yes, she was.", want: "strong" },
	{ word: "them", sentence: "I saw them yesterday.", want: "weak" },
	{ word: "them", sentence: "Not us, them!", want: "strong" },
	{ word: "does", sentence: "What does it mean?", want: "weak" },
	{ word: "does", sentence: "Yes, he does.", want: "strong" },
	{ word: "her", sentence: "I gave her the book.", want: "weak" },
	{ word: "her", sentence: "I meant her, not him.", want: "strong" },
	{ word: "are", sentence: "We are ready to leave.", want: "weak" },
	{ word: "are", sentence: "I know where they are.", want: "strong" },
	{ word: "and", sentence: "I like bread and butter.", want: "weak" },
	{ word: "and", sentence: "And? What happened next?", want: "strong" },
	{ word: "a", sentence: "Is that a dog?", want: "weak" },
	{ word: "a", sentence: "Write the letter a on the board.", want: "strong" },
];

async function runWeakForms(endpoint: Endpoint) {
	const cmudict = JSON.parse(readFileSync(CMUDICT_PATH, "utf8")) as {
		data: Record<string, string[]>;
	};

	const rows = await mapLimited(FORM_CASES, 12, async (entry) => {
		const variants = cmudict.data[entry.word.toUpperCase()] ?? [];
		const strong = variants.filter((variant) => /1/.test(variant)).map(toIpa);
		const weak = variants.filter((variant) => !/1/.test(variant)).map(toIpa);
		const slash = (list: string[]) => list.map((ipa) => `/${ipa}/`).join(" or ");
		const answer = await askChoice(endpoint, {
			state: { sentence: entry.sentence, word: entry.word },
			instructions:
				"In natural spoken American English, is this word said in its full form or its reduced form in this sentence?",
			criteria: {
				strong: `Full, stressed form ${slash(strong)}: the word is emphasized or contrasted, stands alone, or ends the phrase.`,
				weak: `Reduced, unstressed form ${slash(weak)}: the word is said quickly inside the phrase, as usual in connected speech.`,
			},
		});
		const fallback = /1/.test(variants[0] ?? "") ? "strong" : "weak";
		return { entry, answer, fallback };
	});

	console.log("\n## Weak and strong forms\n");
	console.log("| sentence | word | want | app default | jev (confidence) |");
	console.log("| --- | --- | --- | --- | --- |");
	let defaultRight = 0;
	let jevRight = 0;
	let confident = 0;
	let confidentRight = 0;
	for (const { entry, answer, fallback } of rows) {
		const mark = (value: string) => (value === entry.want ? "" : " **wrong**");
		if (fallback === entry.want) defaultRight += 1;
		if (answer.choice === entry.want) jevRight += 1;
		if (answer.confidence >= OFFER_CONFIDENCE) {
			confident += 1;
			if (answer.choice === entry.want) confidentRight += 1;
		}
		console.log(
			`| ${entry.sentence} | ${entry.word} | ${entry.want} | ${fallback}${mark(fallback)} | ${answer.choice} (${answer.confidence.toFixed(2)})${mark(answer.choice)} |`,
		);
	}
	const total = FORM_CASES.length;
	console.log(`\napp default: ${defaultRight}/${total} right`);
	console.log(
		`jev:         ${jevRight}/${total} right; ${confident} at confidence >= ${OFFER_CONFIDENCE}, ${confidentRight} of them right`,
	);
}

// ---------------------------------------------------------------------------
// 2. Find a sound from a plain-words description

type FinderCase = { query: string; want: string[] };

/** Example words here are deliberately absent from `EnglishPhonemeSpellingPatterns`. */
const FINDER_CASES: FinderCase[] = [
	{ query: "the uh sound at the start of 'about'", want: ["AX"] },
	{ query: "sh like in shoe", want: ["SH"] },
	{ query: "th in three", want: ["TH"] },
	{ query: "the th in 'they'", want: ["DH"] },
	{ query: "the tongue between the teeth sound", want: ["TH", "DH"] },
	{ query: "the long e sound", want: ["I"] },
	{ query: "short i, like in fish", want: ["IX"] },
	{ query: "the a in apple", want: ["AE"] },
	{ query: "the sound at the end of ring", want: ["NG"] },
	{ query: "the s in usually", want: ["ZH"] },
	{ query: "ch as in chair", want: ["CH"] },
	{ query: "the oo in moon", want: ["U"] },
	{ query: "the oo in good", want: ["UX"] },
	{ query: "the oy sound in toy", want: ["OI"] },
	{ query: "the vowel in girl", want: ["ER"] },
	{ query: "the vowel in bus", want: ["AH"] },
	{ query: "ow as in cow", want: ["AU"] },
	{ query: "the vowel in thought", want: ["O"] },
	{ query: "the g in gem", want: ["J"] },
	{ query: "the c in ice", want: ["S"] },
	{ query: "the gh at the end of laugh", want: ["F"] },
	{ query: "the ed at the end of stopped", want: ["T"] },
	{ query: "the long a, like cake", want: ["EI"] },
	{ query: "the long o", want: ["OU"] },
	{ query: "the long i", want: ["AI"] },
	{ query: "the lazy vowel in unstressed syllables", want: ["AX"] },
	{ query: "the vowel in hot, American English", want: ["A"] },
	{ query: "la 'sh' como en 'show'", want: ["SH"] },
	{ query: "la vocal de 'but' en inglés", want: ["AH"] },
	{ query: "la v de 'very', con los dientes en el labio", want: ["V"] },
];

function soundCriteria(): Record<string, string> {
	const patterns = EnglishPhonemeSpellingPatterns as Record<
		string,
		{ patterns: readonly string[]; examples: readonly { word: string }[] }
	>;
	const criteria: Record<string, string> = {};
	for (const id of getLanguagePhonemeIds("en-us")) {
		const entry = patterns[id];
		const spelled = entry ? ` Often spelled ${entry.patterns.join(", ")}.` : "";
		const heard = entry ? ` Heard in ${entry.examples.map((e) => e.word).join(", ")}.` : "";
		criteria[id] = `The ${getPhonemeCategory(id)} /${getIpaForPhonemeId(id)}/.${spelled}${heard}`;
	}
	return criteria;
}

async function runSoundFinder(endpoint: Endpoint) {
	const criteria = soundCriteria();
	const rows = await mapLimited(FINDER_CASES, 12, async (entry) => {
		const answer = await askChoice(endpoint, {
			state: { learner_query: entry.query },
			instructions:
				"An English learner is looking for one English sound (General American) and described it in their own words, maybe in Spanish. Which sound do they mean?",
			criteria,
		});
		return { entry, answer };
	});

	console.log("\n## Sound finder\n");
	console.log("| query | want | jev (confidence) | runner-up |");
	console.log("| --- | --- | --- | --- |");
	let right = 0;
	let confident = 0;
	let confidentRight = 0;
	let inTopTwo = 0;
	const ipa = (id: string) => `/${getIpaForPhonemeId(id as never)}/`;
	for (const { entry, answer } of rows) {
		const ranked = Object.entries(answer.probabilities).sort((a, b) => b[1] - a[1]);
		const runnerUp = ranked[1];
		const isRight = entry.want.includes(answer.choice);
		if (isRight) right += 1;
		if (isRight || (runnerUp && entry.want.includes(runnerUp[0]))) inTopTwo += 1;
		if (answer.confidence >= OFFER_CONFIDENCE) {
			confident += 1;
			if (isRight) confidentRight += 1;
		}
		console.log(
			`| ${entry.query} | ${entry.want.map(ipa).join(" or ")} | ${ipa(answer.choice)} (${answer.confidence.toFixed(2)})${isRight ? "" : " **wrong**"} | ${runnerUp ? `${ipa(runnerUp[0])} ${runnerUp[1].toFixed(2)}` : ""} |`,
		);
	}
	const total = FINDER_CASES.length;
	console.log(
		`\njev: ${right}/${total} right, ${inTopTwo}/${total} in top two; ${confident} at confidence >= ${OFFER_CONFIDENCE}, ${confidentRight} of them right`,
	);
}

// ---------------------------------------------------------------------------
// 3. Offline screen of the Practice word pool

const POOL_SAMPLE_SIZE = 400;

async function runWordPool(endpoint: Endpoint) {
	const pool = await loadWordPoolForTopic(SchwaTopic);
	// Seeded so a rerun screens the same words.
	let seed = 20260923;
	const random = () => {
		seed = (seed * 1664525 + 1013904223) % 4294967296;
		return seed / 4294967296;
	};
	const shuffled = pool.map((entry) => entry.word).sort(() => random() - 0.5);
	const sample = [...EditorialBlocklist, ...shuffled.slice(0, POOL_SAMPLE_SIZE)];

	type PoolAnswers = {
		ordinary: { type: "noul"; noul: number };
		sensitive: { type: "noul"; noul: number };
	};
	const rows = await mapLimited(sample, 16, async (word) => {
		const answers = await askJev<PoolAnswers>(endpoint, {
			state: { word },
			questions: {
				ordinary: {
					type: "noul",
					instructions:
						"Is this an ordinary English word a learner would recognize and could meet in everyday reading, rather than an abbreviation, initialism, proper name, brand, or fragment of a foreign phrase?",
				},
				sensitive: {
					type: "noul",
					instructions:
						"Would showing this word alone in a language-learning game likely offend or upset learners (vulgar, sexual, slur, or graphic violence)?",
				},
			},
		});
		return { word, ordinary: answers.ordinary.noul, sensitive: answers.sensitive.noul };
	});

	const blocklisted = rows.filter((row) => EditorialBlocklist.has(row.word));
	const sampled = rows.filter((row) => !EditorialBlocklist.has(row.word));
	const flaggedOdd = sampled
		.filter((row) => row.ordinary < 0.5)
		.sort((a, b) => a.ordinary - b.ordinary);
	const flaggedSensitive = sampled
		.filter((row) => row.sensitive >= 0.5)
		.sort((a, b) => b.sensitive - a.sensitive);

	console.log(`\n## Practice word pool (schwa pool: ${pool.length} words)\n`);
	console.log("Current blocklist (should read as not ordinary):");
	for (const row of blocklisted)
		console.log(`  ${row.word.padEnd(8)} ordinary=${row.ordinary.toFixed(2)}`);
	console.log(
		`\nSampled ${sampled.length} pool words. Flagged not ordinary (${flaggedOdd.length}):`,
	);
	console.log(
		`  ${flaggedOdd.map((row) => `${row.word} ${row.ordinary.toFixed(2)}`).join(", ") || "none"}`,
	);
	console.log(`Flagged sensitive (${flaggedSensitive.length}):`);
	console.log(
		`  ${flaggedSensitive.map((row) => `${row.word} ${row.sensitive.toFixed(2)}`).join(", ") || "none"}`,
	);
	const borderline = sampled
		.filter((row) => row.ordinary >= 0.5 && row.ordinary < 0.8)
		.map((row) => `${row.word} ${row.ordinary.toFixed(2)}`);
	console.log(`Borderline ordinary 0.5-0.8 (${borderline.length}):`);
	console.log(`  ${borderline.join(", ") || "none"}`);
}

// ---------------------------------------------------------------------------

if (import.meta.main) {
	const endpoint = resolveEndpoint();
	if (endpoint === null) {
		console.log("No TYPESAFE_API_KEY or OPENROUTER_API_KEY.");
		process.exit(1);
	}
	const onlyIndex = process.argv.indexOf("--only");
	const only = onlyIndex === -1 ? null : process.argv[onlyIndex + 1];
	console.log(`Jev via ${endpoint.label}`);
	if (only === null || only === "weak-forms") await runWeakForms(endpoint);
	if (only === null || only === "sound-finder") await runSoundFinder(endpoint);
	if (only === null || only === "word-pool") await runWordPool(endpoint);
	const averageMs = usage.calls === 0 ? 0 : usage.ms / usage.calls;
	console.log(
		`\n${usage.calls} calls, ${usage.inputTokens} input tokens, ${averageMs.toFixed(0)} ms average round trip`,
	);
}
