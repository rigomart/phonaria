/**
 * One spoken attempt at a prompt: send the recording to the scoring route,
 * check in the browser that it holds the word, judge the contrast sound, and
 * say what happened in plain words.
 */
import { getIpaForPhonemeId, toBasePhonemeIds } from "@phonaria/phonetics-data";
import type { CuratedWordData } from "@phonaria/phonetics-data/data/en/curated-1k";
import {
	gateWord,
	judgeWord,
	type PronunciationLookup,
	type RecordingEvidence,
	type Transcript,
	type UnclearReason,
	type WavAudio,
	type WordJudgement,
} from "@phonaria/pronunciation";
import type { WavRecorderState } from "@/lib/recording/wav-recorder";
import { createRetryableLoader } from "@/lib/retryable-loader";
import { CatalogWordPronunciations } from "@/lib/speech/catalog-pronunciations";
import type { ContrastSound, MinimalPairPrompt } from "./minimal-pair-prompt";

const SPEECH_SCORE_PATH = "/api/speech/score";

export type SpeakingOutcome =
	| { verdict: "match" }
	| {
			verdict: "swapped";
			heard: ContrastSound;
			/** The pair word the heard sound makes, or null when the heard sound isn't the pair partner. */
			heardWord: string | null;
	  }
	| { verdict: "unclear"; reason: UnclearReason }
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

export type AttemptResult =
	| { type: "outcome"; outcome: SpeakingOutcome }
	| { type: "failure"; failure: SpeakingFailure };

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

/** The verdict on the target sound only; any other judged sound is ignored. */
function outcomeFromJudgement(
	prompt: MinimalPairPrompt,
	judgement: WordJudgement | null,
): SpeakingOutcome {
	const judged = judgement?.sounds.find((sound) => sound.position === prompt.position);
	if (!judged || judged.phonemeId !== prompt.target.id) {
		return { verdict: "unclear", reason: "no-evidence" };
	}

	const { verdict } = judged;
	if (verdict.type === "match") return { verdict: "match" };
	if (verdict.type === "unclear") return { verdict: "unclear", reason: verdict.reason };
	return {
		verdict: "swapped",
		heard: { id: verdict.heard, ipa: getIpaForPhonemeId(verdict.heard) },
		heardWord: verdict.heard === prompt.partner.id ? prompt.partnerWord : null,
	};
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

/**
 * Pronounces transcript words for the word gate. Catalog words are at hand; the
 * curated dictionary is loaded only for a one-word transcript outside the catalog,
 * the one case where a homophone such as "by" for *buy* changes the outcome.
 */
async function pronunciationLookup(
	transcript: Transcript | null | undefined,
	loadDictionary: LoadDictionary,
): Promise<PronunciationLookup> {
	const fromCatalog: PronunciationLookup = (word) => CatalogWordPronunciations.get(word);
	const words = transcript?.words ?? [];
	if (words.length !== 1 || CatalogWordPronunciations.has(words[0])) return fromCatalog;
	try {
		const dictionary = await loadDictionary();
		return (word) =>
			fromCatalog(word) ?? dictionary.words[word]?.map((variant) => toBasePhonemeIds(variant));
	} catch {
		return fromCatalog;
	}
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
	if (!wordEvidence) return { type: "outcome", outcome: outcomeFromJudgement(prompt, null) };

	const judged = {
		judgedPhonemeIds: new Set([prompt.target.id, prompt.partner.id]),
		targetAccent: "en-us",
	} as const;
	const gate = gateWord({
		target: {
			text: prompt.word,
			acceptedPronunciations: CatalogWordPronunciations.get(prompt.word) ?? [],
		},
		evidence: wordEvidence,
		transcript: evidence.transcript,
		pronunciationsOf: await pronunciationLookup(evidence.transcript, loadDictionary),
		...judged,
	});
	if (gate.type === "not-heard") return { type: "outcome", outcome: { verdict: "not-heard" } };
	if (gate.type === "different-word") {
		return { type: "outcome", outcome: { verdict: "different-word", heard: gate.heard } };
	}

	const judgement = judgeWord({ evidence: wordEvidence, ...judged });
	return { type: "outcome", outcome: outcomeFromJudgement(prompt, judgement) };
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
