"use client";

import { toastManager } from "@phonaria/ui/components/toast";
import { useTransition } from "react";
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

export function useTranscribe() {
	const [isPending, startTransition] = useTransition();
	const resetVariants = useG2PStore((s) => s.resetVariants);
	const setCurrentResult = useG2PStore((s) => s.setCurrentResult);

	const mutate = (input: { text: string }) => {
		startTransition(async () => {
			try {
				// 1. Tokenize text on client
				const tokens = tokenizeText(input.text);
				if (tokens.length === 0) {
					setCurrentResult(null);
					return;
				}

				// 2. Try client-side tier lookup first
				const tierResult = await batchLookup(tokens);

				// 3. Fetch missing words from server (if any)
				let serverWords: G2PWord[] = [];
				if (tierResult.missing.length > 0) {
					const serverResult = await transcribeWordsAction({ words: tierResult.missing });

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
				toastManager.add({
					title: "Transcription failed",
					description: error instanceof Error ? error.message : "Unknown error",
					type: "error",
				});
			}
		});
	};

	return { mutate, isPending };
}

export function useCurrentTranscription() {
	const currentResult = useG2PStore((s) => s.currentResult);
	return { data: currentResult };
}
