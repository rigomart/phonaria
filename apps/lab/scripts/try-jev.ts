#!/usr/bin/env bun
/**
 * Experiment: can Jev (TypeSafe's typed-decision model) make two Transcription calls that
 * today are made without looking at the sentence?
 *
 * 1. Spelling: which dictionary neighbour did a missed token mean, if any? The current rule
 *    in `spelling-suggestion.ts` sees the token and word frequency only.
 * 2. Heteronyms: which CMUDict pronunciation fits the sentence? The app shows variant 0,
 *    which is dictionary order, so `I will read it` shows /ɹˈɛd/.
 *
 * Usage (either key works; OpenRouter serves the same /v1/systemone shape):
 *   OPENROUTER_API_KEY=... bun --cwd apps/lab ./scripts/try-jev.ts
 *   TYPESAFE_API_KEY=...   bun --cwd apps/lab ./scripts/try-jev.ts
 *   bun --cwd apps/lab ./scripts/try-jev.ts --dry-run   # print one request of each kind
 *
 * API reference: https://docs.typesafe.ai/api
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getIpaForPhonemeId } from "@phonaria/phonetics-data";
import { suggestSpelling } from "../src/lib/transcription/spelling-suggestion";
import { candidatesFor, loadReviewData } from "./review-spelling-cases";

/** Below this, a Jev pick is treated as silence, the same way the rule stays silent. */
const OFFER_CONFIDENCE = 0.7;
const NONE = "none";

const CMUDICT_PATH = resolve(
	import.meta.dirname,
	"../../../packages/phonetics-data/data/en/dict/cmudict.json",
);

type Endpoint = { url: string; key: string; model: string; label: string };

function resolveEndpoint(): Endpoint | null {
	if (process.env.TYPESAFE_API_KEY) {
		return {
			url: "https://api.typesafe.ai/v1/systemone",
			key: process.env.TYPESAFE_API_KEY,
			model: "jev-latest",
			label: "TypeSafe",
		};
	}
	if (process.env.OPENROUTER_API_KEY) {
		return {
			url: "https://openrouter.ai/api/v1/systemone",
			key: process.env.OPENROUTER_API_KEY,
			model: "jev-latest",
			label: "OpenRouter",
		};
	}
	return null;
}

type ChoiceAnswer = {
	type: "choice";
	choice: string;
	probabilities: Record<string, number>;
	confidence: number;
};

type ChoiceRequest = {
	state: unknown;
	instructions: string;
	criteria: Record<string, string>;
};

type Usage = { calls: number; inputTokens: number; ms: number };
const usage: Usage = { calls: 0, inputTokens: 0, ms: 0 };

function buildBody(model: string, request: ChoiceRequest) {
	return {
		model,
		state: request.state,
		questions: {
			pick: { type: "choice", instructions: request.instructions, criteria: request.criteria },
		},
	};
}

async function askChoice(endpoint: Endpoint, request: ChoiceRequest): Promise<ChoiceAnswer> {
	const body = JSON.stringify(buildBody(endpoint.model, request));
	for (let attempt = 0; ; attempt += 1) {
		const started = performance.now();
		const response = await fetch(endpoint.url, {
			method: "POST",
			headers: { Authorization: `Bearer ${endpoint.key}`, "Content-Type": "application/json" },
			body,
		});
		const elapsed = performance.now() - started;

		if ((response.status === 429 || response.status === 529) && attempt < 4) {
			await Bun.sleep(500 * 2 ** attempt);
			continue;
		}
		if (!response.ok) {
			throw new Error(`Jev ${response.status}: ${(await response.text()).slice(0, 300)}`);
		}

		const json = (await response.json()) as {
			answers: { pick: ChoiceAnswer };
			usage?: { input_tokens?: number };
		};
		usage.calls += 1;
		usage.inputTokens += json.usage?.input_tokens ?? 0;
		usage.ms += elapsed;
		return json.answers.pick;
	}
}

// ---------------------------------------------------------------------------
// 1. Spelling suggestions with sentence context

type SpellingCase = {
	token: string;
	sentence: string;
	/** The useful correction in this sentence, or null when silence is right. */
	want: string | null;
};

/**
 * The reviewed tokens from `review-spelling-cases.ts`, each placed in a sentence. `cn` and
 * `bg` are labeled silent there because they are ambiguous alone; the sentence settles them.
 */
const SPELLING_CASES: SpellingCase[] = [
	{ token: "recieve", sentence: "Did you recieve my email?", want: "receive" },
	{ token: "teh", sentence: "Put it on teh table.", want: "the" },
	{ token: "receve", sentence: "You will receve a gift.", want: "receive" },
	{ token: "recceive", sentence: "I hope to recceive an answer soon.", want: "receive" },
	{ token: "seperate", sentence: "Keep the eggs in a seperate bowl.", want: "separate" },
	{ token: "occured", sentence: "The accident occured last night.", want: "occurred" },
	{ token: "becuase", sentence: "I stayed home becuase it rained.", want: "because" },
	{ token: "adress", sentence: "What is your home adress?", want: "address" },
	{ token: "wnat", sentence: "I wnat to learn English.", want: "want" },
	{ token: "thnik", sentence: "I thnik she is right.", want: "think" },
	{ token: "alwasy", sentence: "He alwasy arrives late.", want: "always" },
	{ token: "becomming", sentence: "She is becomming a doctor.", want: "becoming" },

	{ token: "reciv", sentence: "I will reciv it tomorrow.", want: null },
	{ token: "langwidge", sentence: "English is a hard langwidge.", want: null },
	{ token: "definatly", sentence: "I will definatly come.", want: null },

	{ token: "frm", sentence: "A letter frm my mom.", want: "from" },
	{ token: "bg", sentence: "That is a bg problem.", want: "big" },
	{ token: "cn", sentence: "I cn swim very well.", want: "can" },
	{ token: "wrk", sentence: "I go to wrk by bus.", want: "work" },

	{ token: "sanjeev", sentence: "My friend sanjeev lives in Pune.", want: null },
	{ token: "kowalevski", sentence: "Professor kowalevski teaches math.", want: null },
	{ token: "rigomart", sentence: "Follow rigomart on GitHub.", want: null },

	{ token: "zxqvwoplmj", sentence: "The code is zxqvwoplmj.", want: null },
	{ token: "blorptastic", sentence: "The movie was blorptastic.", want: null },
	{ token: "flumoxinate", sentence: "Do not flumoxinate the kids.", want: null },

	{ token: "dont", sentence: "I dont know the answer.", want: "don't" },
	{ token: "isnt", sentence: "It isnt fair.", want: "isn't" },
	{ token: "doesnt", sentence: "She doesnt care.", want: "doesn't" },
	{ token: "wouldnt", sentence: "I wouldnt go there.", want: "wouldn't" },

	{ token: "aardvrk", sentence: "An aardvrk eats ants.", want: "aardvark" },
	{ token: "zucchinni", sentence: "I grilled some zucchinni.", want: "zucchini" },
	{ token: "rhinocerus", sentence: "The rhinocerus has a horn.", want: "rhinoceros" },
	{ token: "asparagas", sentence: "Cook the asparagas for five minutes.", want: "asparagus" },
	{ token: "wierdness", sentence: "I love the wierdness of it.", want: "weirdness" },
];

function spellingRequest(entry: SpellingCase, candidates: string[]): ChoiceRequest {
	const criteria: Record<string, string> = {};
	for (const candidate of candidates) criteria[candidate] = `They meant the word "${candidate}".`;
	criteria[NONE] =
		"None of these: the typed word is a name, a made-up or foreign word, or none of the options fits the sentence.";
	return {
		state: { sentence: entry.sentence, typed_word: entry.token },
		instructions:
			"An English learner typed this sentence. The pronunciation dictionary does not know typed_word. Which word did they most likely mean? Only pick a word if it fits the sentence.",
		criteria,
	};
}

type Verdict = "right" | "wrong" | "missed";

function verdictFor(want: string | null, got: string | null): Verdict {
	if (got === want) return "right";
	return got === null ? "missed" : "wrong";
}

async function runSpelling(endpoint: Endpoint) {
	const data = await loadReviewData();
	const tally = { rule: { right: 0, wrong: 0, missed: 0 }, jev: { right: 0, wrong: 0, missed: 0 } };

	console.log("\n## Spelling suggestions\n");
	console.log("| token | sentence | want | rule | jev (confidence) |");
	console.log("| --- | --- | --- | --- | --- |");

	const results = await Promise.all(
		SPELLING_CASES.map(async (entry) => {
			const candidates = candidatesFor(entry.token, data);
			const rule =
				suggestSpelling({
					originalText: entry.token,
					tokens: [entry.token],
					misses: [{ tokenIndex: 0, candidates }],
					frequency: data.frequency,
				})?.suggestedText ?? null;
			if (candidates.length === 0) return { entry, candidates, rule, jev: null, answer: null };

			const answer = await askChoice(endpoint, spellingRequest(entry, candidates));
			const offered = answer.choice !== NONE && answer.confidence >= OFFER_CONFIDENCE;
			return { entry, candidates, rule, jev: offered ? answer.choice : null, answer };
		}),
	);

	const show = (value: string | null) => value ?? "_(silent)_";
	for (const { entry, candidates, rule, jev, answer } of results) {
		const ruleVerdict = verdictFor(entry.want, rule);
		const jevVerdict = verdictFor(entry.want, jev);
		tally.rule[ruleVerdict] += 1;
		tally.jev[jevVerdict] += 1;
		const jevCell =
			answer === null
				? "_(no candidates)_"
				: `${show(jev)}${answer.choice !== jev ? ` [${answer.choice}]` : ""} (${answer.confidence.toFixed(2)})`;
		const mark = (verdict: Verdict) => (verdict === "right" ? "" : ` **${verdict}**`);
		console.log(
			`| \`${entry.token}\` | ${entry.sentence} | ${show(entry.want)} | ${show(rule)}${mark(ruleVerdict)} | ${jevCell}${mark(jevVerdict)} |`,
		);
		if (process.argv.includes("--verbose") && candidates.length > 0) {
			console.log(`|  | candidates: ${candidates.join(", ")} |  |  |  |`);
		}
	}

	console.log(`\nrule: ${JSON.stringify(tally.rule)}`);
	console.log(`jev:  ${JSON.stringify(tally.jev)}  (offer threshold ${OFFER_CONFIDENCE})`);
}

// ---------------------------------------------------------------------------
// 2. Heteronym pronunciation from sentence context

type HeteronymCase = { word: string; sentence: string; want: string };

const HETERONYM_CASES: HeteronymCase[] = [
	{ word: "read", sentence: "I will read it tomorrow.", want: "ɹˈid" },
	{ word: "read", sentence: "I read it yesterday.", want: "ɹˈɛd" },
	{ word: "live", sentence: "I live in Lima.", want: "lˈɪv" },
	{ word: "live", sentence: "We watched a live show.", want: "lˈaɪv" },
	{ word: "lead", sentence: "You lead the team.", want: "lˈid" },
	{ word: "lead", sentence: "Old pipes were made of lead.", want: "lˈɛd" },
	{ word: "record", sentence: "She broke the world record.", want: "ɹˈɛkɝd" },
	{ word: "record", sentence: "Please record the meeting.", want: "ɹɪkˈɔɹd" },
	{ word: "close", sentence: "Please close the door.", want: "klˈoʊz" },
	{ word: "close", sentence: "The store is close to my house.", want: "klˈoʊs" },
	{ word: "wind", sentence: "The wind is very strong today.", want: "wˈɪnd" },
	{ word: "wind", sentence: "Wind the clock before bed.", want: "wˈaɪnd" },
	{ word: "tear", sentence: "A tear ran down her face.", want: "tˈɪɹ" },
	{ word: "tear", sentence: "Do not tear the paper.", want: "tˈɛɹ" },
	{ word: "object", sentence: "What is that strange object?", want: "ˈɑbdʒɛkt" },
	{ word: "object", sentence: "I object to this plan.", want: "əbdʒˈɛkt" },
	{ word: "use", sentence: "What is the use of this?", want: "jˈus" },
	{ word: "use", sentence: "I use my phone every day.", want: "jˈuz" },
	{ word: "minute", sentence: "Wait a minute, please.", want: "mˈɪnət" },
	{ word: "minute", sentence: "The change was minute, almost invisible.", want: "maɪnˈut" },
	{ word: "bass", sentence: "He plays bass in a band.", want: "bˈeɪs" },
	{ word: "bass", sentence: "We caught a bass in the lake.", want: "bˈæs" },
];

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

function heteronymRequest(entry: HeteronymCase, variants: string[]): ChoiceRequest {
	const criteria: Record<string, string> = {};
	for (const variant of variants)
		criteria[variant] = `Pronounced /${variant}/ (IPA, General American).`;
	return {
		state: { sentence: entry.sentence, word: entry.word },
		instructions:
			"How is the word pronounced in this sentence, in General American English? Use the meaning and grammar of the sentence.",
		criteria,
	};
}

async function runHeteronyms(endpoint: Endpoint) {
	const cmudict = JSON.parse(readFileSync(CMUDICT_PATH, "utf8")) as {
		data: Record<string, string[]>;
	};
	const tally = { default: 0, jev: 0 };

	console.log("\n## Heteronyms\n");
	console.log("| sentence | want | app default | jev (confidence) |");
	console.log("| --- | --- | --- | --- |");

	const results = await Promise.all(
		HETERONYM_CASES.map(async (entry) => {
			const variants = (cmudict.data[entry.word.toUpperCase()] ?? []).map(toIpa);
			const answer = await askChoice(endpoint, heteronymRequest(entry, variants));
			return { entry, variants, answer };
		}),
	);

	for (const { entry, variants, answer } of results) {
		const fallback = variants[0] ?? "?";
		if (fallback === entry.want) tally.default += 1;
		if (answer.choice === entry.want) tally.jev += 1;
		const mark = (value: string) => (value === entry.want ? "" : " **wrong**");
		console.log(
			`| ${entry.sentence} | /${entry.want}/ | /${fallback}/${mark(fallback)} | /${answer.choice}/ (${answer.confidence.toFixed(2)})${mark(answer.choice)} |`,
		);
	}

	const total = HETERONYM_CASES.length;
	console.log(`\napp default: ${tally.default}/${total} right`);
	console.log(`jev:         ${tally.jev}/${total} right`);
}

// ---------------------------------------------------------------------------

if (import.meta.main) {
	const endpoint = resolveEndpoint();
	const dryRun = process.argv.includes("--dry-run") || endpoint === null;

	if (dryRun) {
		if (endpoint === null) console.log("No TYPESAFE_API_KEY or OPENROUTER_API_KEY; dry run.\n");
		const data = await loadReviewData();
		const spelling = SPELLING_CASES.find((entry) => entry.token === "wnat");
		if (spelling) {
			const request = spellingRequest(spelling, candidatesFor(spelling.token, data));
			console.log(JSON.stringify(buildBody("jev-latest", request), null, 2));
		}
		const cmudict = JSON.parse(readFileSync(CMUDICT_PATH, "utf8")) as {
			data: Record<string, string[]>;
		};
		const heteronym = HETERONYM_CASES[0];
		if (heteronym) {
			const variants = (cmudict.data[heteronym.word.toUpperCase()] ?? []).map(toIpa);
			console.log(
				JSON.stringify(buildBody("jev-latest", heteronymRequest(heteronym, variants)), null, 2),
			);
		}
		process.exit(0);
	}

	console.log(`Jev via ${endpoint.label}`);
	await runSpelling(endpoint);
	await runHeteronyms(endpoint);
	const averageMs = usage.calls === 0 ? 0 : usage.ms / usage.calls;
	console.log(
		`\n${usage.calls} calls, ${usage.inputTokens} input tokens, ${averageMs.toFixed(0)} ms average round trip`,
	);
}
