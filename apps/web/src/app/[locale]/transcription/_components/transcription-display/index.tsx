"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useCurrentTranscription } from "../../_hooks/use-g2p";
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
					"cursor-pointer hover:bg-muted/50 hover:text-foreground",
					isUnknown ? "text-muted-foreground/50" : "text-muted-foreground",
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

			<div className="flex items-center gap-2 min-h-12">
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
	const selectedVariants = useG2PStore((state) => state.selectedVariants);
	const isMobile = useIsMobile();
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
		if (isMobile) {
			setPhonemeDialogOpen(true);
		}
	};

	const extractIpaText = () => {
		if (!result) return "";

		const ipaWords = result.words.map((word) => {
			const isUnknown = word.source === "fallback";
			if (isUnknown) return "";

			const selectedVariantIndex = selectedVariants[word.wordIndex] ?? 0;
			const currentVariant = word.variants[selectedVariantIndex] ?? [];

			const syllableStrings = currentVariant.map((syllable) => {
				let syllableText = "";
				if (syllable.stress === "primary") {
					syllableText += "ˈ";
				} else if (syllable.stress === "secondary") {
					syllableText += "ˌ";
				}
				syllableText += syllable.phonemes.map((p) => p.symbol).join("");
				return syllableText;
			});

			return syllableStrings.join(".");
		});

		return ipaWords.filter((w) => w.length > 0).join(" ");
	};

	const handleCopyToClipboard = async () => {
		const ipaText = extractIpaText();
		if (!ipaText) {
			toast.error("No transcription to copy");
			return;
		}

		try {
			await navigator.clipboard.writeText(ipaText);
			setIsCopied(true);
			toast.success("Copied to clipboard");
			setTimeout(() => setIsCopied(false), 2000);
		} catch (error) {
			toast.error("Failed to copy to clipboard");
			console.error("Copy failed:", error);
		}
	};

	if (!result) return <EmptyState />;

	return (
		<div className="relative flex flex-wrap items-start justify-center gap-6 md:gap-8 overflow-x-auto bg-muted/20 border border-border/40 p-4 md:p-6">
			<div className="absolute top-2 right-2 flex items-center gap-1">
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-muted-foreground hover:text-foreground"
							aria-label="Transcription information"
						>
							<Info className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 max-w-md">
						<div className="space-y-3">
							<h4 className="font-medium text-sm">About This Transcription</h4>
							<div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
								<p>
									Pronunciations are provided by the CMU Pronouncing Dictionary, which contains
									over 134,000 North American English words.
								</p>
								<p>
									<strong className="text-foreground">Known limitations:</strong>
								</p>
								<ul className="list-disc list-inside space-y-1 ml-2">
									<li>Newer words, slang, and specialized terms may not be included</li>
									<li>Proper nouns and brand names often missing</li>
									<li>No part-of-speech distinction (homographs show multiple variants)</li>
									<li>Words marked "Not found" use a fallback pronunciation generator</li>
								</ul>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground hover:text-foreground"
					onClick={handleCopyToClipboard}
					aria-label="Copy transcription to clipboard"
				>
					{isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
				</Button>
			</div>

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
