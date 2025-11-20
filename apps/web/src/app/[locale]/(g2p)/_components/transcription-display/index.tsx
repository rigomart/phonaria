"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCurrentTranscription } from "../../_hooks/use-g2p";
import { extractIpaFromWords } from "../../_lib/extract-ipa";
import { useDictionaryStore } from "../../_store/dictionary-store";
import { useG2PStore } from "../../_store/g2p-store";
import type { TranscribedPhoneme, TranscribedWord } from "../../_types/g2p";
import { EmptyState } from "./empty-state";
import { IpaSequence } from "./ipa-sequence";
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
		<div className="flex flex-col items-center text-center min-w-0">
			<button
				type="button"
				className={cn(
					"text-lg md:text-xl font-normal mb-3 whitespace-nowrap px-3 py-1 rounded-md transition-colors duration-200",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
					isUnknown
						? "text-muted-foreground/50 cursor-default"
						: "text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer",
				)}
				onClick={() => !isUnknown && setSelectedWord(word.word)}
				aria-label={
					isUnknown
						? `Word "${word.word}" not found in dictionary`
						: `Show definition for ${word.word}`
				}
				title={
					isUnknown
						? `"${word.word}" not found in pronunciation dictionary`
						: `Click to see definition for ${word.word}`
				}
			>
				{word.word}
			</button>

			<div className="flex items-center gap-2 min-h-[3rem]">
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
	const selectPhoneme = useG2PStore((s) => s.selectPhoneme);
	const { selectedVariants } = useG2PStore();
	const { data: result } = useCurrentTranscription();
	const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
	const [isCopied, setIsCopied] = useState(false);
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
	};

	const handleCopyToClipboard = async () => {
		if (!result) return;

		const ipaText = extractIpaFromWords(result.words, selectedVariants);
		if (!ipaText) {
			toast.error("No transcription to copy");
			return;
		}

		try {
			await navigator.clipboard.writeText(ipaText);
			setIsCopied(true);
			toast.success("IPA transcription copied to clipboard");

			// Reset the copied state after 2 seconds
			setTimeout(() => {
				setIsCopied(false);
			}, 2000);
		} catch (error) {
			toast.error("Failed to copy to clipboard");
			console.error("Copy to clipboard failed:", error);
		}
	};

	if (!result) return <EmptyState />;

	return (
		<div className="relative">
			<div className="flex flex-wrap items-start justify-center gap-6 md:gap-8 overflow-x-auto bg-muted/20 border border-border/40 p-4 md:p-6">
				{result.words.map((word, wordIndex) => (
					<WordColumn
						key={`${word.word}-${wordIndex}`}
						word={word}
						onPhonemeClick={handlePhonemeClick}
						selectedSymbol={selectedSymbol}
					/>
				))}
			</div>

			<button
				type="button"
				onClick={handleCopyToClipboard}
				className={cn(
					"absolute top-2 right-2 p-2 rounded-md transition-all duration-200",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
					isCopied
						? "bg-green-500/10 text-green-600 dark:text-green-400"
						: "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border/60 shadow-sm",
				)}
				aria-label={isCopied ? "Copied to clipboard" : "Copy IPA transcription to clipboard"}
				title={isCopied ? "Copied!" : "Copy IPA transcription"}
			>
				{isCopied ? (
					<Check className="h-4 w-4" aria-hidden="true" />
				) : (
					<Copy className="h-4 w-4" aria-hidden="true" />
				)}
			</button>
		</div>
	);
}
