"use client";

import { Button } from "@phonaria/ui/components/button";
import { X } from "lucide-react";
import { useState } from "react";
import type { TranscriptionHistoryEntry } from "@/lib/transcription/history";
import { cn } from "@/lib/utils";

/**
 * One block per entry: the text, its IPA underneath. Remove shows on hover or
 * focus, and always on touch screens where there is no hover.
 */
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
		<ul className={cn("space-y-0.5", className)}>
			{entries.map((entry) => (
				<li
					key={entry.text}
					className="group flex items-center gap-1 rounded-md transition-colors hover:bg-accent focus-within:bg-accent"
				>
					<button
						type="button"
						onClick={() => onSelect(entry.text)}
						disabled={disabled}
						className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-md px-2.5 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
					>
						<span className="w-full truncate text-sm text-muted-foreground transition-colors group-hover:text-foreground group-focus-within:text-foreground">
							{entry.text}
						</span>
						{entry.ipa ? (
							<span className="w-full truncate text-xs text-muted-foreground">/{entry.ipa}/</span>
						) : null}
					</button>
					<Button
						variant="ghost"
						size="icon-xs"
						className="mr-1 text-muted-foreground opacity-0 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
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
