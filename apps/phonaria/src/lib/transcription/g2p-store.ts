import { create } from "zustand";
import type { G2PWord } from "@/lib/g2p/model";
import { transformToTranscriptionResult } from "@/lib/g2p-client";
import {
	type BatchLookupResult,
	batchLookup,
	tokenizeText,
	type WordLookupResult,
} from "@/lib/phoneme-lookup";
import type { TranscriptionResult } from "@/lib/types/g2p";
import {
	buildSpellingContextRequest,
	type ChooseSpellingInContextFn,
	type SpellingContextInput,
	type SpellingContextOutput,
	spellingContextPicksByToken,
} from "./spelling-context";
import { loadSpellingFrequency } from "./spelling-frequency";
import { type SpellingFrequency, type SpellingMiss, suggestSpelling } from "./spelling-suggestion";

/**
 * Which stage of the lookup failed. Server-action errors are digest-opaque in
 * production, so the kind comes from the catch scope, never from the message.
 */
export type LookupErrorKind = "wordlist" | "service" | "unknown";

/**
 * The server adapter is injected instead of imported: the store is the
 * client-facing transcription seam and must stay independent of the TanStack
 * server function and the server-only database client.
 */
export type TranscribeWordsFn = (input: { words: string[] }) => Promise<G2PWord[]>;
export type LookupWordsFn = (words: string[]) => Promise<BatchLookupResult>;

export interface SpellingOptions {
	/** Defaults to the curated top-10k ranks. */
	frequency?: SpellingFrequency;
	/**
	 * Asks the Worker to pick candidates with the sentence in view. Injected like
	 * `transcribeWords`; absent when the feature flag is off, which keeps the rule alone.
	 */
	chooseInContext?: ChooseSpellingInContextFn;
}

interface G2PStore {
	currentResult: TranscriptionResult | null;
	selectedVariants: number[];
	/** Set when a lookup failed; cleared when one settles successfully. */
	lookupError: LookupErrorKind | null;
	/** Bumped on each settled failure so the alert re-mounts and re-announces. */
	lookupErrorNonce: number;
	/** The text Retry replays. Never set for input that tokenized to nothing. */
	lastText: string | null;
	/**
	 * True while a lookup is in flight. Shared here because `isPending` is
	 * per-hook-instance and Retry lives in a different instance than the form.
	 */
	isTranscribing: boolean;
	/** Current contents of the transcription box. Independent of last submitted text. */
	draftText: string;

	clearResult: () => void;
	setDraftText: (text: string) => void;
	setVariant: (wordIndex: number, variantIndex: number) => void;
	transcribe: (
		text: string,
		transcribeWords: TranscribeWordsFn,
		lookupWords?: LookupWordsFn,
		spelling?: SpellingOptions,
	) => Promise<void>;
	acceptSpellingSuggestion: (
		transcribeWords: TranscribeWordsFn,
		lookupWords?: LookupWordsFn,
		spelling?: SpellingOptions,
	) => Promise<void>;
}

function lookupResultToG2PWord(result: WordLookupResult): G2PWord {
	return {
		word: result.word,
		variants: result.variants,
		source: "cmudict",
	};
}

interface MergedWord {
	word: G2PWord;
	tokenIndex: number;
}

/**
 * Precedence per token: client tier hit → server word. The service answers every
 * requested word (falling back server-side when CMUdict misses), so a token with
 * neither is a contract violation: log it and drop it rather than invent a
 * transcription the learner would read as authoritative.
 */
function mergeWords(
	tokens: string[],
	tierResult: BatchLookupResult,
	serverWords: Map<string, G2PWord>,
): MergedWord[] {
	const merged: MergedWord[] = [];

	for (const [tokenIndex, token] of tokens.entries()) {
		const normalized = token.toLowerCase().trim();

		const tierWord = tierResult.found.get(normalized);
		if (tierWord) {
			merged.push({ word: lookupResultToG2PWord(tierWord), tokenIndex });
			continue;
		}

		const serverWord = serverWords.get(normalized);
		if (serverWord) {
			merged.push({ word: serverWord, tokenIndex });
			continue;
		}

		console.warn("transcription: no transcription returned for word, skipping", normalized);
	}

	return merged;
}

/** The terminal write shared by every failure path. */
function failed(kind: LookupErrorKind) {
	return (state: { lookupErrorNonce: number }) => ({
		lookupError: kind,
		lookupErrorNonce: state.lookupErrorNonce + 1,
		isTranscribing: false,
	});
}

/**
 * Monotonic id for the in-flight transcription. Module-level, not per-hook:
 * the form, the example chips and Retry each own a `useTranscribe` instance.
 */
let activeLookup = 0;
let draftRevision = 0;

export const useG2PStore = create<G2PStore>((set, get) => ({
	currentResult: null,
	selectedVariants: [],
	lookupError: null,
	lookupErrorNonce: 0,
	lastText: null,
	isTranscribing: false,
	draftText: "",

	clearResult: () => {
		// Any in-flight lookup belongs to the result being cleared.
		activeLookup += 1;
		draftRevision += 1;
		set({
			currentResult: null,
			selectedVariants: [],
			lookupError: null,
			lookupErrorNonce: 0,
			lastText: null,
			isTranscribing: false,
			draftText: "",
		});
	},

	setDraftText: (draftText) => {
		if (get().draftText === draftText) return;
		draftRevision += 1;
		set((state) => ({
			draftText,
			currentResult: state.currentResult?.spellingSuggestion
				? { ...state.currentResult, spellingSuggestion: null }
				: state.currentResult,
		}));
	},

	setVariant: (wordIndex: number, variantIndex: number) => {
		set((state) => {
			const next = state.selectedVariants.slice();
			next[wordIndex] = variantIndex;
			return { selectedVariants: next };
		});
	},

	transcribe: async (text, transcribeWords, lookupWords = batchLookup, spelling = {}) => {
		const token = ++activeLookup;
		const submittedDraftRevision = draftRevision;

		// Backstop: a throw escaping here becomes an unhandled rejection inside
		// `startTransition`, which the learner never sees.
		try {
			const tokens = tokenizeText(text);
			if (tokens.length === 0) {
				// Nothing was looked up, so an unresolved `lookupError` is still true
				// and stays on screen; `lastText` stays put so Retry never replays "".
				set({ currentResult: null, selectedVariants: [], isTranscribing: false });
				return;
			}

			set({ lastText: text, isTranscribing: true });

			let tierResult: BatchLookupResult;
			try {
				tierResult = await lookupWords(tokens);
			} catch (error) {
				if (activeLookup !== token) return;
				console.error("transcription: word list lookup failed", error);
				set(failed("wordlist"));
				return;
			}
			// A newer transcription owns the state now — return without touching it.
			if (activeLookup !== token) return;

			const serverWordMap = new Map<string, G2PWord>();
			if (tierResult.missing.length > 0) {
				let serverWords: G2PWord[];
				try {
					serverWords = await transcribeWords({ words: tierResult.missing });
				} catch (error) {
					if (activeLookup !== token) return;
					console.error("transcription: lookup service failed", error);
					set(failed("service"));
					return;
				}
				if (activeLookup !== token) return;

				for (const word of serverWords) {
					// Key by normalized token (what `mergeWords` reads) — `transcribeWords`
					// is injectable, so don't rely on the server echoing lowercase.
					serverWordMap.set(word.word.toLowerCase().trim(), word);
				}
			}

			const merged = mergeWords(tokens, tierResult, serverWordMap);
			if (merged.length === 0) {
				// Every token was dropped: committing an empty result would render a
				// blank word grid that reads as success. Surface the broken contract.
				console.error("transcription: lookup service returned no usable words");
				set(failed("service"));
				return;
			}

			let transformed: TranscriptionResult;
			try {
				transformed = transformToTranscriptionResult(
					{ words: merged.map((entry) => entry.word) },
					text,
				);
			} catch (error) {
				// Nothing is awaited since the last guard, so this lookup is still live.
				console.error("transcription: building the result failed", error);
				set(failed("unknown"));
				return;
			}

			const misses = spellingMisses(merged);
			// With a chooser, the result lands first and the suggestion follows it, so the
			// transcription never waits on a third-party call.
			const contextRequest = spelling.chooseInContext
				? buildSpellingContextRequest(text, misses)
				: null;
			transformed.spellingSuggestion = contextRequest
				? null
				: await spellingSuggestionFor(text, tokens, misses, token, spelling.frequency);
			if (activeLookup !== token) return;
			const draftChanged = draftRevision !== submittedDraftRevision || get().draftText !== text;
			if (draftChanged) {
				transformed.spellingSuggestion = null;
			}

			// Errors clear on settle, not on start, so the alert stays mounted
			// while a retry is in flight.
			set({
				currentResult: transformed,
				selectedVariants: Array(transformed.words.length).fill(0),
				lookupError: null,
				isTranscribing: false,
			});

			if (contextRequest && spelling.chooseInContext && !draftChanged) {
				// Not awaited: `transcribe` settles the transition, and the input re-enables,
				// as soon as the transcription is on screen.
				void attachContextSpellingSuggestion({
					text,
					tokens,
					misses,
					request: contextRequest,
					chooseInContext: spelling.chooseInContext,
					frequency: spelling.frequency,
					lookupToken: token,
					submittedDraftRevision,
					result: transformed,
				});
			}
		} catch (error) {
			if (activeLookup !== token) return;
			console.error("transcription: unexpected failure", error);
			set(failed("unknown"));
		}
	},

	acceptSpellingSuggestion: async (transcribeWords, lookupWords, spelling) => {
		const state = get();
		const suggestion = state.currentResult?.spellingSuggestion;
		if (
			!suggestion ||
			state.lookupError !== null ||
			state.isTranscribing ||
			state.currentResult?.originalText !== state.draftText
		) {
			return;
		}
		get().setDraftText(suggestion.suggestedText);
		await get().transcribe(suggestion.suggestedText, transcribeWords, lookupWords, spelling);
	},
}));

/** The server already searched around each missed token, so candidates ride on the word. */
function spellingMisses(merged: MergedWord[]): SpellingMiss[] {
	const misses: SpellingMiss[] = [];
	for (const { word, tokenIndex } of merged) {
		if (word.source !== "fallback") continue;
		misses.push({ tokenIndex, candidates: word.spellingNeighbours ?? [] });
	}
	return misses;
}

async function spellingSuggestionFor(
	originalText: string,
	tokens: string[],
	misses: SpellingMiss[],
	lookupToken: number,
	spellingFrequency?: SpellingFrequency,
	contextPicks?: ReadonlyMap<number, string | null>,
) {
	if (misses.length === 0) return null;

	try {
		const frequency = spellingFrequency ?? (await loadSpellingFrequency());
		if (activeLookup !== lookupToken) return null;
		return suggestSpelling({ originalText, tokens, misses, frequency, contextPicks });
	} catch (error) {
		console.error("transcription: spelling suggestion failed", error);
		return null;
	}
}

/**
 * Settles the suggestion for a result already on screen. Any failure of the context call
 * falls back to the rule; the offer is dropped if the learner moved on in the meantime.
 */
async function attachContextSpellingSuggestion(options: {
	text: string;
	tokens: string[];
	misses: SpellingMiss[];
	request: SpellingContextInput;
	chooseInContext: ChooseSpellingInContextFn;
	frequency?: SpellingFrequency;
	lookupToken: number;
	submittedDraftRevision: number;
	result: TranscriptionResult;
}): Promise<void> {
	const { text, lookupToken, submittedDraftRevision, result } = options;
	const stillCurrent = () => {
		const state = useG2PStore.getState();
		return (
			activeLookup === lookupToken &&
			draftRevision === submittedDraftRevision &&
			state.draftText === text &&
			state.currentResult === result
		);
	};

	let output: SpellingContextOutput | null = null;
	try {
		output = await options.chooseInContext(options.request);
	} catch (error) {
		console.warn("transcription: context spelling suggestion unavailable", error);
	}
	if (!stillCurrent()) return;

	const spellingSuggestion = await spellingSuggestionFor(
		text,
		options.tokens,
		options.misses,
		lookupToken,
		options.frequency,
		spellingContextPicksByToken(output),
	);
	if (!spellingSuggestion || !stillCurrent()) return;

	useG2PStore.setState({ currentResult: { ...result, spellingSuggestion } });
}
