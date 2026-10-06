"use client";

import { Button } from "@phonaria/ui/components/button";
import { History } from "lucide-react";
import { useState } from "react";
import { useSubmitTranscription } from "@/hooks/use-submit-transcription";
import { useTranscriptionHistory } from "@/hooks/use-transcription-history";
import type { TranscriptionHistoryEntry } from "@/lib/transcription/history";
import { HistorySheet } from "./history-sheet";

export function HistoryButton({
	entries,
	onRemove,
	onClear,
	className,
}: {
	entries: readonly TranscriptionHistoryEntry[];
	onRemove: (text: string) => void;
	onClear: () => void;
	className?: string;
}) {
	const { submit, isPending } = useSubmitTranscription();
	const [sheetOpen, setSheetOpen] = useState(false);

	return (
		<>
			<Button variant="ghost" size="sm" className={className} onClick={() => setSheetOpen(true)}>
				<History aria-hidden />
				<span className="max-sm:sr-only">History</span>
				<span className="tabular-nums text-muted-foreground">{entries.length}</span>
			</Button>

			<HistorySheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				entries={entries}
				onSelect={submit}
				onRemove={onRemove}
				onClear={onClear}
				disabled={isPending}
			/>
		</>
	);
}

/** Header control for this page. Hidden until this browser has a transcription. */
export function HeaderHistoryButton() {
	const { entries, remove, clear } = useTranscriptionHistory();
	if (entries.length === 0) return null;

	return (
		<HistoryButton
			entries={entries}
			onRemove={remove}
			onClear={clear}
			className="text-muted-foreground hover:text-foreground animate-in fade-in duration-300 motion-reduce:animate-none"
		/>
	);
}
