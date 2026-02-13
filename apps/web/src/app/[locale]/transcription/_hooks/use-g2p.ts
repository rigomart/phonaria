"use client";

import type { TargetAccent } from "@phonaria/phonetics-data";
import { toastManager } from "@phonaria/ui/components/toast";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { useTargetAccentStore } from "@/store/target-accent-store";
import { transcribeWordsAction } from "../_actions/transcribe";
import type { G2PWord } from "../_lib/g2p/model";
import { transformToTranscriptionResult } from "../_lib/g2p-client";
import { batchLookup, tokenizeText, type WordLookupResult } from "../_lib/phoneme-lookup";
import { useG2PStore } from "../_store/g2p-store";

/**
 * Convert client-side tier lookup result to G2PWord format.
 * This allows reusing the existing transformation pipeline.
 */
function lookupResultToG2PWord(result: WordLookupResult): G2PWord {
	return {
		word: result.word,
		// Use all pronunciation variants from curated data
		variants: result.variants,
		// All tier1/tier2 words come from CMUDict
		source: "cmudict",
	};
}

/** Monotonically increasing request ID to guard against stale results. */
let nextRequestId = 0;

export function useTranscribe() {
	const [isPending, startTransition] = useTransition();
	const resetVariants = useG2PStore((s) => s.resetVariants);
	const setCurrentResult = useG2PStore((s) => s.setCurrentResult);
	const clearResult = useG2PStore((s) => s.clearResult);
	const targetAccent = useTargetAccentStore((s) => s.targetAccent);
	const latestRequestRef = useRef(0);

	// Clear transcription result when target accent changes
	const prevAccentRef = useRef(targetAccent);
	useEffect(() => {
		if (prevAccentRef.current !== targetAccent) {
			prevAccentRef.current = targetAccent;
			clearResult();
		}
	}, [targetAccent, clearResult]);

	const mutate = useCallback(
		(input: { text: string }) => {
			const requestId = ++nextRequestId;
			latestRequestRef.current = requestId;
			const requestAccent: TargetAccent = targetAccent;

			startTransition(async () => {
				try {
					if (requestAccent === "es-419") {
						const { transcribeSpanishText } = await import("../_lib/g2p-es/engine");
						const response = transcribeSpanishText(input.text);
						if (latestRequestRef.current !== requestId) return;
						if (response.words.length === 0) {
							setCurrentResult(null);
							return;
						}
						const transformed = transformToTranscriptionResult(response, input.text);
						setCurrentResult(transformed);
						resetVariants(transformed.words.length);
						return;
					}

					// English pipeline
					// 1. Tokenize text on client
					const tokens = tokenizeText(input.text);
					if (tokens.length === 0) {
						setCurrentResult(null);
						return;
					}

					// 2. Try client-side tier lookup first
					const tierResult = await batchLookup(tokens);
					if (latestRequestRef.current !== requestId) return;

					// 3. Fetch missing words from server (if any)
					let serverWords: G2PWord[] = [];
					if (tierResult.missing.length > 0) {
						const serverResult = await transcribeWordsAction({ words: tierResult.missing });
						if (latestRequestRef.current !== requestId) return;

						if (serverResult?.serverError) {
							toastManager.add({
								title: "Transcription failed",
								description: serverResult.serverError.message,
								type: "error",
							});
							return;
						}

						serverWords = serverResult?.data ?? [];
					}

					// 4. Build server word lookup map for merging
					const serverWordMap = new Map<string, G2PWord>();
					for (const word of serverWords) {
						serverWordMap.set(word.word, word);
					}

					// 5. Merge results in original token order
					const mergedWords: G2PWord[] = tokens
						.map((token) => {
							const normalized = token.toLowerCase().trim();

							// Check client tiers first
							const tierWord = tierResult.found.get(normalized);
							if (tierWord) {
								return lookupResultToG2PWord(tierWord);
							}

							// Fall back to server result
							return serverWordMap.get(normalized);
						})
						.filter((word): word is G2PWord => word !== undefined);

					// 6. Transform to frontend format
					const transformed = transformToTranscriptionResult({ words: mergedWords }, input.text);
					setCurrentResult(transformed);
					resetVariants(transformed.words.length);
				} catch (error) {
					if (latestRequestRef.current !== requestId) return;
					toastManager.add({
						title: "Transcription failed",
						description: error instanceof Error ? error.message : "Unknown error",
						type: "error",
					});
				}
			});
		},
		[targetAccent, setCurrentResult, resetVariants],
	);

	return { mutate, isPending };
}

export function useCurrentTranscription() {
	const currentResult = useG2PStore((s) => s.currentResult);
	return { data: currentResult };
}
