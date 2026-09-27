"use client";

import { Button } from "@phonaria/ui/components/button";
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
import { PhraseList } from "./phrase-list";

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
						<PhraseList
							phrases={matches}
							onSelect={(text) => {
								handleOpenChange(false);
								onSelect(text);
							}}
							onRemove={onRemove}
							removeLabel={(text) => `Remove "${text}" from history`}
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

/** Asks inline before clearing, so one stray click cannot empty the history. */
function ClearHistoryButton({ onClear }: { onClear: () => void }) {
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
