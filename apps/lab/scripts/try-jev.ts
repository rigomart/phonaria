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
	{ word: "lead", sentence: "She took the lead in the race.", want: "lˈid" },
	{ word: "record", sentence: "She broke the world record.", want: "ɹˈɛkɝd" },
	{ word: "record", sentence: "Please record the meeting.", want: "ɹɪkˈɔɹd" },
	{ word: "close", sentence: "Please close the door.", want: "klˈoʊz" },
	{ word: "close", sentence: "The store is close to my house.", want: "klˈoʊs" },
	{ word: "wind", sentence: "The wind is very strong today.", want: "wˈɪnd" },
	{ word: "wind", sentence: "Wind the clock before bed.", want: "wˈaɪnd" },
	{ word: "tear", sentence: "A tear ran down her face.", want: "tˈɪɹ" },
	{ word: "tear", sentence: "Do not tear the paper.", want: "tˈɛɹ" },
	{ word: "tear", sentence: "There is a tear in my shirt.", want: "tˈɛɹ" },
	{ word: "object", sentence: "What is that strange object?", want: "ˈɑbdʒɛkt" },
	{ word: "object", sentence: "I object to this plan.", want: "əbdʒˈɛkt" },
	{ word: "use", sentence: "What is the use of this?", want: "jˈus" },
	{ word: "use", sentence: "I use my phone every day.", want: "jˈuz" },
	{ word: "minute", sentence: "Wait a minute, please.", want: "mˈɪnət" },
	{ word: "minute", sentence: "The change was minute, almost invisible.", want: "maɪnˈut" },
	{ word: "bass", sentence: "He plays bass in a band.", want: "bˈeɪs" },
	{ word: "bass", sentence: "We caught a bass in the lake.", want: "bˈæs" },
];

/** One reading of a word: the CMUDict variants that share it, tagged offline. */
type Sense = { variants: string[]; pos: string; gloss: string };

/**
 * Hand-tagged for this experiment. At scale these would come from a tagged source such as
 * Wiktionary's pronunciation sections, which are grouped by etymology and part of speech.
 * Variants that share a reading are grouped, so `record` has two verb pronunciations.
 */
const SENSES: Record<string, Sense[]> = {
	read: [
		{
			variants: ["ɹˈid"],
			pos: "verb, present or future",
			gloss: "to look at and understand written words, now or later",
		},
		{
			variants: ["ɹˈɛd"],
			pos: "verb, past tense or past participle",
			gloss: "read at some point in the past",
		},
	],
	live: [
		{ variants: ["lˈɪv"], pos: "verb", gloss: "to be alive, or to have your home somewhere" },
		{
			variants: ["lˈaɪv"],
			pos: "adjective or adverb",
			gloss: "happening in real time, not recorded; alive; carrying electricity",
		},
	],
	lead: [
		{
			variants: ["lˈid"],
			pos: "verb, or noun",
			gloss: "to guide or be in front; the first position, a clue, a dog's leash",
		},
		{ variants: ["lˈɛd"], pos: "noun", gloss: "the heavy grey metal; the graphite in a pencil" },
	],
	record: [
		{
			variants: ["ɹˈɛkɝd"],
			pos: "noun or adjective",
			gloss: "a stored account, a vinyl disc, or a best-ever result",
		},
		{
			variants: ["ɹəkˈɔɹd", "ɹɪkˈɔɹd"],
			pos: "verb",
			gloss: "to capture sound, video, or information",
		},
	],
	close: [
		{
			variants: ["klˈoʊz"],
			pos: "verb, or noun",
			gloss: "to shut or to end; the end of something",
		},
		{
			variants: ["klˈoʊs"],
			pos: "adjective or adverb",
			gloss: "near in distance or time; intimate",
		},
	],
	wind: [
		{ variants: ["wˈɪnd"], pos: "noun", gloss: "moving air; breath" },
		{
			variants: ["wˈaɪnd"],
			pos: "verb",
			gloss: "to turn, twist, or coil, as in winding a clock or a winding road",
		},
	],
	tear: [
		{ variants: ["tˈɪɹ"], pos: "noun", gloss: "a drop of water from the eye" },
		{
			variants: ["tˈɛɹ"],
			pos: "verb, or noun",
			gloss: "to rip or pull apart; a rip or hole in something",
		},
	],
	object: [
		{
			variants: ["ˈɑbdʒɛkt"],
			pos: "noun",
			gloss: "a thing you can see or touch; a goal; the object of a sentence",
		},
		{ variants: ["əbdʒˈɛkt"], pos: "verb", gloss: "to disagree with or protest against something" },
	],
	use: [
		{ variants: ["jˈus"], pos: "noun", gloss: "the act, purpose, or value of using something" },
		{ variants: ["jˈuz"], pos: "verb", gloss: "to employ something for a purpose" },
	],
	minute: [
		{
			variants: ["mˈɪnət"],
			pos: "noun",
			gloss: "sixty seconds; a short moment; notes of a meeting",
		},
		{
			variants: ["maɪnˈut", "maɪnjˈut"],
			pos: "adjective",
			gloss: "extremely small, or very detailed",
		},
	],
	bass: [
		{
			variants: ["bˈeɪs"],
			pos: "noun or adjective",
			gloss: "the lowest musical range, or the instrument that plays it",
		},
		{ variants: ["bˈæs"], pos: "noun", gloss: "a kind of fish" },
	],
};

/**
 * How each option is described to Jev. `ipa` is the first run; `pos` tests whether part of
 * speech alone is enough; `sense` adds a plain-language meaning.
 */
const HETERONYM_MODES = ["ipa", "pos", "sense"] as const;
type HeteronymMode = (typeof HETERONYM_MODES)[number];

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

function sensesFor(word: string, variants: string[]): Sense[] {
	const senses = SENSES[word];
	if (!senses) throw new Error(`No senses tagged for "${word}"`);
	const tagged = new Set(senses.flatMap((sense) => sense.variants));
	const untagged = variants.filter((variant) => !tagged.has(variant));
	if (untagged.length > 0) throw new Error(`Untagged ${word} variants: ${untagged.join(", ")}`);
	return senses;
}

/** Criteria keys are what Jev answers with; each maps back to the variants it stands for. */
function heteronymRequest(
	entry: HeteronymCase,
	variants: string[],
	mode: HeteronymMode,
): { request: ChoiceRequest; variantsByKey: Map<string, string[]> } {
	const criteria: Record<string, string> = {};
	const variantsByKey = new Map<string, string[]>();

	if (mode === "ipa") {
		for (const variant of variants) {
			criteria[variant] = `Pronounced /${variant}/ (IPA, General American).`;
			variantsByKey.set(variant, [variant]);
		}
	} else {
		sensesFor(entry.word, variants).forEach((sense, index) => {
			const key = `option_${index + 1}`;
			criteria[key] =
				mode === "pos"
					? `"${entry.word}" used as a ${sense.pos}.`
					: `"${entry.word}" used as a ${sense.pos}, meaning: ${sense.gloss}.`;
			variantsByKey.set(key, sense.variants);
		});
	}

	return {
		request: {
			state: { sentence: entry.sentence, word: entry.word },
			instructions:
				mode === "ipa"
					? "How is the word pronounced in this sentence, in General American English? Use the meaning and grammar of the sentence."
					: "How is the word used in this sentence? Use the meaning and grammar of the sentence.",
			criteria,
		},
		variantsByKey,
	};
}

async function runHeteronyms(endpoint: Endpoint) {
	const cmudict = JSON.parse(readFileSync(CMUDICT_PATH, "utf8")) as {
		data: Record<string, string[]>;
	};

	/** Right when the pick shares a reading with the wanted variant. */
	const isRight = (entry: HeteronymCase, picked: string[]) => {
		const variants = (cmudict.data[entry.word.toUpperCase()] ?? []).map(toIpa);
		const wanted = sensesFor(entry.word, variants).find((sense) =>
			sense.variants.includes(entry.want),
		);
		return picked.some((variant) => wanted?.variants.includes(variant));
	};

	const rows = await Promise.all(
		HETERONYM_CASES.map(async (entry) => {
			const variants = (cmudict.data[entry.word.toUpperCase()] ?? []).map(toIpa);
			const picks = await Promise.all(
				HETERONYM_MODES.map(async (mode) => {
					const { request, variantsByKey } = heteronymRequest(entry, variants, mode);
					const answer = await askChoice(endpoint, request);
					const picked = variantsByKey.get(answer.choice) ?? [];
					return { mode, picked, confidence: answer.confidence, right: isRight(entry, picked) };
				}),
			);
			const fallback = variants[0] ?? "?";
			return { entry, fallback, defaultRight: isRight(entry, [fallback]), picks };
		}),
	);

	console.log("\n## Heteronyms\n");
	console.log(`| sentence | want | app default | ${HETERONYM_MODES.join(" | ")} |`);
	console.log(`| --- | --- | --- | ${HETERONYM_MODES.map(() => "---").join(" | ")} |`);

	const mark = (right: boolean) => (right ? "" : " **wrong**");
	const tally: Record<string, { right: number; confident: number; confidentRight: number }> = {};
	for (const mode of ["default", ...HETERONYM_MODES]) {
		tally[mode] = { right: 0, confident: 0, confidentRight: 0 };
	}

	for (const { entry, fallback, defaultRight, picks } of rows) {
		if (defaultRight) (tally.default as { right: number }).right += 1;
		const cells = picks.map(({ mode, picked, confidence, right }) => {
			const counts = tally[mode];
			if (counts) {
				if (right) counts.right += 1;
				if (confidence >= OFFER_CONFIDENCE) {
					counts.confident += 1;
					if (right) counts.confidentRight += 1;
				}
			}
			return `/${picked[0] ?? "?"}/ (${confidence.toFixed(2)})${mark(right)}`;
		});
		console.log(
			`| ${entry.sentence} | /${entry.want}/ | /${fallback}/${mark(defaultRight)} | ${cells.join(" | ")} |`,
		);
	}

	const total = HETERONYM_CASES.length;
	console.log(`\napp default: ${tally.default?.right}/${total} right`);
	for (const mode of HETERONYM_MODES) {
		const counts = tally[mode];
		if (!counts) continue;
		console.log(
			`${mode.padEnd(11)}: ${counts.right}/${total} right; ${counts.confident} picks at confidence >= ${OFFER_CONFIDENCE}, ${counts.confidentRight} of them right`,
		);
	}
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
			for (const mode of HETERONYM_MODES) {
				const { request } = heteronymRequest(heteronym, variants, mode);
				console.log(JSON.stringify(buildBody("jev-latest", request), null, 2));
			}
		}
		process.exit(0);
	}

	// `--only spelling` or `--only heteronyms` runs one experiment.
	const onlyIndex = process.argv.indexOf("--only");
	const only = onlyIndex === -1 ? null : process.argv[onlyIndex + 1];
	console.log(`Jev via ${endpoint.label}`);
	if (only !== "heteronyms") await runSpelling(endpoint);
	if (only !== "spelling") await runHeteronyms(endpoint);
	const averageMs = usage.calls === 0 ? 0 : usage.ms / usage.calls;
	console.log(
		`\n${usage.calls} calls, ${usage.inputTokens} input tokens, ${averageMs.toFixed(0)} ms average round trip`,
	);
}
