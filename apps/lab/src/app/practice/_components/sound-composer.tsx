"use client";

/**
 * How a learner builds one word's sound sequence: a search field that takes
 * IPA, phoneme IDs, ARPABET, articulatory labels and learner aliases, plus the
 * full 40-key palette always visible beneath it — never behind a disclosure.
 *
 * `searchSounds` produces one ranked list, so the dropdown and the palette's
 * dimming can never disagree about what the query matched (#140).
 */
import { type KeyboardEvent, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { resolveComposerKey } from "../_lib/composer-keys";
import {
	CONSONANT_KEYS,
	describeSound,
	type SoundKey,
	searchSounds,
	VOWEL_KEYS,
} from "../_lib/sound-palette";
import { SoundChip } from "./sound-chip";

interface SoundComposerProps {
	sequence: readonly string[];
	onAppend: (sound: string) => void;
	onRemoveAt: (index: number) => void;
}

export function SoundComposer({ sequence, onAppend, onRemoveAt }: SoundComposerProps) {
	const listboxId = useId();
	const optionId = useId();
	const [query, setQuery] = useState("");
	const [highlight, setHighlight] = useState(0);

	const matches = searchSounds(query);
	// A narrowing query can strand the highlight past the end of the list.
	const activeIndex = Math.min(highlight, Math.max(matches.length - 1, 0));
	const matchedIds = new Set(matches.map((match) => match.id));
	const isSearching = query.trim().length > 0;

	function commit(sound: SoundKey) {
		onAppend(sound.id);
		setQuery("");
		setHighlight(0);
	}

	function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		const action = resolveComposerKey(event.key, {
			query,
			matchCount: matches.length,
			highlight: activeIndex,
		});

		switch (action.type) {
			case "commit": {
				const match = matches[action.index];
				if (!match) return;
				event.preventDefault();
				commit(match);
				return;
			}
			case "highlight":
				event.preventDefault();
				setHighlight(action.index);
				return;
			case "remove-last":
				// Let Backspace fall through when there is nothing to delete.
				if (sequence.length === 0) return;
				event.preventDefault();
				onRemoveAt(sequence.length - 1);
				return;
			case "clear-query":
				event.preventDefault();
				setQuery("");
				setHighlight(0);
				return;
			default:
		}
	}

	return (
		<div className="flex w-full flex-col items-center gap-6">
			<div className="relative w-full">
				<div className="flex min-h-16 flex-wrap items-center gap-1.5 rounded-xl border bg-background px-2 py-1.5 focus-within:border-primary">
					{sequence.map((sound, index) => (
						<SoundChip key={`${sound}-${index}`} onRemove={() => onRemoveAt(index)} sound={sound} />
					))}
					<input
						aria-activedescendant={matches.length > 0 ? `${optionId}-${activeIndex}` : undefined}
						aria-autocomplete="list"
						aria-controls={listboxId}
						aria-expanded={matches.length > 0}
						aria-label="Search for a sound"
						// biome-ignore lint/a11y/noAutofocus: typing is the primary road, and the field remounts per word
						autoFocus
						className="min-w-40 flex-1 bg-transparent px-1 py-2 text-base outline-none placeholder:text-muted-foreground"
						onChange={(event) => {
							setQuery(event.target.value);
							setHighlight(0);
						}}
						onKeyDown={onKeyDown}
						placeholder={sequence.length === 0 ? "Type a sound — “schwa”, “sh”, “cat”…" : ""}
						role="combobox"
						value={query}
					/>
				</div>

				{matches.length > 0 ? (
					<div
						className="absolute inset-x-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-xl border bg-background shadow-lg"
						id={listboxId}
						role="listbox"
					>
						{matches.map((match, index) => (
							// Options are driven by the field, so they stay out of the tab order.
							<button
								aria-selected={index === activeIndex}
								className={cn(
									"flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left",
									index === activeIndex ? "bg-background-soft" : "hover:bg-background-soft",
								)}
								id={`${optionId}-${index}`}
								key={match.id}
								onClick={() => commit(match)}
								onMouseEnter={() => setHighlight(index)}
								role="option"
								tabIndex={-1}
								type="button"
							>
								<span className="w-8 shrink-0 font-display text-xl">{match.ipa}</span>
								<span className="flex flex-1 flex-col">
									<span className="text-sm">{match.label}</span>
									<span className="text-muted-foreground text-xs">
										{[...match.nicknames, ...match.examples].join(", ")}
									</span>
								</span>
								<span className="text-muted-foreground text-xs">{match.arpabet}</span>
							</button>
						))}
					</div>
				) : null}
			</div>

			<div className="flex flex-col items-center gap-5">
				<PaletteRow
					dimmedUnless={isSearching ? matchedIds : null}
					keys={CONSONANT_KEYS}
					onInsert={commit}
				/>
				<span aria-hidden="true" className="h-px w-72 bg-border" />
				<PaletteRow
					dimmedUnless={isSearching ? matchedIds : null}
					keys={VOWEL_KEYS}
					onInsert={commit}
				/>
			</div>
		</div>
	);
}

/**
 * Consonants and vowels are split by a wider gap and a hairline rule — no
 * headings, no tinting, no explain mode (#140). That rules out a hover tooltip
 * too: assistance is chips-plus-dropdown only, so a key's articulatory label
 * reaches the mouse through the dropdown, and screen readers through its
 * accessible name. Keys stay clickable while dimmed — search is a hint, not a
 * filter.
 */
function PaletteRow({
	keys,
	dimmedUnless,
	onInsert,
}: {
	keys: readonly SoundKey[];
	dimmedUnless: ReadonlySet<string> | null;
	onInsert: (sound: SoundKey) => void;
}) {
	return (
		<div className="flex max-w-lg flex-wrap justify-center gap-1">
			{keys.map((key) => (
				<button
					aria-label={describeSound(key)}
					className={cn(
						"size-9 cursor-pointer rounded-md border bg-background font-display text-lg leading-none outline-none transition-opacity hover:border-primary hover:bg-background-strong focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
						dimmedUnless && !dimmedUnless.has(key.id) && "opacity-30",
					)}
					key={key.id}
					onClick={() => onInsert(key)}
					type="button"
				>
					{key.ipa}
				</button>
			))}
		</div>
	);
}
