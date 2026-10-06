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
import { cn } from "@/lib/utils";
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
				<SheetHeader className="gap-4 border-b border-border">
					<div className="pe-10">
						<SheetTitle className="font-display">History</SheetTitle>
						<SheetDescription className="mt-1.5">
							{entries.length} of {TRANSCRIPTION_HISTORY_LIMIT} saved in this browser.
						</SheetDescription>
					</div>
					<Input
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Filter by word or IPA"
						aria-label="Filter history"
					/>
					{sounds.length > 0 ? (
						<fieldset className="min-w-0 border-0 p-0">
							<legend className="sr-only">Filter by sound</legend>
							<div className="flex flex-wrap gap-2">
								{sounds.map((sound) => (
									<SoundFilterChip
										key={sound}
										sound={sound}
										selected={sound === activeSound}
										onSelect={() => setSelectedSound(sound === activeSound ? null : sound)}
									/>
								))}
							</div>
						</fieldset>
					) : null}
				</SheetHeader>

				<SheetPanel>
					{matches.length > 0 ? (
						<PhraseList
							className="-mx-6"
							phrases={matches}
							onSelect={(text) => {
								handleOpenChange(false);
								onSelect(text);
							}}
							onRemove={onRemove}
							removeLabel={(text) => `Remove "${text}" from history`}
							disabled={disabled}
							highlightSound={activeSound ?? undefined}
						/>
					) : (
						<p className="px-2 py-10 text-center text-sm text-muted-foreground">
							{noMatchesMessage(query, activeSound)}
						</p>
					)}
				</SheetPanel>

				<SheetFooter variant="bare" className="border-t border-border sm:justify-start">
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

function SoundFilterChip({
	sound,
	selected,
	onSelect,
}: {
	sound: string;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			aria-pressed={selected}
			aria-label={`Filter by /${sound}/`}
			onClick={onSelect}
			className={cn(
				"inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg border px-2 font-display text-lg leading-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-popover motion-reduce:transition-none",
				selected
					? "border-primary bg-primary text-primary-foreground"
					: "border-border bg-background-soft text-foreground hover:border-primary hover:bg-background-strong",
			)}
		>
			{sound}
		</button>
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
