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
	const className = "w-full truncate text-sm text-muted-foreground";
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
							className="rounded-sm bg-primary px-0.5 text-primary-foreground"
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
 * One rounded row per phrase: the text, its IPA underneath. With `onRemove`,
 * remove shows on hover or focus, and always on touch screens where there is no hover.
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
					className="group flex items-center rounded-xl transition-colors hover:bg-secondary focus-within:bg-secondary motion-reduce:transition-none"
				>
					<button
						type="button"
						onClick={() => onSelect(phrase.text)}
						disabled={disabled}
						className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-xl py-2.5 ps-3 pe-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
					>
						<span className="w-full truncate text-sm font-medium text-foreground">
							{phrase.text}
						</span>
						{phrase.ipa ? <PhraseIpa ipa={phrase.ipa} highlightSound={highlightSound} /> : null}
					</button>
					{onRemove ? (
						<Button
							variant="ghost"
							size="icon-sm"
							className="me-1.5 text-muted-foreground opacity-0 hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
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
