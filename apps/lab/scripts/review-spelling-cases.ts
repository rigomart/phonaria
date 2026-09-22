#!/usr/bin/env bun
/**
 * Runs the spelling-suggestion evaluation corpus against the real repository data: the full
 * CMUDict the server searches, and the curated top-10k the browser ranks and scans.
 *
 * Usage:
 *   bun --cwd apps/lab ./scripts/review-spelling-cases.ts           # the case tables
 *   bun --cwd apps/lab ./scripts/review-spelling-cases.ts --sweep   # plus the sweeps
 *   bun --cwd apps/lab ./scripts/review-spelling-cases.ts --tune    # plus threshold sweeps
 *
 * `--tune` reads the tuning split only. The recorded outcome lives in
 * `docs/research/issue-248-two-edit-spelling-suggestions.md`.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	createSpellingVocabulary,
	generateOneEditVariants,
	ranksFromOrder,
	type SpellingVocabulary,
} from "../src/lib/transcription/spelling-search";
import {
	DEFAULT_SUGGESTION_WEIGHTS,
	pickPlausibleNeighbour,
	type SuggestionWeights,
	suggestSpelling,
} from "../src/lib/transcription/spelling-suggestion";
import {
	CORPUS_CASES,
	type CorpusCase,
	type CorpusSplit,
	type Verdict,
	verdictFor,
} from "./spelling-corpus";

/**
 * The server searches CMUDict through Turso, which is seeded from this file. It has no
 * package export, so the offline review reads it directly.
 */
const CMUDICT_PATH = resolve(
	import.meta.dirname,
	"../../../packages/phonetics-data/data/en/dict/cmudict.json",
);
const CURATED_10K_PATH = resolve(
	import.meta.dirname,
	"../../../packages/phonetics-data/data/en/curated/top-10k.json",
);

/**
 * The one-edit policy shipped at `46a82cf`, as the baseline this change is measured against.
 * It read a single slip only, and discounted neither weak patterns nor a second edit — which
 * is exactly `maxEdits: 1` with both weights at 1.
 */
export const ONE_EDIT_BASELINE: SuggestionWeights = {
	...DEFAULT_SUGGESTION_WEIGHTS,
	maxEdits: 1,
	weakPattern: 1,
	twoEdit: 1,
};

/** What this change ships. Imported, never restated, so a sweep cannot drift from the app. */
export const SHIPPED_POLICY: SuggestionWeights = DEFAULT_SUGGESTION_WEIGHTS;

export interface ReviewData {
	/** Every word the pronunciation dictionary knows, lowercased. */
	pronunciationWords: Set<string>;
	vocabulary: SpellingVocabulary;
}

export async function loadReviewData(): Promise<ReviewData> {
	const cmudict = JSON.parse(readFileSync(CMUDICT_PATH, "utf8")) as {
		data: Record<string, unknown>;
	};
	const curated = JSON.parse(readFileSync(CURATED_10K_PATH, "utf8")) as {
		words: Record<string, unknown>;
	};
	return {
		pronunciationWords: new Set(Object.keys(cmudict.data).map((word) => word.toLowerCase())),
		vocabulary: createSpellingVocabulary(ranksFromOrder(Object.keys(curated.words))),
	};
}

/** The candidates the server's one-edit neighbour search attaches to a missed token. */
export function serverCandidatesFor(token: string, data: ReviewData): string[] {
	return generateOneEditVariants(token).filter((variant) => data.pronunciationWords.has(variant));
}

/**
 * One token through the shipped policy under the given weights.
 *
 * Only the candidate pool is assembled here — the judging is `pickPlausibleNeighbour` itself,
 * so a swept threshold measures the code that ships rather than a second implementation of it.
 * The pool is the script's business because the baseline has to be reproduced by withholding
 * the curated scan, which is a retrieval decision rather than a policy one.
 */
export function pickUnderPolicy(
	token: string,
	data: ReviewData,
	weights: SuggestionWeights,
): string | null {
	const candidatePool = new Set(serverCandidatesFor(token, data));
	if (weights.maxEdits > 1) {
		for (const word of data.vocabulary.nearWords(token)) candidatePool.add(word);
	}
	return pickPlausibleNeighbour(token, [...candidatePool], data.vocabulary, weights);
}

export interface ReviewOutcome extends CorpusCase {
	/** True when CMUDict already knows the token, so suggestion is never reached. */
	dictionaryHit: boolean;
	serverCandidates: string[];
	/** Words only the curated two-edit scan reaches. */
	scanCandidates: string[];
	baseline: string | null;
	got: string | null;
	verdict: Verdict;
	baselineVerdict: Verdict;
}

function reviewCase(entry: CorpusCase, data: ReviewData): ReviewOutcome {
	const dictionaryHit = data.pronunciationWords.has(entry.token.toLowerCase());
	if (dictionaryHit) {
		// Suggestion is never reached for a word CMUDict knows, so there is nothing to search
		// and nothing to judge. `verdictFor` is still the one place a verdict is decided.
		return {
			...entry,
			dictionaryHit,
			serverCandidates: [],
			scanCandidates: [],
			baseline: null,
			got: null,
			verdict: verdictFor(entry, null, true),
			baselineVerdict: verdictFor(entry, null, true),
		};
	}

	const serverCandidates = serverCandidatesFor(entry.token, data);
	const serverSet = new Set(serverCandidates);
	const scanCandidates = data.vocabulary
		.nearWords(entry.token)
		.filter((word) => !serverSet.has(word));

	// The shipped path, through the real module, not the parameterised copy.
	const got =
		suggestSpelling({
			originalText: entry.token,
			tokens: [entry.token],
			misses: [{ tokenIndex: 0, candidates: serverCandidates }],
			vocabulary: data.vocabulary,
		})?.suggestedText ?? null;
	const baseline = pickUnderPolicy(entry.token, data, ONE_EDIT_BASELINE);

	return {
		...entry,
		dictionaryHit,
		serverCandidates,
		scanCandidates,
		baseline,
		got,
		verdict: verdictFor(entry, got, dictionaryHit),
		baselineVerdict: verdictFor(entry, baseline, dictionaryHit),
	};
}

export function runReview(data: ReviewData): ReviewOutcome[] {
	return CORPUS_CASES.map((entry) => reviewCase(entry, data));
}

const VERDICT_ORDER: Verdict[] = [
	"correct",
	"wrong",
	"missed",
	"abstained",
	"correctly silent",
	"not offered",
];

function tally(outcomes: ReviewOutcome[], read: (outcome: ReviewOutcome) => Verdict) {
	const counts = new Map<Verdict, number>();
	for (const outcome of outcomes) counts.set(read(outcome), (counts.get(read(outcome)) ?? 0) + 1);
	return counts;
}

function printCaseTable(outcomes: ReviewOutcome[], split: CorpusSplit): void {
	console.log(`\n### ${split}\n`);
	console.log("| category | token | acceptable | one-edit baseline | this change | verdict |");
	console.log("| --- | --- | --- | --- | --- | --- |");
	for (const outcome of outcomes.filter((entry) => entry.split === split)) {
		const show = (value: string | null) => (outcome.dictionaryHit ? "—" : (value ?? "_(silent)_"));
		const acceptable = outcome.dictionaryHit
			? "—"
			: outcome.acceptable.length === 0
				? "_(silence)_"
				: outcome.acceptable.join(" / ");
		console.log(
			`| ${outcome.category} | \`${outcome.token}\` | ${acceptable} | ${show(outcome.baseline)} | ${show(outcome.got)} | ${outcome.verdict} |`,
		);
	}
}

function printSummary(outcomes: ReviewOutcome[], split: CorpusSplit): void {
	const subset = outcomes.filter((entry) => entry.split === split);
	const before = tally(subset, (outcome) => outcome.baselineVerdict);
	const after = tally(subset, (outcome) => outcome.verdict);
	console.log(`\n${split}: | verdict | one-edit baseline | this change |`);
	console.log("| --- | --- | --- |");
	for (const verdict of VERDICT_ORDER) {
		console.log(`| ${verdict} | ${before.get(verdict) ?? 0} | ${after.get(verdict) ?? 0} |`);
	}
}

function printByCategory(outcomes: ReviewOutcome[]): void {
	const categories = [...new Set(outcomes.map((outcome) => outcome.category))];
	console.log(
		"\n| category | cases | correct | wrong | missed | abstained | silent | not offered |",
	);
	console.log("| --- | --- | --- | --- | --- | --- | --- | --- |");
	for (const category of categories) {
		const subset = outcomes.filter((outcome) => outcome.category === category);
		const counts = tally(subset, (outcome) => outcome.verdict);
		const baseline = tally(subset, (outcome) => outcome.baselineVerdict);
		const pair = (verdict: Verdict) =>
			`${baseline.get(verdict) ?? 0} → ${counts.get(verdict) ?? 0}`;
		// Every verdict is printed, so each row's columns add up to its case count.
		const accounted = VERDICT_ORDER.reduce((sum, verdict) => sum + (counts.get(verdict) ?? 0), 0);
		if (accounted !== subset.length) {
			throw new Error(`${category}: ${accounted} verdicts for ${subset.length} cases`);
		}
		console.log(
			`| ${category} | ${subset.length} | ${pair("correct")} | ${pair("wrong")} | ${pair("missed")} | ${pair("abstained")} | ${pair("correctly silent")} | ${pair("not offered")} |`,
		);
	}
}

/* ------------------------------------------------------------------ sweeps */

function seededRandom(seed: number) {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
}

const LETTERS = [..."abcdefghijklmnopqrstuvwxyz"];

/** One random slip, or null when the draw produced no change. */
function corruptOnce(word: string, random: () => number): string | null {
	const index = Math.floor(random() * word.length);
	const kind = ["drop", "double", "swap", "typo"][Math.floor(random() * 4)];
	switch (kind) {
		case "drop":
			return word.slice(0, index) + word.slice(index + 1);
		case "double":
			return word.slice(0, index) + word[index] + word.slice(index);
		case "swap":
			return index + 1 >= word.length || word[index] === word[index + 1]
				? null
				: word.slice(0, index) + word[index + 1] + word[index] + word.slice(index + 2);
		default: {
			const letter = LETTERS[Math.floor(random() * LETTERS.length)] ?? "a";
			return letter === word[index] ? null : word.slice(0, index) + letter + word.slice(index + 1);
		}
	}
}

function corrupt(word: string, slips: number, random: () => number): string | null {
	let result = word;
	for (let slip = 0; slip < slips; slip += 1) {
		const next = corruptOnce(result, random);
		if (next === null || next.length === 0) return null;
		result = next;
	}
	return result === word ? null : result;
}

interface SweepTally {
	trials: number;
	recovered: number;
	wrong: number;
	offered: number;
}

function sweepPool(
	pool: string[],
	slips: number,
	data: ReviewData,
	weights: SuggestionWeights,
	runs: number,
	seed: number,
): SweepTally {
	const random = seededRandom(seed);
	const result: SweepTally = { trials: 0, recovered: 0, wrong: 0, offered: 0 };
	for (let run = 0; run < runs; run += 1) {
		const word = pool[Math.floor(random() * pool.length)];
		if (word === undefined) continue;
		const typo = corrupt(word, slips, random);
		if (typo === null || data.pronunciationWords.has(typo)) continue;
		result.trials += 1;
		const got = pickUnderPolicy(typo, data, weights);
		if (got !== null) result.offered += 1;
		if (got === word) result.recovered += 1;
		else if (got !== null) result.wrong += 1;
	}
	return result;
}

function nonWordPool(data: ReviewData, count: number, seed: number): string[] {
	const random = seededRandom(seed);
	const consonants = [..."bcdfgklmnprstvwz"];
	const vowels = [..."aeiou"];
	const shapes = ["cvccvc", "cvcvcc", "ccvcvc", "cvccvcv", "cvcvcvc"];
	const pool: string[] = [];
	while (pool.length < count) {
		const shape = shapes[Math.floor(random() * shapes.length)] ?? "cvccvc";
		const token = [...shape]
			.map((slot) => {
				const bank = slot === "c" ? consonants : vowels;
				return bank[Math.floor(random() * bank.length)] ?? "a";
			})
			.join("");
		if (!data.pronunciationWords.has(token)) pool.push(token);
	}
	return pool;
}

function buildPools(data: ReviewData) {
	const curated: string[] = [];
	const beyondCurated: string[] = [];
	for (const word of data.pronunciationWords) {
		if (data.vocabulary.rank(word) !== null) {
			if (/^[a-z]{6,}$/.test(word)) curated.push(word);
		} else if (/^[a-z]{6,}$/.test(word)) beyondCurated.push(word);
	}
	curated.sort();
	beyondCurated.sort();
	return { curated, beyondCurated };
}

const SWEEP_RUNS = 4_000;

function runSweeps(data: ReviewData): void {
	const { curated, beyondCurated } = buildPools(data);
	const percent = (value: number, total: number) =>
		total === 0 ? "—" : `${((100 * value) / total).toFixed(1)}%`;

	const sweeps: { label: string; pool: string[]; slips: number; seed: number }[] = [
		{ label: "curated words, one slip", pool: curated, slips: 1, seed: 20260921 },
		{ label: "curated words, two slips", pool: curated, slips: 2, seed: 20260922 },
		{ label: "beyond-curated words, one slip", pool: beyondCurated, slips: 1, seed: 20260923 },
		{ label: "beyond-curated words, two slips", pool: beyondCurated, slips: 2, seed: 20260924 },
	];

	console.log("\n| sweep | policy | trials | recovered | wrong |");
	console.log("| --- | --- | --- | --- | --- |");
	for (const { label, pool, slips, seed } of sweeps) {
		for (const [name, weights] of [
			["one-edit baseline", ONE_EDIT_BASELINE],
			["this change", SHIPPED_POLICY],
		] as const) {
			const tallied = sweepPool(pool, slips, data, weights, SWEEP_RUNS, seed);
			console.log(
				`| ${label} | ${name} | ${tallied.trials} | ${percent(tallied.recovered, tallied.trials)} | ${percent(tallied.wrong, tallied.trials)} |`,
			);
		}
	}

	const nonWords = nonWordPool(data, 4_000, 20260925);
	console.log("\n| input | policy | offered anything |");
	console.log("| --- | --- | --- |");
	for (const [name, weights] of [
		["one-edit baseline", ONE_EDIT_BASELINE],
		["this change", SHIPPED_POLICY],
	] as const) {
		let offered = 0;
		for (const token of nonWords) {
			if (pickUnderPolicy(token, data, weights) !== null) offered += 1;
		}
		console.log(
			`| random pronounceable non-words (${nonWords.length}) | ${name} | ${percent(offered, nonWords.length)} |`,
		);
	}
}

/* ----------------------------------------------------- threshold selection */

/** Tuning split only. The holdout cases must not influence a threshold. */
function runTuning(data: ReviewData): void {
	const tuningCases = CORPUS_CASES.filter((entry) => entry.split === "tuning");
	const { curated, beyondCurated } = buildPools(data);
	const nonWords = nonWordPool(data, 2_000, 20260925);

	function score(weights: SuggestionWeights) {
		const counts = new Map<Verdict, number>();
		for (const entry of tuningCases) {
			if (data.pronunciationWords.has(entry.token)) continue;
			const got = pickUnderPolicy(entry.token, data, weights);
			const verdict = verdictFor(entry, got, false);
			// Dictionary hits were skipped above, so `false` here is the real state.
			counts.set(verdict, (counts.get(verdict) ?? 0) + 1);
		}
		const oneSlip = sweepPool(curated, 1, data, weights, 1_500, 20260921);
		const twoSlip = sweepPool(curated, 2, data, weights, 1_500, 20260922);
		const beyond = sweepPool(beyondCurated, 1, data, weights, 1_500, 20260923);
		let noise = 0;
		for (const token of nonWords) {
			if (pickUnderPolicy(token, data, weights) !== null) noise += 1;
		}
		return {
			correct: counts.get("correct") ?? 0,
			wrong: counts.get("wrong") ?? 0,
			missed: counts.get("missed") ?? 0,
			oneSlipRecovered: (100 * oneSlip.recovered) / oneSlip.trials,
			oneSlipWrong: (100 * oneSlip.wrong) / oneSlip.trials,
			twoSlipRecovered: (100 * twoSlip.recovered) / twoSlip.trials,
			twoSlipWrong: (100 * twoSlip.wrong) / twoSlip.trials,
			beyondRecovered: (100 * beyond.recovered) / beyond.trials,
			noise: (100 * noise) / nonWords.length,
		};
	}

	function report(label: string, weights: SuggestionWeights): void {
		const result = score(weights);
		console.log(
			`| ${label} | ${result.correct} | ${result.wrong} | ${result.missed} | ` +
				`${result.oneSlipRecovered.toFixed(1)}% / ${result.oneSlipWrong.toFixed(1)}% | ` +
				`${result.twoSlipRecovered.toFixed(1)}% / ${result.twoSlipWrong.toFixed(1)}% | ` +
				`${result.beyondRecovered.toFixed(1)}% | ${result.noise.toFixed(1)}% |`,
		);
	}

	const header =
		"| policy | correct | wrong | missed | 1-slip rec/wrong | 2-slip rec/wrong | beyond rec | noise |";
	console.log(`\n## Threshold sweeps (tuning split only)\n\n${header}`);
	console.log("| --- | --- | --- | --- | --- | --- | --- | --- |");
	report("one-edit baseline", ONE_EDIT_BASELINE);
	report("shipped", SHIPPED_POLICY);

	console.log(`\n### weak pattern weight\n\n${header}`);
	console.log("| --- | --- | --- | --- | --- | --- | --- | --- |");
	for (const weight of [1, 0.5, 0.25, 0.1]) {
		report(`weakPattern=${weight}`, { ...SHIPPED_POLICY, weakPattern: weight });
	}

	console.log(`\n### two-edit weight\n\n${header}`);
	console.log("| --- | --- | --- | --- | --- | --- | --- | --- |");
	for (const weight of [1, 0.5, 0.3, 0.2, 0.15, 0.1, 0.05]) {
		report(`twoEdit=${weight}`, { ...SHIPPED_POLICY, twoEdit: weight });
	}

	console.log(`\n### separation ratio\n\n${header}`);
	console.log("| --- | --- | --- | --- | --- | --- | --- | --- |");
	for (const ratio of [1.5, 2, 2.5, 3, 4, 6]) {
		report(`leadRatio=${ratio}`, { ...SHIPPED_POLICY, leadRatio: ratio });
	}
}

if (import.meta.main) {
	const data = await loadReviewData();
	const outcomes = runReview(data);

	console.log("## Cases");
	printCaseTable(outcomes, "tuning");
	printCaseTable(outcomes, "holdout");
	printSummary(outcomes, "tuning");
	printSummary(outcomes, "holdout");
	console.log("\n## By error category (baseline → this change)");
	printByCategory(outcomes);

	const reached = outcomes.filter((outcome) => !outcome.dictionaryHit);
	const scanOnly = reached.filter((outcome) => outcome.scanCandidates.length > 0);
	console.log(
		`\nTokens the curated scan added candidates for: ${scanOnly.length}/${reached.length}`,
	);

	if (process.argv.includes("--sweep")) runSweeps(data);
	if (process.argv.includes("--tune")) runTuning(data);
}
