"use client";

import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCurrentTranscription } from "../../_hooks/use-g2p";
import { useDictionaryStore } from "../../_store/dictionary-store";
import { useG2PStore } from "../../_store/g2p-store";
import type { TranscribedPhoneme, TranscribedWord } from "../../_types/g2p";
import { EmptyState } from "./empty-state";

interface WordColumnProps {
	word: TranscribedWord;
	onPhonemeClick: (phoneme: TranscribedPhoneme) => void;
}

interface ClickablePhonemeProps {
	phoneme: TranscribedPhoneme;
	onClick: (phoneme: TranscribedPhoneme) => void;
}

/**
 * Individual clickable phoneme with minimal styling
 */
function ClickablePhoneme({ phoneme, onClick }: ClickablePhonemeProps) {
	const isKnown = phoneme.isKnown;
	const selectedSymbol = useG2PStore((s) => s.selectedPhoneme?.symbol);
	const isSelected = selectedSymbol === phoneme.symbol;

	const handleClick = () => {
		onClick(phoneme);
	};

	return (
		<button
			type="button"
			className={cn(
				"font-mono text-3xl md:text-4xl bg-transparent border-none p-2 m-0 rounded-md",
				"cursor-pointer transition-all duration-100 ease-out",
				"hover:text-primary hover:bg-primary/5 hover:shadow-sm",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-md",
				!isKnown && "opacity-60 underline decoration-dotted underline-offset-4 hover:opacity-80",
				isSelected &&
					"text-primary bg-primary/10 underline underline-offset-4 ring-2 ring-primary/40 rounded-md shadow-sm",
			)}
			onClick={handleClick}
			aria-current={isSelected ? "true" : undefined}
			aria-label={`Phoneme ${phoneme.symbol}${isKnown ? " - click to learn more" : " - not in database"}`}
			title={
				isKnown
					? `Click to learn about /${phoneme.symbol}/`
					: `/${phoneme.symbol}/ - not found in phoneme database`
			}
		>
			{phoneme.symbol}
		</button>
	);
}

/**
 * Word column showing original word above IPA transcription
 */
function WordColumn({ word, onPhonemeClick }: WordColumnProps) {
	const { selectedVariants, setVariant } = useG2PStore();
	const { setSelectedWord } = useDictionaryStore();
	const selected = selectedVariants[word.wordIndex] ?? 0;
	const currentVariant = useMemo(() => word.variants[selected] ?? [], [word.variants, selected]);

	return (
		<div className="flex flex-col items-center text-center min-w-0">
			<button
				type="button"
				className="text-lg md:text-xl text-muted-foreground font-normal mb-3 whitespace-nowrap px-3 py-1 rounded-md hover:bg-muted/50 hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
				onClick={() => setSelectedWord(word.word)}
				aria-label={`Show definition for ${word.word}`}
				title={`Click to see definition for ${word.word}`}
			>
				{word.word}
			</button>

			<div className="flex items-center gap-2">
				<div className="leading-normal whitespace-nowrap flex items-center gap-1">
					{currentVariant.map((phoneme, phonemeIndex) => (
						<ClickablePhoneme
							key={`${phoneme.symbol}-${word.wordIndex}-${phonemeIndex}`}
							phoneme={phoneme}
							onClick={onPhonemeClick}
						/>
					))}
				</div>

				{word.variants.length > 1 && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted/50">
								<ChevronDown className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuLabel>Variants</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{word.variants.map((v, i) => {
								const key = v.map((p) => (typeof p === "string" ? p : p.symbol)).join("");
								return (
									<DropdownMenuItem key={key} onClick={() => setVariant(word.wordIndex, i)}>
										{`/${v.map((p) => (typeof p === "string" ? p : p.symbol)).join(" ")}/`}
									</DropdownMenuItem>
								);
							})}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</div>
	);
}

export function TranscriptionDisplay() {
	const { selectPhoneme } = useG2PStore();
	const { data: result } = useCurrentTranscription();

	if (!result) return <EmptyState />;

	return (
		<div className="flex flex-wrap items-start justify-center gap-6 md:gap-8 overflow-x-auto bg-muted/20 border border-border/40 p-4 md:p-6">
			{result.words.map((word, wordIndex) => (
				<WordColumn key={`${word.word}-${wordIndex}`} word={word} onPhonemeClick={selectPhoneme} />
			))}
		</div>
	);
}
