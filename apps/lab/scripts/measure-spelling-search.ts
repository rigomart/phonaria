#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
/**
 * Measures what suggestion retrieval costs, and what the alternatives would have cost.
 *
 * Usage:
 *   bun --cwd apps/lab ./scripts/measure-spelling-search.ts
 *
 * Three retrieval shapes are compared for the second edit:
 *   A. scan the curated 10k the browser already holds  (what this change ships)
 *   B. scan a compact full-dictionary index shipped to the browser
 *   C. enumerate two-edit variants and ask the database
 *
 * The recorded numbers live in `docs/research/issue-248-two-edit-spelling-suggestions.md`.
 * Timings are from one machine and are for comparing the options against each other, not
 * as production latency figures.
 */
import { gzipSync } from "node:zlib";
import { classifyEdits } from "../src/lib/transcription/spelling-edits";
import {
	createSpellingVocabulary,
	generateOneEditVariants,
	MIN_LENGTH_FOR_TWO_EDITS,
	ranksFromOrder,
} from "../src/lib/transcription/spelling-search";
import { MAX_EXPANDED_TOKENS_PER_REQUEST } from "../src/lib/transcription/spelling-suggestion";

const CMUDICT_PATH = resolve(
	import.meta.dirname,
	"../../../packages/phonetics-data/data/en/dict/cmudict.json",
);
const CURATED_10K_PATH = resolve(
	import.meta.dirname,
	"../../../packages/phonetics-data/data/en/curated/top-10k.json",
);

/** The chunk size `findExistingCmudictWords` sends per membership query. */
const MEMBERSHIP_CHUNK = 400;

/** Representative misses, plus the longest input that still reaches the two-edit search. */
const REPRESENTATIVE = ["teh", "recieve", "acomodate", "definatly", "reccomend"];
const WORST_CASE = ["blorptastic", "internationalisaton", "antidisestablishmentarianisn"];

function median(values: number[]): number {
	const sorted = [...values].sort((left, right) => left - right);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0
		? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
		: (sorted[middle] ?? 0);
}

function timeOf(runs: number, work: () => void): number {
	const samples: number[] = [];
	for (let run = 0; run < runs; run += 1) {
		const started = performance.now();
		work();
		samples.push(performance.now() - started);
	}
	return median(samples);
}

const dictionaryWords = new Set(
	Object.keys(
		(JSON.parse(readFileSync(CMUDICT_PATH, "utf8")) as { data: Record<string, unknown> }).data,
	).map((word) => word.toLowerCase()),
);
const curatedWords = Object.keys(
	(JSON.parse(readFileSync(CURATED_10K_PATH, "utf8")) as { words: Record<string, unknown> }).words,
);
const ranks = ranksFromOrder(curatedWords);

console.log(`dictionary: ${dictionaryWords.size} words · curated: ${curatedWords.length} words`);

/* ------------------------------------------------- the first edit (server) */

console.log("\n## First edit: enumerate the query, ask Turso once (unchanged)\n");
console.log("| token | length | one-edit variants | membership queries | second-order variants |");
console.log("| --- | --- | --- | --- | --- |");
for (const token of [...REPRESENTATIVE, ...WORST_CASE]) {
	const variants = generateOneEditVariants(token);
	// What a naive two-edit enumeration would have to send, if it were sent at all.
	const secondOrder = new Set<string>();
	for (const variant of variants) {
		for (const nested of generateOneEditVariants(variant)) secondOrder.add(nested);
	}
	console.log(
		`| \`${token}\` | ${token.length} | ${variants.length} | ${Math.ceil(variants.length / MEMBERSHIP_CHUNK)} | ${secondOrder.size.toLocaleString()} |`,
	);
}

/* ---------------------------------------------- response size on the wire */

console.log("\n## Response size: the neighbours the server sends per missed token\n");
console.log("| token | neighbours | JSON bytes |");
console.log("| --- | --- | --- |");
let worstNeighbourBytes = 0;
for (const token of [...REPRESENTATIVE, ...WORST_CASE]) {
	const neighbours = generateOneEditVariants(token).filter((variant) =>
		dictionaryWords.has(variant),
	);
	const bytes = Buffer.byteLength(JSON.stringify({ spellingNeighbours: neighbours }), "utf8");
	worstNeighbourBytes = Math.max(worstNeighbourBytes, bytes);
	console.log(`| \`${token}\` | ${neighbours.length} | ${bytes} |`);
}
console.log(
	`\nThe second edit adds nothing here: the curated scan runs in the browser, so the response is byte-identical to before. Worst measured token: ${worstNeighbourBytes} bytes.`,
);

/* --------------------------------------------- option A: curated-10k scan */

console.log("\n## Option A: scan the curated 10k (shipped)\n");

const coldStarted = performance.now();
const vocabulary = createSpellingVocabulary(ranks);
const indexBuildMs = performance.now() - coldStarted;
// Warm it once so the first measured scan is not also paying for lazy JIT.
vocabulary.nearWords("recieve");

console.log(
	`Index build (once per session): ${indexBuildMs.toFixed(1)} ms for ${curatedWords.length} words`,
);
console.log("\n| token | length | candidates found | scan ms (warm) |");
console.log("| --- | --- | --- | --- |");
const perTokenScanMs: number[] = [];
for (const token of [...REPRESENTATIVE, ...WORST_CASE]) {
	const found = vocabulary.nearWords(token);
	const scanMs = timeOf(200, () => {
		vocabulary.nearWords(token);
	});
	perTokenScanMs.push(scanMs);
	console.log(`| \`${token}\` | ${token.length} | ${found.length} | ${scanMs.toFixed(3)} |`);
}

// The worst per-token scan is not the longest token: it is a token whose length buckets are
// large and whose letters clear the mask filter, so sweep lengths as well as the real cases.
let worstToken = REPRESENTATIVE[0] ?? "recieve";
let worstScanMs = 0;
for (const [index, token] of [...REPRESENTATIVE, ...WORST_CASE].entries()) {
	const scanMs = perTokenScanMs[index] ?? 0;
	if (scanMs > worstScanMs) {
		worstScanMs = scanMs;
		worstToken = token;
	}
}
for (let length = MIN_LENGTH_FOR_TWO_EDITS; length <= 20; length += 1) {
	// Vowel-heavy, so the letter mask rules out as little as possible.
	const token = "aeioulnrst".repeat(3).slice(0, length);
	const scanMs = timeOf(50, () => {
		vocabulary.nearWords(token);
	});
	if (scanMs > worstScanMs) {
		worstScanMs = scanMs;
		worstToken = token;
	}
}
console.log(
	`\nWorst scan observed, over the cases above and every token length ${MIN_LENGTH_FOR_TWO_EDITS}–20: ` +
		`${worstScanMs.toFixed(3)} ms (\`${worstToken}\`).`,
);

// The request ceiling uses that worst token, so it is a ceiling and not an average.
const requestTokens = Array.from({ length: MAX_EXPANDED_TOKENS_PER_REQUEST }, () => worstToken);
const requestMs = timeOf(50, () => {
	for (const token of requestTokens) vocabulary.nearWords(token);
});
console.log(
	`Whole-request ceiling (${MAX_EXPANDED_TOKENS_PER_REQUEST} scans, the per-request bound): ${requestMs.toFixed(2)} ms warm, ` +
		`${(indexBuildMs + requestMs).toFixed(1)} ms cold.`,
);
// No result ceiling by design; the bound is the scan, so record what the pool actually reaches.
let worstPool = 0;
let worstPoolToken = "";
for (let length = MIN_LENGTH_FOR_TWO_EDITS; length <= 12; length += 1) {
	for (const shape of ["aeioulnrst", "sarings", "earings"]) {
		const token = shape.repeat(3).slice(0, length);
		const count = vocabulary.nearWords(token).length;
		if (count > worstPool) {
			worstPool = count;
			worstPoolToken = token;
		}
	}
}
console.log(
	`Largest candidate pool seen while sweeping token shapes: ${worstPool} (\`${worstPoolToken}\`). ` +
		`Every one is judged; the search never truncates.`,
);

/* ------------------------------- option B: compact full-dictionary index */

console.log("\n## Option B: ship a compact full-dictionary index to the browser\n");

const allWords = [...dictionaryWords];
const fullRanks: Record<string, number> = {};
// No frequency evidence outside the curated list, so every extra word is rank-less. Modelled
// here by giving them the curated ranks where known and an out-of-band rank otherwise.
allWords.forEach((word) => {
	fullRanks[word] = ranks[word] ?? 10_000;
});
const fullStarted = performance.now();
const fullVocabulary = createSpellingVocabulary(fullRanks);
const fullBuildMs = performance.now() - fullStarted;
fullVocabulary.nearWords("recieve");

const plainList = allWords.join("\n");
const listBytes = Buffer.byteLength(plainList, "utf8");
const gzippedBytes = gzipSync(Buffer.from(plainList, "utf8")).length;

console.log(`Index build: ${fullBuildMs.toFixed(1)} ms for ${allWords.length} words`);
console.log(
	`Asset to ship: ${(listBytes / 1024).toFixed(0)} KiB raw, ${(gzippedBytes / 1024).toFixed(0)} KiB gzipped (newline-separated words, no pronunciations).`,
);
console.log("\n| token | candidates found | scan ms (warm) | vs option A |");
console.log("| --- | --- | --- | --- |");
for (const [index, token] of [...REPRESENTATIVE, ...WORST_CASE].entries()) {
	const found = fullVocabulary.nearWords(token);
	const scanMs = timeOf(50, () => {
		fullVocabulary.nearWords(token);
	});
	const reference = perTokenScanMs[index] ?? 0;
	// Below a microsecond the ratio is timer noise, so report the times instead of a factor.
	const factor = reference < 0.005 ? "—" : `${(scanMs / reference).toFixed(1)}x`;
	console.log(`| \`${token}\` | ${found.length} | ${scanMs.toFixed(3)} | ${factor} |`);
}

// The decisive question for option B is not how many more candidates it finds, but how many
// of them the policy could ever offer. Two edits need frequency evidence, and the curated list
// is the only frequency evidence there is, so a candidate it does not rank is unofferable.
let extraCandidates = 0;
let extraOfferable = 0;
for (const token of [...REPRESENTATIVE, ...WORST_CASE, "brocolli", "gnocci", "rember"]) {
	const near = new Set(vocabulary.nearWords(token));
	for (const word of fullVocabulary.nearWords(token)) {
		if (near.has(word)) continue;
		extraCandidates += 1;
		// `ranks` holds the curated list only, so this is the real evidence test.
		if (ranks[word] !== undefined) extraOfferable += 1;
	}
}
console.log(
	`\nExtra candidates option B finds over option A: ${extraCandidates}. ` +
		`Of those, ${extraOfferable} carry the frequency evidence a two-edit reading needs, ` +
		`so the rest could not be offered however cheap the search became.`,
);
const broccoliCurated = ranks.broccoli !== undefined;
console.log(
	`The holdout miss \`brocolli\` is the concrete case: option B finds \`broccoli\`, but the curated list ` +
		`${broccoliCurated ? "ranks" : "does not rank"} it, so the offer ${broccoliCurated ? "would" : "would still not"} be made.`,
);

/* ---------------------------------- option C: database-backed second edit */

console.log("\n## Option C: ask the database for two-edit candidates\n");

let totalSecondOrder = 0;
for (const token of REPRESENTATIVE) {
	const variants = generateOneEditVariants(token);
	const secondOrder = new Set<string>();
	for (const variant of variants) {
		for (const nested of generateOneEditVariants(variant)) secondOrder.add(nested);
	}
	totalSecondOrder += secondOrder.size;
}
console.log(
	`Enumerating two edits for the ${REPRESENTATIVE.length} representative tokens means ` +
		`${totalSecondOrder.toLocaleString()} variants, or ` +
		`${Math.ceil(totalSecondOrder / MEMBERSHIP_CHUNK).toLocaleString()} membership queries of ${MEMBERSHIP_CHUNK}.`,
);

// The affordable database shape is a deletes index (SymSpell): store every word under each of
// its delete-variants, then look up the query's delete-variants. Measure what that table costs.
function deleteVariants(word: string, maxEdits: number): Set<string> {
	let frontier = new Set([word]);
	const all = new Set<string>();
	for (let round = 0; round < maxEdits; round += 1) {
		const next = new Set<string>();
		for (const entry of frontier) {
			for (let index = 0; index < entry.length; index += 1) {
				const shorter = entry.slice(0, index) + entry.slice(index + 1);
				if (shorter.length > 0 && !all.has(shorter)) {
					all.add(shorter);
					next.add(shorter);
				}
			}
		}
		frontier = next;
	}
	return all;
}

let deletesRows = 0;
for (const word of allWords) deletesRows += deleteVariants(word, 2).size + 1;
const queryVariants = median(
	[...REPRESENTATIVE, ...WORST_CASE].map((token) => deleteVariants(token, 2).size + 1),
);
console.log(
	`A two-edit deletes index over the dictionary is ${deletesRows.toLocaleString()} rows ` +
		`(${(deletesRows / allWords.length).toFixed(0)} per word). A query sends ~${queryVariants} keys, ` +
		`so one round trip — but the table has to be built, stored and indexed in Turso first.`,
);

/* -------------------------------------------------------- classifier cost */

console.log("\n## Classifier cost\n");
const pairs: [string, string][] = [
	["acomodate", "accommodate"],
	["recieve", "receive"],
	["definatly", "definitely"],
	["zxqvwoplmj", "receive"],
];
const perCallMs =
	timeOf(20, () => {
		for (let run = 0; run < 10_000; run += 1) {
			for (const [token, candidate] of pairs) classifyEdits(token, candidate, 2);
		}
	}) /
	(10_000 * pairs.length);
console.log(`classifyEdits: ${(perCallMs * 1_000_000).toFixed(2)} ns per call`);
