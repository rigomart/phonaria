"use client";

import { Button } from "@phonaria/ui/components/button";
import { X } from "lucide-react";
import { segmentHistoryIpa } from "@/lib/transcription/history";
import { cn } from "@/lib/utils";

interface Phrase {
	text: string;
	ipa: string;
}

function PhraseIpa({ ipa, highlightSound }: { ipa: string; highlightSound?: string }) {
	const className = "w-full truncate font-display text-base leading-6 text-muted-foreground";
	if (!highlightSound) {
		return <span className={className}>/{ipa}/</span>;
	}

	const segments = segmentHistoryIpa(ipa);
	return (
		<span className={className}>
			/
			{segments.map((segment, index) => {
				const value = segment.kind === "sound" ? segment.symbol : segment.text;
				if (segment.kind === "sound" && segment.symbol === highlightSound) {
					return (
						<mark
							key={`${index}-${value}`}
							className="bg-transparent text-primary underline decoration-primary decoration-2 underline-offset-4"
						>
							{value}
						</mark>
					);
				}
				return <span key={`${index}-${value}`}>{value}</span>;
			})}
			/
		</span>
	);
}

/**
 * One block per phrase: the text, its IPA underneath. With `onRemove`, remove
 * shows on hover or focus, and always on touch screens where there is no hover.
 */
export function PhraseList({
	phrases,
	onSelect,
	onRemove,
	removeLabel = (text) => `Remove "${text}"`,
	disabled = false,
	highlightSound,
	className,
}: {
	phrases: readonly Phrase[];
	onSelect: (text: string) => void;
	onRemove?: (text: string) => void;
	removeLabel?: (text: string) => string;
	disabled?: boolean;
	/** Whole-symbol highlight inside each IPA line. */
	highlightSound?: string;
	className?: string;
}) {
	return (
		<ul className={cn("flex flex-col", className)}>
			{phrases.map((phrase) => (
				<li
					key={phrase.text}
					className="group flex items-center border-b border-border transition-colors last:border-b-0 hover:bg-muted focus-within:bg-muted"
				>
					<button
						type="button"
						onClick={() => onSelect(phrase.text)}
						disabled={disabled}
						className="flex min-w-0 flex-1 flex-col items-start gap-0.5 px-6 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:opacity-50"
					>
						<span className="w-full truncate text-base font-medium text-foreground">
							{phrase.text}
						</span>
						{phrase.ipa ? <PhraseIpa ipa={phrase.ipa} highlightSound={highlightSound} /> : null}
					</button>
					{onRemove ? (
						<Button
							variant="ghost"
							size="icon-xs"
							className="me-4 text-muted-foreground opacity-0 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
							aria-label={removeLabel(phrase.text)}
							onClick={() => onRemove(phrase.text)}
						>
							<X />
						</Button>
					) : null}
				</li>
			))}
		</ul>
	);
}
