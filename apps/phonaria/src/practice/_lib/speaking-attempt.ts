/**
 * One spoken attempt at a prompt: send the recording to the scoring route,
 * check in the browser that it holds the word, judge every sound, and say what
 * happened in plain words, leading with the contrast sound.
 */
import { toBasePhonemeIds } from "@phonaria/phonetics-data";
import {
	type CuratedWordData,
	EnglishCuratedTop1k,
} from "@phonaria/phonetics-data/data/en/curated-1k";
import {
	createWordFinder,
	gateWord,
	judgeWord,
	type PronunciationLookup,
	type RecordingEvidence,
	type SoundJudgement,
	type Transcript,
	type UnclearReason,
	type WavAudio,
	type WordFinder,
	type WordJudgement,
} from "@phonaria/pronunciation";
import type { WavRecorderState } from "@/lib/recording/wav-recorder";
import { createRetryableLoader } from "@/lib/retryable-loader";
import { CatalogWordPronunciations } from "@/lib/speech/catalog-pronunciations";
import type { EvidenceLogPayload } from "@/lib/speech/evidence-log";
import { type ContrastSound, contrastSound, type MinimalPairPrompt } from "./minimal-pair-prompt";

const SPEECH_SCORE_PATH = "/api/speech/score";

export type SoundResult = {
	position: number;
	sound: ContrastSound;
	verdict:
		| { type: "match" }
		| {
				type: "swapped";
				heard: ContrastSound;
				/** The word the heard sound makes here, or null when Phonaria knows none. */
				heardWord: string | null;
		  }
		| { type: "unclear"; reason: UnclearReason };
};

/** The verdict on the contrast sound, which the result leads with. */
export type ContrastOutcome =
	| { verdict: "match" }
	| { verdict: "swapped"; heard: ContrastSound; heardWord: string | null }
	| { verdict: "unclear"; reason: UnclearReason };

export type SpeakingOutcome =
	/** `sounds` holds every judged sound in word order, the contrast sound included; empty when none was. */
	| (ContrastOutcome & { sounds: readonly SoundResult[] })
	/**
	 * The recording isn't the word, so no sound is judged. `heard` is what was said
	 * instead, one word or several, or empty when there's nothing to name.
	 */
	| { verdict: "different-word"; heard: readonly string[] }
	/** No speech at all. */
	| { verdict: "not-heard" };

export type SpeakingFailure =
	| "denied"
	| "unsupported"
	| "rate_limited"
	| "unavailable"
	| "scoring_failed";

/**
 * What the opt-in evidence log needs from an attempt: the evidence, gate and
 * judgement this attempt was shown from. Null when the scorer returned no word.
 */
export type AttemptLog = Pick<EvidenceLogPayload, "evidence" | "verdicts">;

export type AttemptResult =
	| { type: "outcome"; outcome: SpeakingOutcome; log: AttemptLog | null }
	| { type: "failure"; failure: SpeakingFailure };

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

function isContrastSound(prompt: MinimalPairPrompt, judged: SoundJudgement): boolean {
	return judged.position === prompt.position && judged.phonemeId === prompt.target.id;
}

function soundResult({ position, phonemeId, verdict }: SoundJudgement): SoundResult {
	const result = { position, sound: contrastSound(phonemeId) };
	if (verdict.type !== "swapped") return { ...result, verdict };
	const heard = contrastSound(verdict.heard);
	return { ...result, verdict: { type: "swapped", heard, heardWord: verdict.heardWord ?? null } };
}

export function outcomeFromJudgement(
	prompt: MinimalPairPrompt,
	judgement: WordJudgement | null,
): SpeakingOutcome {
	const judged = judgement?.sounds ?? [];
	const sounds = judged.map(soundResult);
	const contrast = judged.find((sound) => isContrastSound(prompt, sound));
	if (!contrast) return { verdict: "unclear", reason: "no-evidence", sounds };

	const { verdict } = soundResult(contrast);
	if (verdict.type === "match") return { verdict: "match", sounds };
	if (verdict.type === "unclear") return { verdict: "unclear", reason: verdict.reason, sounds };
	return { verdict: "swapped", heard: verdict.heard, heardWord: verdict.heardWord, sounds };
}

function failureFromStatus(status: number): SpeakingFailure {
	if (status === 429) return "rate_limited";
	if (status === 503) return "unavailable";
	return "scoring_failed";
}

/** Recorder states that end an attempt before anything is sent. */
function recorderFailure(state: WavRecorderState): SpeakingFailure | null {
	if (state.status === "denied") return "denied";
	if (state.status === "unsupported") return "unsupported";
	return null;
}

function isRecordingEvidence(value: unknown): value is RecordingEvidence {
	return (
		typeof value === "object" &&
		value !== null &&
		Array.isArray((value as { words?: unknown }).words)
	);
}

/** Loads the curated top-10k dictionary's words, a lazy chunk. */
export type LoadDictionary = () => Promise<Pick<CuratedWordData, "words">>;

const loadCuratedDictionary: LoadDictionary = createRetryableLoader(() =>
	import("@phonaria/phonetics-data/data/en/curated-10k").then(
		(module) => module.EnglishCuratedTop10k,
	),
);

type Dictionary = Pick<CuratedWordData, "words">;

async function homophoneDictionary(
	transcript: Transcript | null | undefined,
	loadDictionary: LoadDictionary,
): Promise<Dictionary | undefined> {
	const words = transcript?.words ?? [];
	if (words.length !== 1 || CatalogWordPronunciations.has(words[0])) return undefined;
	return loadDictionary().catch(() => undefined);
}

function pronunciationLookup(dictionary: Dictionary | undefined): PronunciationLookup {
	return (word) =>
		CatalogWordPronunciations.get(word) ??
		dictionary?.words[word]?.map((variant) => toBasePhonemeIds(variant));
}

const dictionaryFinders = new WeakMap<Dictionary, WordFinder>();

function dictionaryFinder(dictionary: Dictionary): WordFinder {
	let finder = dictionaryFinders.get(dictionary);
	if (!finder) {
		finder = createWordFinder(
			Object.entries(dictionary.words).map(
				([word, variants]) => [word, variants.map((variant) => toBasePhonemeIds(variant))] as const,
			),
		);
		dictionaryFinders.set(dictionary, finder);
	}
	return finder;
}

let catalogFinder: WordFinder | undefined;

/**
 * Names the word a pronunciation spells, for a swapped sound, from the data the
 * page already holds. The first source that knows the pronunciation wins, so a
 * homophone resolves to the word the learner is practising against: the pair
 * partner, then catalog words, the bundled top-1k list, and the curated
 * dictionary when this attempt loaded it.
 */
export function wordFinder(prompt: MinimalPairPrompt, dictionary?: Dictionary): WordFinder {
	catalogFinder ??= createWordFinder(CatalogWordPronunciations);
	const finders = [
		createWordFinder([
			[prompt.partnerWord, CatalogWordPronunciations.get(prompt.partnerWord) ?? []],
		]),
		catalogFinder,
		dictionaryFinder(EnglishCuratedTop1k),
	];
	if (dictionary) finders.push(dictionaryFinder(dictionary));
	return (phonemeIds) => {
		for (const find of finders) {
			const word = find(phonemeIds);
			if (word) return word;
		}
		return undefined;
	};
}

export async function scoreAttempt(
	prompt: MinimalPairPrompt,
	audio: WavAudio,
	fetch: FetchLike,
	loadDictionary: LoadDictionary = loadCuratedDictionary,
): Promise<AttemptResult> {
	const query = new URLSearchParams({ word: prompt.word, targetAccent: "en-us" });

	let evidence: unknown;
	try {
		const response = await fetch(`${SPEECH_SCORE_PATH}?${query}`, {
			method: "POST",
			headers: { "Content-Type": "audio/wav" },
			body: audio,
		});
		if (!response.ok) return { type: "failure", failure: failureFromStatus(response.status) };
		evidence = await response.json();
	} catch {
		return { type: "failure", failure: "scoring_failed" };
	}
	if (!isRecordingEvidence(evidence)) return { type: "failure", failure: "scoring_failed" };

	const [wordEvidence] = evidence.words;
	if (!wordEvidence) {
		return { type: "outcome", outcome: outcomeFromJudgement(prompt, null), log: null };
	}

	const dictionary = await homophoneDictionary(evidence.transcript, loadDictionary);
	const gate = gateWord({
		target: {
			text: prompt.word,
			acceptedPronunciations: CatalogWordPronunciations.get(prompt.word) ?? [],
		},
		evidence: wordEvidence,
		transcript: evidence.transcript,
		targetAccent: "en-us",
		pronunciationsOf: pronunciationLookup(dictionary),
	});
	const unjudged: AttemptLog = { evidence, verdicts: { gate, judgement: null } };
	if (gate.type === "not-heard") {
		return { type: "outcome", outcome: { verdict: "not-heard" }, log: unjudged };
	}
	if (gate.type === "different-word") {
		return {
			type: "outcome",
			outcome: { verdict: "different-word", heard: gate.heard },
			log: unjudged,
		};
	}

	const judgement = judgeWord({
		evidence: wordEvidence,
		targetAccent: "en-us",
		findWord: wordFinder(prompt, dictionary),
	});
	return {
		type: "outcome",
		outcome: outcomeFromJudgement(prompt, judgement),
		log: { evidence, verdicts: { gate, judgement } },
	};
}

/** Scoring progress for the current word. Recording progress lives in the recorder. */
export type AttemptState =
	| { status: "ready" }
	| { status: "scoring"; id: number }
	| { status: "scored"; result: AttemptResult };

export type AttemptEvent =
	| { type: "submitted"; id: number }
	| { type: "scored"; id: number; result: AttemptResult }
	| { type: "reset" };

export const READY: AttemptState = { status: "ready" };

/** A result for an attempt that was reset or replaced is dropped. */
export function attemptReducer(state: AttemptState, event: AttemptEvent): AttemptState {
	switch (event.type) {
		case "submitted":
			return { status: "scoring", id: event.id };
		case "scored":
			return state.status === "scoring" && state.id === event.id
				? { status: "scored", result: event.result }
				: state;
		case "reset":
			return READY;
	}
}

export type SpeakingView =
	| { phase: "ready" }
	| { phase: "requesting-permission" }
	| { phase: "recording" }
	| { phase: "scoring" }
	| { phase: "outcome"; outcome: SpeakingOutcome }
	| { phase: "failure"; failure: SpeakingFailure };

export function deriveSpeakingView(
	recorder: WavRecorderState,
	attempt: AttemptState,
): SpeakingView {
	const failure = recorderFailure(recorder);
	if (failure) return { phase: "failure", failure };
	if (recorder.status === "requesting-permission") return { phase: "requesting-permission" };
	if (recorder.status === "recording") return { phase: "recording" };
	if (attempt.status === "scoring" || recorder.status === "done") return { phase: "scoring" };
	if (attempt.status === "scored") {
		const { result } = attempt;
		return result.type === "outcome"
			? { phase: "outcome", outcome: result.outcome }
			: { phase: "failure", failure: result.failure };
	}
	return { phase: "ready" };
}
