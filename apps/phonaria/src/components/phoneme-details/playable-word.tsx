import type { TargetAccent } from "@phonaria/phonetics-data";
import { Volume2 } from "lucide-react";
import type { ReactNode } from "react";
import { WordAudioButton } from "@/components/word-audio-button";
import { cn } from "@/lib/utils";

/**
 * A word that is its own play button: a dotted underline and a small speaker
 * mark it, and playback firms the underline up. Without a recording it stays
 * plain text. `children` replaces how the word reads, e.g. with its spelling
 * marked.
 */
export function PlayableWord({
	targetAccent,
	word,
	children = word,
}: {
	targetAccent: TargetAccent;
	word: string;
	children?: ReactNode;
}) {
	return (
		<WordAudioButton
			targetAccent={targetAccent}
			word={word}
			fallback={children}
			className="group/word rounded-sm whitespace-nowrap outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[status=loading]:animate-pulse data-[status=playing]:text-foreground motion-reduce:transition-none motion-reduce:data-[status=loading]:animate-none"
		>
			<span className="underline decoration-dotted decoration-1 underline-offset-4 group-hover/word:decoration-solid group-data-[status=playing]/word:decoration-solid">
				{children}
			</span>
			<Volume2 aria-hidden="true" className="ml-0.5 inline size-3 align-middle" />
		</WordAudioButton>
	);
}

/**
 * A word as a cell in a list of words, the whole cell its play button when the
 * word has a recording, with a speaker after it. `className` sets the shape;
 * `children` replaces how the word reads.
 */
export function PlayableWordCell({
	targetAccent,
	word,
	children = word,
	className,
}: {
	targetAccent: TargetAccent;
	word: string;
	children?: ReactNode;
	className?: string;
}) {
	const base = cn("flex items-center gap-1 text-sm text-muted-foreground", className);
	// Wrapped so the cell's gap falls between the word and the speaker, not inside the word.
	const content = <span>{children}</span>;
	return (
		<WordAudioButton
			targetAccent={targetAccent}
			word={word}
			fallback={<span className={base}>{content}</span>}
			className={cn(
				base,
				"outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-[status=loading]:animate-pulse data-[status=playing]:bg-secondary data-[status=playing]:text-foreground motion-reduce:transition-none motion-reduce:data-[status=loading]:animate-none",
			)}
		>
			{content}
			<Volume2 aria-hidden="true" className="size-3 shrink-0" />
		</WordAudioButton>
	);
}
