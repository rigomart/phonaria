"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * The composer both C variants share: search is the primary road, and the full
 * palette sits permanently below it. Search and palette agree — typing dims the
 * palette to the same matches the dropdown ranks, so the two surfaces teach each
 * other instead of competing.
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { Delete, Info } from "lucide-react";
import { useState } from "react";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import { cn } from "@/lib/utils";
import {
	CONSONANT_KEYS,
	DIPHTHONG_KEYS,
	MONOPHTHONG_KEYS,
	matchesQuery,
	type PaletteKey,
	SEARCH_INDEX,
	searchKeys,
} from "../_lib/palette";

const searchable = new Map(SEARCH_INDEX.map((key) => [key.id, key]));

const GROUPS: { label: string; keys: PaletteKey[] }[] = [
	{ label: "Consonants", keys: CONSONANT_KEYS },
	{ label: "Monophthongs", keys: MONOPHTHONG_KEYS },
	{ label: "Diphthongs", keys: DIPHTHONG_KEYS },
];

interface SoundComposerProps {
	draft: EnglishPhonemeSymbolId[];
	onAppend: (id: EnglishPhonemeSymbolId) => void;
	onRemoveAt: (index: number) => void;
	onRemoveLast: () => void;
}

export function SoundComposer({ draft, onAppend, onRemoveAt, onRemoveLast }: SoundComposerProps) {
	const [query, setQuery] = useState("");
	const [highlight, setHighlight] = useState(0);
	const [explain, setExplain] = useState(false);

	const matches = searchKeys(query).slice(0, 5);

	function commit(id: EnglishPhonemeSymbolId) {
		onAppend(id);
		setQuery("");
		setHighlight(0);
	}

	return (
		<div className="flex flex-col gap-3">
			{/* Chips + inline search */}
			<div className="relative">
				<div className="flex min-h-16 flex-wrap items-center gap-1.5 rounded-xl border-2 border-primary bg-background p-2">
					{draft.map((id, index) => (
						<ComposerChip id={id} key={`${id}-${index}`} onRemove={() => onRemoveAt(index)} />
					))}
					<input
						// biome-ignore lint/a11y/noAutofocus: prototype — typing is this variant's primary affordance
						autoFocus
						className="min-w-40 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-muted-foreground"
						onChange={(event) => {
							setQuery(event.target.value);
							setHighlight(0);
						}}
						onKeyDown={(event) => {
							if (event.key === "Backspace" && query === "") {
								onRemoveLast();
								return;
							}
							if (event.key === "ArrowDown") {
								event.preventDefault();
								setHighlight((h) => Math.min(h + 1, matches.length - 1));
								return;
							}
							if (event.key === "ArrowUp") {
								event.preventDefault();
								setHighlight((h) => Math.max(h - 1, 0));
								return;
							}
							if (event.key === "Enter" && matches[highlight]) {
								event.preventDefault();
								commit(matches[highlight].id);
								return;
							}
							if (event.key === "Escape") setQuery("");
						}}
						placeholder={draft.length === 0 ? "Type a sound — “schwa”, “sh”, “cat”…" : ""}
						value={query}
					/>
				</div>

				{matches.length > 0 && (
					<ul className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-lg border bg-background shadow-lg">
						{matches.map((match, index) => (
							<li key={match.id}>
								<button
									className={cn(
										"flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left",
										index === highlight ? "bg-background-soft" : "hover:bg-background-soft",
									)}
									onClick={() => commit(match.id)}
									onMouseEnter={() => setHighlight(index)}
									type="button"
								>
									<span className="w-8 font-display text-xl">{match.ipa}</span>
									<span className="flex flex-1 flex-col">
										<span className="text-sm">{match.label}</span>
										{match.aliases.length > 0 && (
											<span className="text-muted-foreground text-xs">
												{match.aliases.join(", ")}
											</span>
										)}
									</span>
									<span className="text-muted-foreground text-xs">{match.arpabet}</span>
								</button>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="flex items-center gap-2 text-muted-foreground text-xs">
				<Delete className="size-3.5" />
				Backspace deletes the last sound · click a sound you placed for details
			</div>

			{/* Always-visible palette */}
			<div className="rounded-xl border bg-background-soft">
				<div className="flex items-center justify-between border-b px-3 py-2">
					<span className="text-muted-foreground text-xs">All 40 sounds</span>
					<button
						aria-pressed={explain}
						className={cn(
							"flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors",
							explain
								? "border-primary bg-primary text-primary-foreground"
								: "bg-background text-muted-foreground",
						)}
						onClick={() => setExplain((value) => !value)}
						type="button"
					>
						<Info className="size-3.5" />
						Explain
					</button>
				</div>
				<div className="flex flex-col gap-2 px-3 py-2">
					{GROUPS.map((group) => (
						<div className="flex flex-col gap-1" key={group.label}>
							<span className="text-[0.625rem] text-muted-foreground uppercase tracking-wide">
								{group.label}
							</span>
							<div className="flex flex-wrap gap-1">
								{group.keys.map((key) => (
									<PaletteButton
										explain={explain}
										id={key.id}
										ipa={key.ipa}
										key={key.id}
										onInsert={commit}
										query={query}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function ComposerChip({ id, onRemove }: { id: EnglishPhonemeSymbolId; onRemove: () => void }) {
	const key = searchable.get(id);

	return (
		<span className="inline-flex h-10 items-center overflow-hidden rounded-lg border bg-background">
			<Popover>
				<PopoverTrigger
					render={
						<button
							aria-label={`Details for ${key?.ipa}`}
							className="h-full cursor-pointer px-2 font-display text-xl leading-none data-popup-open:bg-background-strong"
							type="button"
						/>
					}
				>
					{key?.ipa}
				</PopoverTrigger>
				<PopoverContent sideOffset={8}>
					<PhonemePopoverContent phonemeId={id} />
				</PopoverContent>
			</Popover>
			<button
				aria-label={`Remove ${key?.ipa}`}
				className="h-full cursor-pointer border-l px-1.5 text-muted-foreground text-xs hover:bg-destructive hover:text-destructive-foreground"
				onClick={onRemove}
				type="button"
			>
				×
			</button>
		</span>
	);
}

function PaletteButton({
	id,
	ipa,
	query,
	explain,
	onInsert,
}: {
	id: EnglishPhonemeSymbolId;
	ipa: string;
	query: string;
	explain: boolean;
	onInsert: (id: EnglishPhonemeSymbolId) => void;
}) {
	const key = searchable.get(id);
	const dimmed = key ? !matchesQuery(key, query) : false;
	const className = cn(
		"size-8 cursor-pointer rounded-md border bg-background font-display text-base leading-none transition-opacity hover:border-primary data-popup-open:border-primary",
		dimmed && "opacity-32",
	);

	if (explain) {
		return (
			<Popover>
				<PopoverTrigger render={<button className={className} type="button" />}>
					{ipa}
				</PopoverTrigger>
				<PopoverContent side="top" sideOffset={8}>
					<PhonemePopoverContent phonemeId={id} />
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<button
			className={className}
			onClick={() => onInsert(id)}
			title={key?.label ?? ipa}
			type="button"
		>
			{ipa}
		</button>
	);
}
