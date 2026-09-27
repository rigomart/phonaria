"use client";

import { Input } from "@phonaria/ui/components/input";
import {
	Sheet,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetPanel,
	SheetPopup,
	SheetTitle,
} from "@phonaria/ui/components/sheet";
import { useState } from "react";
import {
	filterHistory,
	TRANSCRIPTION_HISTORY_LIMIT,
	type TranscriptionHistoryEntry,
} from "@/lib/transcription/history";
import { ClearHistoryButton, HistoryList } from "./history-list";

/** The full history, with a filter, for when the Recent block is not enough. */
export function HistorySheet({
	open,
	onOpenChange,
	entries,
	onSelect,
	onRemove,
	onClear,
	disabled,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	entries: readonly TranscriptionHistoryEntry[];
	onSelect: (text: string) => void;
	onRemove: (text: string) => void;
	onClear: () => void;
	disabled?: boolean;
}) {
	const [query, setQuery] = useState("");
	const matches = filterHistory(entries, query);

	const handleOpenChange = (next: boolean) => {
		if (!next) setQuery("");
		onOpenChange(next);
	};

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetPopup side="right">
				<SheetHeader>
					<SheetTitle className="font-display text-lg">History</SheetTitle>
					<SheetDescription>
						Saved in this browser only. Keeps your last {TRANSCRIPTION_HISTORY_LIMIT}.
					</SheetDescription>
					<Input
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Filter by word or IPA"
						aria-label="Filter history"
						className="mt-2"
					/>
				</SheetHeader>

				<SheetPanel>
					{matches.length > 0 ? (
						<HistoryList
							entries={matches}
							onSelect={(text) => {
								handleOpenChange(false);
								onSelect(text);
							}}
							onRemove={onRemove}
							disabled={disabled}
							className="-mx-2.5"
						/>
					) : (
						<p className="py-6 text-center text-sm text-muted-foreground">
							No transcriptions match "{query.trim()}".
						</p>
					)}
				</SheetPanel>

				<SheetFooter variant="bare" className="items-center sm:justify-between">
					<span className="text-xs text-muted-foreground">
						{entries.length} of {TRANSCRIPTION_HISTORY_LIMIT}
					</span>
					<ClearHistoryButton
						onClear={() => {
							handleOpenChange(false);
							onClear();
						}}
					/>
				</SheetFooter>
			</SheetPopup>
		</Sheet>
	);
}
