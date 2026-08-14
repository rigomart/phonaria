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
 */
export type LookupErrorKind = "wordlist" | "service" | "unknown";

/**
 * The server action is injected instead of imported: `../_actions/transcribe`
 * pulls in `@/db/drizzle`, which throws at import time when `TURSO_DATABASE_URL`
 * is unset — importing it here would break this store's test at module load.
 */
export type TranscribeWordsFn = (input: { words: string[] }) => Promise<G2PWord[]>;
export type LookupWordsFn = (words: string[]) => Promise<BatchLookupResult>;

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

export const useG2PStore = create<G2PStore>((set) => ({
	currentResult: null,
	selectedVariants: [],
	lookupError: null,
	lookupErrorNonce: 0,
	lastText: null,
	isTranscribing: false,

	clearResult: () => {
		// Any in-flight lookup belongs to the result being cleared.
		activeLookup += 1;
		set({
			currentResult: null,
			selectedVariants: [],
			lookupError: null,
			lookupErrorNonce: 0,
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

			let transformed: TranscriptionResult;
			try {
				transformed = transformToTranscriptionResult(
					{ words: mergeWords(tokens, tierResult, serverWordMap) },
					text,
				);
			} catch (error) {
				// Nothing is awaited since the last guard, so this lookup is still live.
				console.error("transcription: building the result failed", error);
				set(failed("unknown"));
				return;
			}

			// Errors clear on settle, not on start, so the alert stays mounted
			// while a retry is in flight.
			set({
				currentResult: transformed,
				selectedVariants: Array(transformed.words.length).fill(0),
				lookupError: null,
				isTranscribing: false,
			});
		} catch (error) {
			if (activeLookup !== token) return;
			console.error("transcription: unexpected failure", error);
			set(failed("unknown"));
		}
	},
}));
