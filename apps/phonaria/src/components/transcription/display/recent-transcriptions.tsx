"use client";

import { Button } from "@phonaria/ui/components/button";
import { ChevronRight, History } from "lucide-react";
import { useState } from "react";
import { useSubmitTranscription } from "@/hooks/use-submit-transcription";
import type { TranscriptionHistoryEntry } from "@/lib/transcription/history";
import { cn } from "@/lib/utils";
import { HistorySheet } from "./history-sheet";
import { PhraseList, PhraseSectionHeader } from "./phrase-list";

const RECENT_COUNT = 5;

/** The learner's latest transcriptions. Filtering and clearing live in the sheet. */
export function RecentTranscriptions({
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
		<section
			aria-labelledby="recent-transcriptions-heading"
			className={cn("space-y-2 animate-in fade-in fill-mode-both duration-300", className)}
		>
			<PhraseSectionHeader
				id="recent-transcriptions-heading"
				icon={<History aria-hidden />}
				title="Recent"
				action={
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
				}
			/>

			<PhraseList
				phrases={entries.slice(0, RECENT_COUNT)}
				onSelect={submit}
				onRemove={onRemove}
				removeLabel={(text) => `Remove "${text}" from history`}
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
