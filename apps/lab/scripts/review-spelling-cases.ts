#!/usr/bin/env bun
/**
 * Runs the labeled spelling-suggestion review cases against the real repository data:
 * the full CMUDict the server searches, and the curated top-10k the browser ranks with.
 *
 * Usage:
 *   bun --cwd apps/lab ./scripts/review-spelling-cases.ts            # the case table
 *   bun --cwd apps/lab ./scripts/review-spelling-cases.ts --sweep   # plus the sweeps
 *
 * The recorded before/after outcome lives in
 * `docs/research/issue-247-spelling-suggestion-case-review.md`.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadSpellingFrequency } from "../src/lib/transcription/spelling-frequency";
import {
	generateOneSlipVariants,
	type SpellingFrequency,
	suggestSpelling,
} from "../src/lib/transcription/spelling-suggestion";

/**
 * The server searches CMUDict through Turso, which is seeded from this file. It has no
 * package export, so the offline review reads it directly.
 */
const PREVIOUS_LEAD_RATIO = 3;
const BEYOND_CURATED_RANK = 10_000;

const CMUDICT_PATH = resolve(
	import.meta.dirname,
	"../../../packages/phonetics-data/data/en/dict/cmudict.json",
);

type ReviewGroup =
	| "common typo"
	| "obscure neighbour"
	| "short ambiguous"
	| "name"
	| "unknown word"
	| "contraction"
	| "uncommon valid"
	| "dictionary hit";

export interface ReviewCase {
	token: string;
	/** The correction a learner would find useful, or null when silence is the right answer. */
	want: string | null;
	group: ReviewGroup;
}

/**
 * The reviewed set. `dictionary hit` tokens are listed to confirm they never reach
 * suggestion at all: CMUDict already knows them, so they are not unknown-word fixtures.
 */
export const REVIEW_CASES: ReviewCase[] = [
	{ token: "recieve", want: "receive", group: "common typo" },
	{ token: "teh", want: "the", group: "common typo" },
	{ token: "receve", want: "receive", group: "common typo" },
	{ token: "recceive", want: "receive", group: "common typo" },
	{ token: "seperate", want: "separate", group: "common typo" },
	{ token: "occured", want: "occurred", group: "common typo" },
	{ token: "becuase", want: "because", group: "common typo" },
	{ token: "adress", want: "address", group: "common typo" },
	{ token: "wnat", want: "want", group: "common typo" },
	{ token: "thnik", want: "think", group: "common typo" },
	{ token: "alwasy", want: "always", group: "common typo" },
	{ token: "becomming", want: "becoming", group: "common typo" },

	{ token: "reciv", want: null, group: "obscure neighbour" },
	{ token: "langwidge", want: null, group: "obscure neighbour" },
	{ token: "definatly", want: null, group: "obscure neighbour" },

	{ token: "frm", want: "from", group: "short ambiguous" },
	{ token: "bg", want: null, group: "short ambiguous" },
	{ token: "cn", want: null, group: "short ambiguous" },
	{ token: "wrk", want: "work", group: "short ambiguous" },

	{ token: "sanjeev", want: null, group: "name" },
	{ token: "kowalevski", want: null, group: "name" },
	{ token: "rigomart", want: null, group: "name" },

	{ token: "zxqvwoplmj", want: null, group: "unknown word" },
	{ token: "blorptastic", want: null, group: "unknown word" },
	{ token: "flumoxinate", want: null, group: "unknown word" },

	{ token: "dont", want: "don't", group: "contraction" },
	{ token: "isnt", want: "isn't", group: "contraction" },
	{ token: "doesnt", want: "doesn't", group: "contraction" },
	{ token: "wouldnt", want: "wouldn't", group: "contraction" },

	{ token: "aardvrk", want: "aardvark", group: "uncommon valid" },
	{ token: "zucchinni", want: "zucchini", group: "uncommon valid" },
	{ token: "rhinocerus", want: "rhinoceros", group: "uncommon valid" },
	{ token: "asparagas", want: "asparagus", group: "uncommon valid" },
	{ token: "wierdness", want: "weirdness", group: "uncommon valid" },

	{ token: "fone", want: null, group: "dictionary hit" },
	{ token: "nite", want: null, group: "dictionary hit" },
	{ token: "alot", want: null, group: "dictionary hit" },
	{ token: "thier", want: null, group: "dictionary hit" },
];

export interface ReviewData {
	/** Every word the pronunciation dictionary knows, lowercased. */
	pronunciationWords: Set<string>;
	frequency: SpellingFrequency;
}

export async function loadReviewData(): Promise<ReviewData> {
	const cmudict = JSON.parse(readFileSync(CMUDICT_PATH, "utf8")) as {
		data: Record<string, unknown>;
	};
	return {
		pronunciationWords: new Set(Object.keys(cmudict.data).map((word) => word.toLowerCase())),
		frequency: await loadSpellingFrequency(),
	};
}

export interface ReviewOutcome extends ReviewCase {
	/** True when CMUDict already knows the token, so suggestion is never reached. */
	dictionaryHit: boolean;
	/** The candidates the server lookup would attach to the token. */
	candidates: string[];
	got: string | null;
	/** What the policy at `3cc4464` offered, for the recorded before column. */
	before: string | null;
	verdict: "correct" | "correctly silent" | "wrong" | "missed" | "not offered";
}

/**
 * The policy shipped at `3cc4464`, frozen here so the recorded before column and the
 * sweep comparison stay reproducible. Any unique candidate was offered unconditionally.
 */
export function previousPolicyPick(candidates: string[], frequency: SpellingFrequency) {
	if (candidates.length === 0) return null;
	if (candidates.length === 1) return candidates[0] ?? null;

	const scored = candidates
		.map((word) => ({ word, score: 1 / ((frequency.rank(word) ?? BEYOND_CURATED_RANK) + 1) }))
		.sort((left, right) => right.score - left.score || left.word.localeCompare(right.word));
	const [leader, runnerUp] = scored;
	if (leader === undefined || runnerUp === undefined) return null;
	return leader.score >= PREVIOUS_LEAD_RATIO * runnerUp.score ? leader.word : null;
}

function reviewCase(reviewCase: ReviewCase, data: ReviewData): ReviewOutcome {
	const { token, want } = reviewCase;
	const dictionaryHit = data.pronunciationWords.has(token.toLowerCase());
	if (dictionaryHit) {
		return {
			...reviewCase,
			dictionaryHit,
			candidates: [],
			got: null,
			before: null,
			verdict: "not offered",
		};
	}

	const candidates = candidatesFor(token, data);
	const suggestion = suggestSpelling({
		originalText: token,
		tokens: [token],
		misses: [{ tokenIndex: 0, candidates }],
		frequency: data.frequency,
	});
	const got = suggestion?.suggestedText ?? null;

	let verdict: ReviewOutcome["verdict"];
	if (got === want) verdict = want === null ? "correctly silent" : "correct";
	else if (got === null) verdict = "missed";
	else verdict = "wrong";

	const before = previousPolicyPick(candidates, data.frequency);
	return { ...reviewCase, dictionaryHit, candidates, got, before, verdict };
}

/** The candidates the server's neighbour search attaches to a missed token. */
export function candidatesFor(token: string, data: ReviewData): string[] {
	return generateOneSlipVariants(token).filter((variant) => data.pronunciationWords.has(variant));
}

export function runReview(data: ReviewData): ReviewOutcome[] {
	return REVIEW_CASES.map((entry) => reviewCase(entry, data));
}

/**
 * Decision support for the recorded sweep table, not a benchmark. Corrupts real dictionary
 * words with one slip and keeps the cases that miss CMUDict, so they reach suggestion.
 */
function runSweeps(data: ReviewData): void {
	// Seeded so the recorded numbers can be reproduced exactly.
	let seed = 20260920;
	function random(): number {
		seed = (seed * 1664525 + 1013904223) % 4294967296;
		return seed / 4294967296;
	}
	const pick = <T>(list: T[]): T => list[Math.floor(random() * list.length)] as T;
	const letters = [..."abcdefghijklmnopqrstuvwxyz"];

	function corrupt(word: string): string | null {
		const index = Math.floor(random() * word.length);
		switch (pick(["drop", "double", "swap", "typo"])) {
			case "drop":
				return word.slice(0, index) + word.slice(index + 1);
			case "double":
				return word.slice(0, index) + word[index] + word.slice(index);
			case "swap":
				return index + 1 >= word.length || word[index] === word[index + 1]
					? null
					: word.slice(0, index) + word[index + 1] + word[index] + word.slice(index + 2);
			default: {
				const letter = pick(letters);
				return letter === word[index]
					? null
					: word.slice(0, index) + letter + word.slice(index + 1);
			}
		}
	}

	function offerFor(token: string, policy: "before" | "after"): string | null {
		const candidates = candidatesFor(token, data);
		if (policy === "before") return previousPolicyPick(candidates, data.frequency);
		return (
			suggestSpelling({
				originalText: token,
				tokens: [token],
				misses: [{ tokenIndex: 0, candidates }],
				frequency: data.frequency,
			})?.suggestedText ?? null
		);
	}

	const curated: string[] = [];
	const beyondCurated: string[] = [];
	for (const word of data.pronunciationWords) {
		if (data.frequency.rank(word) !== null) {
			if (/^[a-z]{4,}$/.test(word)) curated.push(word);
		} else if (/^[a-z]{6,}$/.test(word)) beyondCurated.push(word);
	}
	curated.sort();
	beyondCurated.sort();

	function sweep(label: string, pool: string[]): void {
		const tally = {
			before: { recovered: 0, wrong: 0 },
			after: { recovered: 0, wrong: 0 },
		};
		let trials = 0;
		for (let run = 0; run < 4000; run += 1) {
			const word = pick(pool);
			const typo = corrupt(word);
			if (typo === null || typo.length === 0 || data.pronunciationWords.has(typo)) continue;
			trials += 1;
			for (const policy of ["before", "after"] as const) {
				const got = offerFor(typo, policy);
				if (got === word) tally[policy].recovered += 1;
				else if (got !== null) tally[policy].wrong += 1;
			}
		}
		const percent = (value: number) => `${((100 * value) / trials).toFixed(1)}%`;
		console.log(`\n${label}: ${trials} reachable trials`);
		for (const [policy, counts] of Object.entries(tally)) {
			console.log(
				`  ${policy.padEnd(6)} recovered=${percent(counts.recovered)}  wrong=${percent(counts.wrong)}`,
			);
		}
	}

	sweep("corrupted curated words", curated);
	sweep("corrupted beyond-curated words", beyondCurated);

	const consonants = [..."bcdfgklmnprstvwz"];
	const vowels = [..."aeiou"];
	const offered = { before: 0, after: 0 };
	let nonWords = 0;
	for (let run = 0; run < 4000; run += 1) {
		const shape = pick(["cvccvc", "cvcvcc", "ccvcvc", "cvccvcv", "cvcvc"]);
		const token = [...shape].map((slot) => pick(slot === "c" ? consonants : vowels)).join("");
		if (data.pronunciationWords.has(token)) continue;
		nonWords += 1;
		for (const policy of ["before", "after"] as const) {
			if (offerFor(token, policy) !== null) offered[policy] += 1;
		}
	}
	console.log(`\nrandom pronounceable non-words: ${nonWords} reachable trials`);
	for (const [policy, count] of Object.entries(offered)) {
		console.log(`  ${policy.padEnd(6)} offered=${((100 * count) / nonWords).toFixed(1)}%`);
	}
}

if (import.meta.main) {
	const data = await loadReviewData();
	const outcomes = runReview(data);

	console.log("| group | token | want | before | after | verdict |");
	console.log("| --- | --- | --- | --- | --- | --- |");
	for (const outcome of outcomes) {
		const show = (value: string | null) => (outcome.dictionaryHit ? "—" : (value ?? "_(silent)_"));
		console.log(
			`| ${outcome.group} | \`${outcome.token}\` | ${show(outcome.want)} | ${show(outcome.before)} | ${show(outcome.got)} | ${outcome.verdict} |`,
		);
	}

	const counts = new Map<string, number>();
	for (const outcome of outcomes) {
		counts.set(outcome.verdict, (counts.get(outcome.verdict) ?? 0) + 1);
	}
	console.log(`\n${[...counts].map(([verdict, n]) => `${verdict}: ${n}`).join(", ")}`);

	if (process.argv.includes("--sweep")) runSweeps(data);
}
