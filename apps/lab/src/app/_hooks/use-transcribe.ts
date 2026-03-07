"use client";

import { useCallback, useRef, useTransition } from "react";
import type { G2PWord } from "@/lib/g2p/model";
import { fallbackG2P } from "@/lib/g2p/phoneme-generator";
import { transformToTranscriptionResult } from "@/lib/g2p-client";
import { batchLookup, tokenizeText, type WordLookupResult } from "@/lib/phoneme-lookup";
import { transcribeWordsAction } from "../_actions/transcribe";
import { useG2PStore } from "../_store/g2p-store";

function lookupResultToG2PWord(result: WordLookupResult): G2PWord {
	return {
		word: result.word,
		variants: result.variants,
		source: "cmudict",
	};
}

let nextRequestId = 0;

export function useTranscribe() {
	const [isPending, startTransition] = useTransition();
	const resetVariants = useG2PStore((s) => s.resetVariants);
	const setCurrentResult = useG2PStore((s) => s.setCurrentResult);
	const latestRequestRef = useRef(0);

	const mutate = useCallback(
		(input: { text: string }) => {
			const requestId = ++nextRequestId;
			latestRequestRef.current = requestId;

			startTransition(async () => {
				try {
					const tokens = tokenizeText(input.text);
					if (tokens.length === 0) {
						setCurrentResult(null);
						return;
					}

					const tierResult = await batchLookup(tokens);
					if (latestRequestRef.current !== requestId) return;

					const serverWordMap = new Map<string, G2PWord>();
					if (tierResult.missing.length > 0) {
						const serverWords = await transcribeWordsAction({
							words: tierResult.missing,
						});
						if (latestRequestRef.current !== requestId) return;

						for (const w of serverWords) {
							serverWordMap.set(w.word, w);
						}
					}

					const mergedWords: G2PWord[] = tokens.map((token) => {
						const normalized = token.toLowerCase().trim();

						const tierWord = tierResult.found.get(normalized);
						if (tierWord) {
							return lookupResultToG2PWord(tierWord);
						}

						const serverWord = serverWordMap.get(normalized);
						if (serverWord) {
							return serverWord;
						}

						return {
							word: normalized,
							variants: [fallbackG2P.generatePronunciation(normalized)],
							source: "fallback" as const,
						};
					});

					const transformed = transformToTranscriptionResult({ words: mergedWords }, input.text);
					setCurrentResult(transformed);
					resetVariants(transformed.words.length);
				} catch (error) {
					if (latestRequestRef.current !== requestId) return;
					console.error("Transcription failed:", error);
				}
			});
		},
		[setCurrentResult, resetVariants],
	);

	return { mutate, isPending };
}

export function useCurrentTranscription() {
	const currentResult = useG2PStore((s) => s.currentResult);
	return { data: currentResult };
}
