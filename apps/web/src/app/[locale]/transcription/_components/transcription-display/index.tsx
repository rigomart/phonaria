"use client";

import { ButtonGroup, ButtonGroupSeparator } from "@phonaria/ui/components/group";
import { useEffect, useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useCurrentTranscription } from "../../_hooks/use-g2p";
import { useDictionaryStore } from "../../_store/dictionary-store";
import { useG2PStore } from "../../_store/g2p-store";
import type { TranscribedPhoneme, TranscribedWord } from "../../_types/g2p";
import { EmptyState } from "./empty-state";
import { IpaSequence } from "./ipa-sequence";
import { TranscriptionCopyButton } from "./transcription-copy-button";
import { TranscriptionInfoButton } from "./transcription-info-button";
import { VariantSelector } from "./variant-selector";

interface WordColumnProps {
	word: TranscribedWord;
	onPhonemeClick: (phoneme: TranscribedPhoneme) => void;
	selectedSymbol: string | null;
}

/**
 * Word column showing original word above IPA transcription
 */
function WordColumn({ word, onPhonemeClick, selectedSymbol }: WordColumnProps) {
	const { selectedVariants, setVariant } = useG2PStore();
	const { setSelectedWord } = useDictionaryStore();
	const selected = selectedVariants[word.wordIndex] ?? 0;
	const currentVariant = useMemo(() => word.variants[selected] ?? [], [word.variants, selected]);
	const isUnknown = word.source === "fallback";

	return (
		<div className="flex flex-col items-center text-center min-w-0 gap-1 sm:gap-2">
			<button
				type="button"
				className={cn(
					"text-base md:text-lg font-semibold whitespace-nowrap px-3 py-1 rounded-lg transition-colors duration-200",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
					"cursor-pointer border border-transparent hover:border-border/70 hover:bg-muted/40 hover:text-foreground",
					isUnknown ? "text-muted-foreground/60" : "text-foreground",
				)}
				onClick={() => setSelectedWord(word.word)}
				aria-label={`Show definition for ${word.word}`}
				title={
					isUnknown
						? `Click to see definition for ${word.word} (pronunciation not in dictionary)`
						: `Click to see definition for ${word.word}`
				}
			>
				{word.word}
			</button>

			<div className="flex items-center gap-2">
				{isUnknown ? (
					<div
						className="flex items-center justify-center text-muted-foreground/60 text-xs font-medium uppercase tracking-wider border border-dashed border-muted-foreground/30 rounded px-2 py-1 h-8 select-none"
						title="Pronunciation not found in dictionary"
					>
						Not found
					</div>
				) : (
					<>
						<IpaSequence
							syllables={currentVariant}
							wordIndex={word.wordIndex}
							onPhonemeClick={onPhonemeClick}
							selectedSymbol={selectedSymbol}
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

export function TranscriptionDisplay() {
	const selectPhoneme = useG2PStore((state) => state.selectPhoneme);
	const setPhonemeDialogOpen = useG2PStore((state) => state.setPhonemeDialogOpen);
	const isMobile = useIsMobile();
	const { data: result } = useCurrentTranscription();
	const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
	const resultTimestamp = result?.timestamp?.valueOf();

	useEffect(() => {
		if (resultTimestamp === undefined) {
			setSelectedSymbol(null);
			return;
		}
		setSelectedSymbol(null);
	}, [resultTimestamp]);

	const handlePhonemeClick = (phoneme: TranscribedPhoneme) => {
		setSelectedSymbol(phoneme.symbol);
		selectPhoneme(phoneme.phonemeId ?? null);
		if (isMobile) {
			setPhonemeDialogOpen(true);
		}
	};

	if (!result) return <EmptyState />;

	return (
		<div className="relative flex flex-wrap items-start justify-center gap-6 md:gap-8 overflow-x-auto rounded-b-xl border-t px-4 py-5 md:px-6">
			<ButtonGroup className="absolute right-1 top-1 bg-background-strong rounded-xl border border-border/70 shadow-sm">
				<TranscriptionInfoButton />
				<ButtonGroupSeparator />
				<TranscriptionCopyButton result={result} />
			</ButtonGroup>

			{result.words.map((word, wordIndex) => (
				<WordColumn
					key={`${word.word}-${wordIndex}`}
					word={word}
					onPhonemeClick={handlePhonemeClick}
					selectedSymbol={selectedSymbol}
				/>
			))}
		</div>
	);
}
