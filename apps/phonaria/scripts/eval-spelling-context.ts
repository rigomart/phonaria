#!/usr/bin/env bun
/**
 * Live check of context-aware spelling suggestions before `FLAG_SPELLING_CONTEXT` goes on in
 * production. Runs the labeled sentences from issue #262 through the shipped path: the real
 * `chooseSpellingInContext` (one Jev call per sentence, whole-word excerpt, `none_of_these`)
 * over OpenRouter with the Worker's timeout, merged with the frequency rule as the browser does.
 *
 * Usage (the key stays in the gitignored `apps/phonaria/.env.local`):
 *   bun --cwd apps/phonaria ./scripts/eval-spelling-context.ts
 *   bun --cwd apps/phonaria ./scripts/eval-spelling-context.ts --dry-run   # print one request
 */
import { tokenizeText } from "../src/lib/g2p/text-processing";
import { type AskJev, createOpenRouterJev } from "../src/lib/jev/client";
import { spellingContextPicksByToken } from "../src/lib/transcription/spelling-context";
import {
	chooseSpellingInContext,
	planSpellingContext,
} from "../src/lib/transcription/spelling-context-service";
import { type SpellingMiss, suggestSpelling } from "../src/lib/transcription/spelling-suggestion";
import { SPELLING_CONTEXT_TIMEOUT_MS } from "../src/server/spelling-context";
import { candidatesFor, loadReviewData, type ReviewData } from "./review-spelling-cases";

type EvalCase = {
	sentence: string;
	/** What a learner would find useful to see, or null when silence is right. */
	want: string | null;
};

/** Issue #262's 34 cases, plus multi-miss sentences that exercise one call with several questions. */
const CASES: EvalCase[] = [
	{ sentence: "Did you recieve my email?", want: "Did you receive my email?" },
	{ sentence: "Put it on teh table.", want: "Put it on the table." },
	{ sentence: "You will receve a gift.", want: "You will receive a gift." },
	{ sentence: "I hope to recceive an answer soon.", want: "I hope to receive an answer soon." },
	{ sentence: "Keep the eggs in a seperate bowl.", want: "Keep the eggs in a separate bowl." },
	{ sentence: "The accident occured last night.", want: "The accident occurred last night." },
	{ sentence: "I stayed home becuase it rained.", want: "I stayed home because it rained." },
	{ sentence: "What is your home adress?", want: "What is your home address?" },
	{ sentence: "I wnat to learn English.", want: "I want to learn English." },
	{ sentence: "I thnik she is right.", want: "I think she is right." },
	{ sentence: "He alwasy arrives late.", want: "He always arrives late." },
	{ sentence: "She is becomming a doctor.", want: "She is becoming a doctor." },
	{ sentence: "I will reciv it tomorrow.", want: null },
	{ sentence: "English is a hard langwidge.", want: null },
	{ sentence: "I will definatly come.", want: null },
	{ sentence: "A letter frm my mom.", want: "A letter from my mom." },
	{ sentence: "That is a bg problem.", want: "That is a big problem." },
	{ sentence: "I cn swim very well.", want: "I can swim very well." },
	{ sentence: "I go to wrk by bus.", want: "I go to work by bus." },
	{ sentence: "My friend sanjeev lives in Pune.", want: null },
	{ sentence: "Professor kowalevski teaches math.", want: null },
	{ sentence: "Follow rigomart on GitHub.", want: null },
	{ sentence: "The code is zxqvwoplmj.", want: null },
	{ sentence: "The movie was blorptastic.", want: null },
	{ sentence: "Do not flumoxinate the kids.", want: null },
	{ sentence: "I dont know the answer.", want: "I don't know the answer." },
	{ sentence: "It isnt fair.", want: "It isn't fair." },
	{ sentence: "She doesnt care.", want: "She doesn't care." },
	{ sentence: "I wouldnt go there.", want: "I wouldn't go there." },
	{ sentence: "An aardvrk eats ants.", want: "An aardvark eats ants." },
	{ sentence: "I grilled some zucchinni.", want: "I grilled some zucchini." },
	{ sentence: "The rhinocerus has a horn.", want: "The rhinoceros has a horn." },
	{
		sentence: "Cook the asparagas for five minutes.",
		want: "Cook the asparagus for five minutes.",
	},
	{ sentence: "I love the wierdness of it.", want: "I love the weirdness of it." },

	{ sentence: "I wnat a bg cake.", want: "I want a big cake." },
	{ sentence: "Teh dog cn run.", want: "The dog can run." },
	{ sentence: "I dont thnik sanjeev will come.", want: "I don't think sanjeev will come." },
	{ sentence: "We wrk frm home.", want: "We work from home." },
];

type Verdict = "right" | "wrong" | "missed";

function verdictFor(want: string | null, got: string | null): Verdict {
	if (got === want) return "right";
	if (got === null) return "missed";
	return "wrong";
}

function missesFor(
	sentence: string,
	data: ReviewData,
): { tokens: string[]; misses: SpellingMiss[] } {
	const tokens = tokenizeText(sentence);
	const misses: SpellingMiss[] = [];
	tokens.forEach((token, tokenIndex) => {
		const lower = token.toLowerCase();
		if (data.pronunciationWords.has(lower)) return;
		misses.push({ tokenIndex, candidates: candidatesFor(lower, data) });
	});
	return { tokens, misses };
}

async function mapLimited<T, R>(items: T[], limit: number, run: (item: T) => Promise<R>) {
	const results: R[] = new Array(items.length);
	let next = 0;
	await Promise.all(
		Array.from({ length: limit }, async () => {
			while (next < items.length) {
				const index = next++;
				results[index] = await run(items[index] as T);
			}
		}),
	);
	return results;
}

async function main() {
	const data = await loadReviewData();

	if (process.argv.includes("--dry-run")) {
		const { misses } = missesFor("I wnat a bg cake.", data);
		const plan = planSpellingContext({ text: "I wnat a bg cake.", misses });
		console.log(
			JSON.stringify({ state: { sentence: plan?.excerpt }, questions: plan?.questions }, null, 2),
		);
		return;
	}

	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) {
		console.error("Set OPENROUTER_API_KEY (apps/phonaria/.env.local) or use --dry-run.");
		process.exit(1);
	}

	const timings: number[] = [];
	const jev = createOpenRouterJev({ apiKey, timeoutMs: SPELLING_CONTEXT_TIMEOUT_MS });
	const timedJev: AskJev = async (request) => {
		const started = performance.now();
		try {
			return await jev(request);
		} finally {
			timings.push(performance.now() - started);
		}
	};

	const tally = {
		rule: { right: 0, wrong: 0, missed: 0 },
		context: { right: 0, wrong: 0, missed: 0 },
	};
	let fellBack = 0;

	const rows = await mapLimited(CASES, 8, async (entry) => {
		const { tokens, misses } = missesFor(entry.sentence, data);
		const base = { originalText: entry.sentence, tokens, misses, frequency: data.frequency };
		const rule = suggestSpelling(base)?.suggestedText ?? null;

		const request = misses.filter((miss) => miss.candidates.length > 0);
		let contextPicks = new Map<number, string | null>();
		let failure: string | null = null;
		if (request.length > 0) {
			try {
				const output = await chooseSpellingInContext(
					{ text: entry.sentence, misses: request },
					{ askJev: timedJev },
				);
				contextPicks = spellingContextPicksByToken(output);
			} catch (error) {
				failure = error instanceof Error ? error.message : "failed";
				fellBack += 1;
			}
		}
		const context = suggestSpelling({ ...base, contextPicks })?.suggestedText ?? null;
		return { entry, rule, context, failure };
	});

	const show = (value: string | null) => value ?? "_(silent)_";
	console.log("| sentence | want | rule | context |");
	console.log("| --- | --- | --- | --- |");
	for (const { entry, rule, context, failure } of rows) {
		const ruleVerdict = verdictFor(entry.want, rule);
		const contextVerdict = verdictFor(entry.want, context);
		tally.rule[ruleVerdict] += 1;
		tally.context[contextVerdict] += 1;
		const mark = (verdict: Verdict) => (verdict === "right" ? "" : ` **${verdict}**`);
		const note = failure ? ` (fell back: ${failure})` : "";
		console.log(
			`| ${entry.sentence} | ${show(entry.want)} | ${show(rule)}${mark(ruleVerdict)} | ${show(context)}${mark(contextVerdict)}${note} |`,
		);
	}

	timings.sort((left, right) => left - right);
	const percentile = (p: number) =>
		Math.round(timings[Math.min(timings.length - 1, Math.floor(p * timings.length))] ?? 0);
	console.log(`\nrule:    ${JSON.stringify(tally.rule)}`);
	console.log(`context: ${JSON.stringify(tally.context)}`);
	console.log(
		`calls: ${timings.length}, fell back to the rule: ${fellBack}, p50 ${percentile(0.5)} ms, p90 ${percentile(0.9)} ms (timeout ${SPELLING_CONTEXT_TIMEOUT_MS} ms)`,
	);
}

await main();
