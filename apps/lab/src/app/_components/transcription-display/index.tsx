"use client";

import { ButtonGroup, ButtonGroupSeparator } from "@phonaria/ui/components/group";
import { useMemo } from "react";
import type { TranscribedWord } from "@/lib/types/g2p";
import { useCurrentTranscription } from "../../_hooks/use-transcribe";
import { useG2PStore } from "../../_store/g2p-store";
import { CopyButton } from "./copy-button";
import { EmptyState } from "./empty-state";
import { TranscriptionInfoButton } from "./info-button";
import { IpaSequence } from "./ipa-sequence";
import { VariantSelector } from "./variant-selector";

interface WordColumnProps {
	word: TranscribedWord;
	index: number;
}

function WordColumn({ word, index }: WordColumnProps) {
	const { selectedVariants, setVariant } = useG2PStore();
	const selected = selectedVariants[word.wordIndex] ?? 0;
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
						<IpaSequence syllables={currentVariant} wordIndex={word.wordIndex} />
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

export function TranscriptionDisplay() {
	const { data: result } = useCurrentTranscription();

	if (!result) return <EmptyState />;

	return (
		<div className="relative flex flex-1 items-start justify-center overflow-x-auto px-4 pt-12 pb-6 md:pt-16">
			<ButtonGroup className="absolute right-2 top-2 bg-background rounded-lg border shadow-sm animate-in fade-in duration-300">
				<TranscriptionInfoButton />
				<ButtonGroupSeparator />
				<CopyButton result={result} />
			</ButtonGroup>

			<div className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-6">
				{result.words.map((word, wordIndex) => (
					<WordColumn key={`${word.word}-${wordIndex}`} word={word} index={wordIndex} />
				))}
			</div>
		</div>
	);
}
