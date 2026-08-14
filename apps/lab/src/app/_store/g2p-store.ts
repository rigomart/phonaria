import { create } from "zustand";
import type { G2PWord } from "@/lib/g2p/model";
import { fallbackG2P } from "@/lib/g2p/phoneme-generator";
import { transformToTranscriptionResult } from "@/lib/g2p-client";
import {
	type BatchLookupResult,
	batchLookup,
	tokenizeText,
	type WordLookupResult,
} from "@/lib/phoneme-lookup";
import type { TranscriptionResult } from "@/lib/types/g2p";

/**
 * Which stage of the lookup failed. Server-action errors are digest-opaque in
 * production, so the kind comes from the catch scope, never from the message.
 * The learner-facing copy lives with the component that renders it.
 */
export type LookupErrorKind = "wordlist" | "service" | "unknown";

/**
 * The server action is injected instead of imported: `../_actions/transcribe`
 * pulls in `@/db/drizzle`, which throws at import time when `TURSO_DATABASE_URL`
 * is unset — importing it here would break this store's test at module load.
 * The client-side lookup has no such problem, so it defaults to `batchLookup`.
 */
export type TranscribeWordsFn = (input: { words: string[] }) => Promise<G2PWord[]>;
export type LookupWordsFn = (words: string[]) => Promise<BatchLookupResult>;

interface G2PStore {
	currentResult: TranscriptionResult | null;
	selectedVariants: number[];
	/** Set when a lookup failed; cleared when one settles successfully. */
	lookupError: LookupErrorKind | null;
	/** The text Retry replays. Never set for input that tokenized to nothing. */
	lastText: string | null;
	/**
	 * True while a lookup is in flight. `useTransition`'s `isPending` is
	 * per-hook-instance, so a lookup fired from the form would otherwise leave
	 * Retry (a different instance) looking idle.
	 */
	isTranscribing: boolean;

	clearResult: () => void;
	setVariant: (wordIndex: number, variantIndex: number) => void;
	transcribe: (
		text: string,
		transcribeWords: TranscribeWordsFn,
		lookupWords?: LookupWordsFn,
	) => Promise<void>;
}

function lookupResultToG2PWord(result: WordLookupResult): G2PWord {
	return {
		word: result.word,
		variants: result.variants,
		source: "cmudict",
	};
}

/** Precedence per token: client tier hit → server word → client fallback. */
function mergeWords(
	tokens: string[],
	tierResult: BatchLookupResult,
	serverWords: Map<string, G2PWord>,
): G2PWord[] {
	return tokens.map((token) => {
		const normalized = token.toLowerCase().trim();

		const tierWord = tierResult.found.get(normalized);
		if (tierWord) {
			return lookupResultToG2PWord(tierWord);
		}

		const serverWord = serverWords.get(normalized);
		if (serverWord) {
			return serverWord;
		}

		return {
			word: normalized,
			variants: [fallbackG2P.generatePronunciation(normalized)],
			source: "fallback" as const,
		};
	});
}

/**
 * Monotonic id for the in-flight transcription. It is module-level, not
 * per-hook: the form, the example chips and Retry each instantiate their own
 * `useTranscribe`, so a per-instance ref could not tell one instance's stale
 * result from another instance's live one.
 */
let activeLookup = 0;

export const useG2PStore = create<G2PStore>((set) => ({
	currentResult: null,
	selectedVariants: [],
	lookupError: null,
	lastText: null,
	isTranscribing: false,

	clearResult: () => {
		// Any in-flight lookup belongs to the result being cleared.
		activeLookup += 1;
		set({
			currentResult: null,
			selectedVariants: [],
			lookupError: null,
			lastText: null,
			isTranscribing: false,
		});
	},

	setVariant: (wordIndex: number, variantIndex: number) => {
		set((state) => {
			const next = state.selectedVariants.slice();
			next[wordIndex] = variantIndex;
			return { selectedVariants: next };
		});
	},

	transcribe: async (text, transcribeWords, lookupWords = batchLookup) => {
		const token = ++activeLookup;

		// Outer backstop: `transcribe` runs inside `startTransition`, where a throw
		// would be an unhandled rejection and the learner would see nothing. Total
		// by construction rather than by audit — the inner catches still classify.
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
				set({ lookupError: "wordlist", isTranscribing: false });
				return;
			}
			// A newer transcription took over mid-flight — drop this one. It owns
			// `isTranscribing` now, so a stale return never touches the flag.
			if (activeLookup !== token) return;

			const serverWordMap = new Map<string, G2PWord>();
			if (tierResult.missing.length > 0) {
				let serverWords: G2PWord[];
				try {
					serverWords = await transcribeWords({ words: tierResult.missing });
				} catch (error) {
					if (activeLookup !== token) return;
					console.error("transcription: lookup service failed", error);
					set({ lookupError: "service", isTranscribing: false });
					return;
				}
				if (activeLookup !== token) return;

				for (const word of serverWords) {
					serverWordMap.set(word.word, word);
				}
			}

			let transformed: TranscriptionResult;
			try {
				transformed = transformToTranscriptionResult(
					{ words: mergeWords(tokens, tierResult, serverWordMap) },
					text,
				);
			} catch (error) {
				// Nothing is awaited since the last guard, so this lookup is still live.
				console.error("transcription: building the result failed", error);
				set({ lookupError: "unknown", isTranscribing: false });
				return;
			}

			// The error clears on settle, not on start, so the alert — and its Retry
			// button — stays mounted while the retry is in flight.
			set({
				currentResult: transformed,
				selectedVariants: Array(transformed.words.length).fill(0),
				lookupError: null,
				isTranscribing: false,
			});
		} catch (error) {
			if (activeLookup !== token) return;
			console.error("transcription: unexpected failure", error);
			set({ lookupError: "unknown", isTranscribing: false });
		}
	},
}));
