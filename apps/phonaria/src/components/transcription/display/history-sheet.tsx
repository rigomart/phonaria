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
	filterHistoryBySound,
	rankHistorySounds,
	TRANSCRIPTION_HISTORY_LIMIT,
	type TranscriptionHistoryEntry,
} from "@/lib/transcription/history";
import { PhraseList } from "./phrase-list";

/** The full history, with a text filter and, once it is long enough, sound chips. */
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
	const [selectedSound, setSelectedSound] = useState<string | null>(null);
	const sounds = rankHistorySounds(entries);
	const activeSound =
		selectedSound !== null && sounds.includes(selectedSound) ? selectedSound : null;
	const matches = filterHistoryBySound(filterHistory(entries, query), activeSound ?? "");

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			setQuery("");
			setSelectedSound(null);
		}
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
					{sounds.length > 0 ? (
						<fieldset className="w-full min-w-0 border-0 p-0">
							<legend className="sr-only">Filter by sound</legend>
							<div className="flex flex-wrap gap-1.5">
								{sounds.map((sound) => {
									const selected = sound === activeSound;
									return (
										<Button
											key={sound}
											variant={selected ? "default" : "outline"}
											size="sm"
											aria-pressed={selected}
											aria-label={`Filter by /${sound}/`}
											onClick={() => setSelectedSound(selected ? null : sound)}
											className="px-2 font-display"
										>
											{sound}
										</Button>
									);
								})}
							</div>
						</fieldset>
					) : null}
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
							highlightSound={activeSound ?? undefined}
							className="-mx-2.5"
						/>
					) : (
						<p className="py-6 text-center text-sm text-muted-foreground">
							{noMatchesMessage(query, activeSound)}
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

function noMatchesMessage(query: string, sound: string | null): string {
	const text = query.trim();
	if (text && sound) return `No transcriptions with /${sound}/ match "${text}".`;
	if (sound) return `No transcriptions include /${sound}/.`;
	return `No transcriptions match "${text}".`;
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
