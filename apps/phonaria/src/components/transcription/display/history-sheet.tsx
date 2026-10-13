"use client";

import { Button } from "@phonaria/ui/components/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@phonaria/ui/components/input-group";
import { ScrollArea } from "@phonaria/ui/components/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@phonaria/ui/components/sheet";
import { SearchIcon, SearchXIcon, Trash2Icon, XIcon } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import {
	filterHistory,
	filterHistoryBySound,
	groupHistoryByDay,
	rankHistorySounds,
	TRANSCRIPTION_HISTORY_LIMIT,
	type TranscriptionHistoryEntry,
} from "@/lib/transcription/history";
import { cn } from "@/lib/utils";
import { PhraseList } from "./phrase-list";

/** The full history by day, with a text filter and, once it is long enough, sound chips. */
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
	const groups = groupHistoryByDay(matches, Date.now());

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			setQuery("");
			setSelectedSound(null);
		}
		onOpenChange(next);
	};

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			{/* Wide enough on phones for the sound chips to fit one row. */}
			<SheetContent side="right" className="data-[side=right]:w-11/12">
				<SheetHeader className="gap-4 px-5 pt-5 pb-4">
					<div className="pe-10">
						<SheetTitle className="font-display text-lg font-semibold tracking-tight">
							History
						</SheetTitle>
						<SheetDescription>Recent transcriptions, saved in this browser.</SheetDescription>
					</div>
					<InputGroup>
						<InputGroupAddon>
							<SearchIcon aria-hidden />
						</InputGroupAddon>
						<InputGroupInput
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Filter by word or IPA"
							aria-label="Filter history"
							className="[&::-webkit-search-cancel-button]:appearance-none"
						/>
						{query ? (
							<InputGroupAddon align="inline-end">
								<InputGroupButton
									size="icon-xs"
									aria-label="Clear filter"
									onClick={() => setQuery("")}
								>
									<XIcon />
								</InputGroupButton>
							</InputGroupAddon>
						) : null}
					</InputGroup>
					{sounds.length > 0 ? (
						<SoundFilter
							sounds={sounds}
							activeSound={activeSound}
							onSelect={(sound) => setSelectedSound(sound === activeSound ? null : sound)}
						/>
					) : null}
				</SheetHeader>

				<ScrollArea className="min-h-0 flex-1 border-t">
					{groups.length > 0 ? (
						<div className="flex flex-col gap-4 p-2">
							{groups.map((group) => (
								<HistoryDaySection key={group.label} label={group.label}>
									<PhraseList
										phrases={group.entries}
										onSelect={(text) => {
											handleOpenChange(false);
											onSelect(text);
										}}
										onRemove={onRemove}
										removeLabel={(text) => `Remove "${text}" from history`}
										disabled={disabled}
										highlightSound={activeSound ?? undefined}
									/>
								</HistoryDaySection>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
							<SearchXIcon className="size-5 text-muted-foreground" aria-hidden />
							<p className="text-sm text-muted-foreground">
								{noMatchesMessage(query, activeSound)}
							</p>
						</div>
					)}
				</ScrollArea>

				<HistoryFooter
					count={entries.length}
					onClear={() => {
						handleOpenChange(false);
						onClear();
					}}
				/>
			</SheetContent>
		</Sheet>
	);
}

function HistoryDaySection({ label, children }: { label: string; children: ReactNode }) {
	const headingId = useId();
	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-1">
			<h3 id={headingId} className="px-3 pt-2 text-xs font-medium text-muted-foreground">
				{label}
			</h3>
			{children}
		</section>
	);
}

function SoundFilter({
	sounds,
	activeSound,
	onSelect,
}: {
	sounds: readonly string[];
	activeSound: string | null;
	onSelect: (sound: string) => void;
}) {
	const labelId = useId();
	return (
		<div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
			<p id={labelId} className="text-xs font-medium text-muted-foreground">
				Filter by sound
			</p>
			<div className="flex flex-wrap gap-1.5">
				{sounds.map((sound) => {
					const selected = sound === activeSound;
					return (
						<button
							key={sound}
							type="button"
							aria-pressed={selected}
							aria-label={`Filter by /${sound}/`}
							onClick={() => onSelect(sound)}
							className={cn(
								"inline-flex size-8 items-center justify-center rounded-full text-base leading-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover motion-reduce:transition-none",
								selected
									? "bg-primary text-primary-foreground"
									: "bg-secondary text-secondary-foreground hover:bg-accent",
							)}
						>
							{sound}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function noMatchesMessage(query: string, sound: string | null): string {
	const text = query.trim();
	if (text && sound) return `No transcriptions with /${sound}/ match "${text}".`;
	if (sound) return `No transcriptions include /${sound}/.`;
	return `No transcriptions match "${text}".`;
}

/** Asks inline before clearing, so one stray click cannot empty the history. */
function HistoryFooter({ count, onClear }: { count: number; onClear: () => void }) {
	const [confirming, setConfirming] = useState(false);

	return (
		<SheetFooter className="min-h-14 flex-row items-center justify-between gap-2 border-t px-5 py-3">
			{confirming ? (
				<>
					<p className="text-sm text-foreground">Clear all history?</p>
					<div className="flex items-center gap-1">
						<Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => {
								setConfirming(false);
								onClear();
							}}
						>
							Clear
						</Button>
					</div>
				</>
			) : (
				<>
					<p className="text-xs text-muted-foreground tabular-nums">
						{count} of {TRANSCRIPTION_HISTORY_LIMIT} saved
					</p>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground hover:text-foreground"
						onClick={() => setConfirming(true)}
					>
						<Trash2Icon data-icon="inline-start" aria-hidden />
						Clear history
					</Button>
				</>
			)}
		</SheetFooter>
	);
}
