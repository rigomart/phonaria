"use client";

import { Button } from "@phonaria/ui/components/button";
import { X } from "lucide-react";
import { useState } from "react";
import type { TranscriptionHistoryEntry } from "@/lib/transcription/history";
import { cn } from "@/lib/utils";

/** Muted rows: the text on the left, its IPA on the right, and a remove button. */
export function HistoryList({
	entries,
	onSelect,
	onRemove,
	disabled = false,
	className,
}: {
	entries: readonly TranscriptionHistoryEntry[];
	onSelect: (text: string) => void;
	onRemove: (text: string) => void;
	disabled?: boolean;
	className?: string;
}) {
	return (
		<ul className={cn("text-xs", className)}>
			{entries.map((entry) => (
				<li key={entry.text} className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => onSelect(entry.text)}
						disabled={disabled}
						className="flex min-w-0 flex-1 items-baseline gap-3 rounded-md px-2 py-1 text-left text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
					>
						<span className="truncate">{entry.text}</span>
						{entry.ipa ? <span className="ml-auto shrink truncate">/{entry.ipa}/</span> : null}
					</button>
					<Button
						variant="ghost"
						size="icon-xs"
						className="text-muted-foreground hover:text-foreground"
						aria-label={`Remove "${entry.text}" from history`}
						onClick={() => onRemove(entry.text)}
					>
						<X />
					</Button>
				</li>
			))}
		</ul>
	);
}

/** Asks inline before clearing, so one stray click cannot empty the history. */
export function ClearHistoryButton({ onClear }: { onClear: () => void }) {
	const [confirming, setConfirming] = useState(false);

	if (!confirming) {
		return (
			<Button
				variant="ghost"
				size="xs"
				className="text-muted-foreground hover:text-foreground"
				onClick={() => setConfirming(true)}
			>
				Clear history
			</Button>
		);
	}

	return (
		<span className="flex items-center gap-1 text-xs text-muted-foreground">
			Clear all history?
			<Button variant="ghost" size="xs" onClick={() => setConfirming(false)}>
				Cancel
			</Button>
			<Button
				variant="destructive-outline"
				size="xs"
				onClick={() => {
					setConfirming(false);
					onClear();
				}}
			>
				Clear
			</Button>
		</span>
	);
}
