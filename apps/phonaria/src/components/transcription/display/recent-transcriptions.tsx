"use client";

import { Button } from "@phonaria/ui/components/button";
import { ChevronRight, History } from "lucide-react";
import { useState } from "react";
import { useSubmitTranscription } from "@/hooks/use-submit-transcription";
import type { TranscriptionHistoryEntry } from "@/lib/transcription/history";
import { HistoryList } from "./history-list";
import { HistorySheet } from "./history-sheet";

const RECENT_COUNT = 5;

/**
 * Takes the examples' place once the learner has history: their own words are
 * a better starting point than ours. Filtering and clearing live in the sheet.
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

	return (
		<section
			aria-labelledby="recent-transcriptions-heading"
			className="w-full max-w-md space-y-2 animate-in fade-in fill-mode-both duration-300"
		>
			<div className="flex items-center justify-between px-2.5">
				<h2
					id="recent-transcriptions-heading"
					className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground font-display"
				>
					<History className="size-3.5" aria-hidden />
					Recent
				</h2>
				<Button
					variant="ghost"
					size="xs"
					className="-mr-2 text-muted-foreground hover:text-foreground"
					onClick={() => setSheetOpen(true)}
				>
					View all
					{entries.length > RECENT_COUNT ? ` (${entries.length})` : null}
					<ChevronRight aria-hidden />
				</Button>
			</div>

			<HistoryList
				entries={entries.slice(0, RECENT_COUNT)}
				onSelect={submit}
				onRemove={onRemove}
				disabled={isPending}
			/>

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
