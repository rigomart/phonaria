import { cn } from "@/lib/utils";
import type { TranscribedPhoneme, TranscribedWord, TranscriptionResult } from "@/types/g2p";

interface TranscriptionDisplayProps {
	result: TranscriptionResult;
	onPhonemeClick?: (phoneme: TranscribedPhoneme) => void;
	className?: string;
}

interface WordColumnProps {
	word: TranscribedWord;
	onPhonemeClick?: (phoneme: TranscribedPhoneme) => void;
}

interface ClickablePhonemeProps {
	phoneme: TranscribedPhoneme;
	onClick?: (phoneme: TranscribedPhoneme) => void;
}

/**
 * Individual clickable phoneme with minimal styling
 */
function ClickablePhoneme({ phoneme, onClick }: ClickablePhonemeProps) {
	const isClickable = !!onClick;
	const isKnown = phoneme.isKnown;

	const handleClick = () => {
		if (isClickable) {
			onClick(phoneme);
		}
	};

	if (!isClickable) {
		return (
			<span
				className={cn(
					"font-mono text-3xl md:text-4xl",
					!isKnown && "opacity-75 underline decoration-dotted underline-offset-4",
				)}
				style={{ letterSpacing: "0.1em" }}
				title={
					isKnown
						? `Phoneme /${phoneme.symbol}/`
						: `/${phoneme.symbol}/ - not found in phoneme database`
				}
			>
				{phoneme.symbol}
			</span>
		);
	}

	return (
		<button
			type="button"
			className={cn(
				"font-mono text-3xl md:text-4xl bg-transparent border-none p-1 m-0",
				"cursor-pointer transition-all duration-200",
				"hover:text-primary hover:scale-105",
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
function WordColumn({ word, onPhonemeClick }: WordColumnProps) {
	return (
		<div className="flex flex-col items-center text-center min-w-0">
			{/* Original word - smaller, muted */}
			<div className="text-lg md:text-xl text-muted-foreground font-normal mb-4 whitespace-nowrap">
				{word.word}
			</div>

			{/* IPA transcription - larger, prominent */}
			<div className="leading-relaxed whitespace-nowrap">
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

/**
 * Compact transcription display optimized for tool-like interface
 */
export function TranscriptionDisplay({
	result,
	onPhonemeClick,
	className,
}: TranscriptionDisplayProps) {
	return (
		<div className={cn("w-full", "bg-muted/20 rounded-lg border p-4", className)}>
			{/* Compact word display */}
			<div className="flex flex-wrap items-start justify-start gap-6 md:gap-8 overflow-x-auto pb-2">
				{result.words.map((word, wordIndex) => (
					<WordColumn
						key={`${word.word}-${wordIndex}`}
						word={word}
						onPhonemeClick={onPhonemeClick}
					/>
				))}
			</div>
		</div>
	);
}
