"use client";

import { cn } from "@/lib/utils";
import { useDictionaryStore } from "../_store/dictionary-store";
import { useG2PStore } from "../_store/g2p-store";
import type { TranscribedPhoneme, TranscribedWord } from "../_types/g2p";
import { EmptyState } from "./empty-state";

interface WordColumnProps {
	word: TranscribedWord;
	onPhonemeClick: (phoneme: TranscribedPhoneme) => void;
	onWordClick: (word: string) => void;
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

	const handleClick = () => {
		onClick(phoneme);
	};

	return (
		<button
			type="button"
			className={cn(
				"font-mono text-3xl md:text-4xl bg-transparent border-none p-1 m-0",
				"cursor-pointer transition-all duration-200",
				"hover:text-primary hover:underline",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-md",
				!isKnown && "opacity-75 underline decoration-dotted underline-offset-4",
			)}
			style={{ letterSpacing: "0.1em" }}
			onClick={handleClick}
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
function WordColumn({ word, onPhonemeClick, onWordClick }: WordColumnProps) {
	return (
		<div className="flex flex-col items-center text-center min-w-0">
			<button
				type="button"
				className="text-lg md:text-xl text-muted-foreground font-normal mb-4 whitespace-nowrap hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
				onClick={() => onWordClick(word.word)}
				aria-label={`Show definition for ${word.word}`}
				title={`Click to see definition for ${word.word}`}
			>
				{word.word}
			</button>

			<div className="leading-normal whitespace-nowrap">
				{word.phonemes.map((phoneme, phonemeIndex) => (
					<ClickablePhoneme
						key={`${phoneme.symbol}-${word.wordIndex}-${phonemeIndex}`}
						phoneme={phoneme}
						onClick={onPhonemeClick}
					/>
				))}
			</div>
		</div>
	);
}

export function TranscriptionDisplay() {
	const { result, selectPhoneme } = useG2PStore();
	const { selectWord } = useDictionaryStore();

	if (!result) {
		return <EmptyState />;
	}

	return (
		<div className="space-y-4">
			<div className="w-full rounded-lg p-4">
				<div className="flex flex-wrap items-start justify-start gap-6 md:gap-8 overflow-x-auto pb-2">
					{result.words.map((word, wordIndex) => (
						<WordColumn
							key={`${word.word}-${wordIndex}`}
							word={word}
							onPhonemeClick={selectPhoneme}
							onWordClick={selectWord}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
