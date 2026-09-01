"use client";

import type { TargetAccent } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { Spinner } from "@phonaria/ui/components/spinner";
import { RotateCcw } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import type { TranscribedWord, TranscriptionResult } from "@/lib/types/g2p";
import { useCurrentTranscription, useTranscribe } from "../../_hooks/use-transcribe";
import { type LookupErrorKind, useG2PStore } from "../../_store/g2p-store";
import { EmptyState } from "./empty-state";
import { IpaSequence } from "./ipa-sequence";
import { VariantSelector } from "./variant-selector";

const LOOKUP_ERROR_COPY: Record<LookupErrorKind, string> = {
	wordlist: "We couldn't load the word list. Check your connection and try again.",
	service: "We couldn't reach the lookup service. Please try again.",
	unknown: "We couldn't finish transcribing that. Please try again.",
};

interface WordColumnProps {
	targetAccent: TargetAccent;
	word: TranscribedWord;
	index: number;
}

function WordColumn({ targetAccent, word, index }: WordColumnProps) {
	const selected = useG2PStore((s) => s.selectedVariants[word.wordIndex] ?? 0);
	const setVariant = useG2PStore((s) => s.setVariant);
	const currentVariant = useMemo(() => word.variants[selected] ?? [], [word.variants, selected]);
	const isUnknown = word.source === "fallback";

	return (
		<div
			className="flex flex-col items-center text-center min-w-0 gap-1 sm:gap-2 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
			style={{ animationDelay: `${index * 50}ms`, animationDuration: "300ms" }}
		>
			<span className="text-base md:text-lg  whitespace-nowrap px-3 py-1 text-muted-foreground">
				{word.word}
			</span>

			<div className="flex items-center gap-2">
				{isUnknown ? (
					<div
						className="flex items-center justify-center text-muted-foreground text-xs font-medium uppercase tracking-wider border border-dashed border-muted-foreground/30 rounded px-2 py-1 h-8 select-none"
						title="Pronunciation not found in dictionary"
					>
						Not found
					</div>
				) : (
					<>
						<IpaSequence
							targetAccent={targetAccent}
							syllables={currentVariant}
							wordIndex={word.wordIndex}
						/>
						<VariantSelector
							variants={word.variants}
							wordIndex={word.wordIndex}
							onSelect={setVariant}
						/>
					</>
				)}
			</div>
		</div>
	);
}

function TranscriptionResults({
	targetAccent,
	result,
	isStale,
}: {
	targetAccent: TargetAccent;
	result: TranscriptionResult;
	isStale: boolean;
}) {
	return (
		<div className="flex flex-col items-center overflow-x-auto px-4 py-4">
			{isStale ? (
				<div className="mb-4">
					<p className="text-xs text-muted-foreground">
						Showing your last transcription for "{result.originalText}".
					</p>
				</div>
			) : null}

			<div className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-6">
				{result.words.map((word, wordIndex) => (
					<WordColumn
						key={`${word.word}-${wordIndex}`}
						targetAccent={targetAccent}
						word={word}
						index={wordIndex}
					/>
				))}
			</div>

			<div
				className="mt-6 flex justify-center animate-in fade-in duration-500 fill-mode-both"
				style={{ animationDelay: `${result.words.length * 50 + 400}ms` }}
			>
				<p className="text-xs text-muted-foreground">Click any phoneme for details</p>
			</div>
		</div>
	);
}

/**
 * A failed lookup shows an alert with Retry above whatever result was already
 * on screen; the empty state is suppressed while erroring (#163). Retry sits
 * outside the `role="alert"` region so its busy-state swaps don't re-announce
 * the error, and the region is keyed by the failure nonce so a repeated
 * failure still announces.
 */
export function TranscriptionDisplay({ targetAccent }: { targetAccent: TargetAccent }) {
	const { data: result } = useCurrentTranscription();
	const lookupError = useG2PStore((s) => s.lookupError);
	const lookupErrorNonce = useG2PStore((s) => s.lookupErrorNonce);
	const isTranscribing = useG2PStore((s) => s.isTranscribing);
	const { retry, isPending } = useTranscribe();
	const isBusy = isPending || isTranscribing;

	let body: ReactNode = null;
	if (result) {
		body = (
			<TranscriptionResults
				targetAccent={targetAccent}
				result={result}
				isStale={lookupError !== null}
			/>
		);
	} else if (!lookupError) body = <EmptyState />;

	return (
		<>
			{lookupError ? (
				<div className="flex flex-col items-center px-4 py-4">
					<div className="w-full max-w-md flex flex-col items-center gap-3">
						<div
							key={`${lookupError}-${lookupErrorNonce}`}
							role="alert"
							className="w-full flex flex-col items-center gap-3 rounded-lg border border-border bg-muted p-4 text-center"
						>
							<p className="text-sm text-foreground">{LOOKUP_ERROR_COPY[lookupError]}</p>
						</div>
						<Button variant="outline" onClick={retry} disabled={isBusy} aria-busy={isBusy}>
							{isBusy ? <Spinner /> : <RotateCcw />}
							Retry
						</Button>
					</div>
				</div>
			) : null}
			{body}
		</>
	);
}
