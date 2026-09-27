"use client";

import { Button } from "@phonaria/ui/components/button";
import { useState } from "react";
import { useSubmitTranscription } from "@/hooks/use-submit-transcription";
import type { TranscriptionHistoryEntry } from "@/lib/transcription/history";
import { ClearHistoryButton, HistoryList } from "./history-list";
import { HistorySheet } from "./history-sheet";

const RECENT_COUNT = 5;

/**
 * Takes the examples' place once the learner has history: their own words are
 * a better starting point than ours. The full list opens in a sheet.
 */
export function RecentTranscriptions({
	entries,
	onRemove,
	onClear,
}: {
	entries: readonly TranscriptionHistoryEntry[];
	onRemove: (text: string) => void;
	onClear: () => void;
}) {
	const { submit, isPending } = useSubmitTranscription();
	const [sheetOpen, setSheetOpen] = useState(false);
	const hasMore = entries.length > RECENT_COUNT;

	return (
		<section
			aria-labelledby="recent-transcriptions-heading"
			className="w-full max-w-sm space-y-1 animate-in fade-in fill-mode-both duration-300"
		>
			<h2
				id="recent-transcriptions-heading"
				className="text-center text-xs text-muted-foreground font-display"
			>
				Recent
			</h2>

			<HistoryList
				entries={entries.slice(0, RECENT_COUNT)}
				onSelect={submit}
				onRemove={onRemove}
				disabled={isPending}
			/>

			<div className="flex min-h-7 items-center justify-between gap-2 px-2">
				{hasMore ? (
					<Button
						variant="link"
						size="xs"
						className="px-0 text-muted-foreground hover:text-foreground"
						onClick={() => setSheetOpen(true)}
					>
						View all ({entries.length})
					</Button>
				) : (
					<span />
				)}
				<ClearHistoryButton onClear={onClear} />
			</div>

			<HistorySheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				entries={entries}
				onSelect={submit}
				onRemove={onRemove}
				onClear={onClear}
				disabled={isPending}
			/>
		</section>
	);
}
