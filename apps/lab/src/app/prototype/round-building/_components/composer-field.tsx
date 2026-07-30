"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * The one thing all four variants agree on: the field you type into and the
 * chips you have placed. What differs between variants is where the palette
 * lives and how much visual weight it carries — not this.
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { X } from "lucide-react";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import { cn } from "@/lib/utils";
import { getPaletteKey } from "../_lib/palette";
import type { Composer } from "../_lib/use-composer";

interface ComposerFieldProps {
	composer: Composer;
	draft: EnglishPhonemeSymbolId[];
	onRemoveAt: (index: number) => void;
	className?: string;
}

export function ComposerField({ composer, draft, onRemoveAt, className }: ComposerFieldProps) {
	const { query, setQuery, matches, highlight, setHighlight, commit, onFieldKeyDown } = composer;

	return (
		<div className={cn("relative", className)}>
			<div className="flex min-h-16 flex-wrap items-center gap-1.5 rounded-xl border bg-background px-2 py-1.5 focus-within:border-primary">
				{draft.map((id, index) => (
					<PlacedChip id={id} key={`${id}-${index}`} onRemove={() => onRemoveAt(index)} />
				))}
				<input
					// biome-ignore lint/a11y/noAutofocus: prototype — typing is the primary affordance
					autoFocus
					className="min-w-40 flex-1 bg-transparent px-1 py-2 text-base outline-none placeholder:text-muted-foreground"
					onChange={(event) => setQuery(event.target.value)}
					onKeyDown={onFieldKeyDown}
					placeholder={draft.length === 0 ? "Type a sound — “schwa”, “sh”, “cat”…" : ""}
					value={query}
				/>
			</div>

			{matches.length > 0 && (
				<ul className="absolute inset-x-0 top-full z-40 mt-1 overflow-hidden rounded-xl border bg-background shadow-lg">
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
	);
}

function PlacedChip({ id, onRemove }: { id: EnglishPhonemeSymbolId; onRemove: () => void }) {
	const key = getPaletteKey(id);

	return (
		<span className="group inline-flex h-10 items-center overflow-hidden rounded-lg border bg-background-soft">
			<Popover>
				<PopoverTrigger
					render={
						<button
							aria-label={`Details for ${key.ipa}`}
							className="h-full cursor-pointer px-2.5 font-display text-xl leading-none data-popup-open:bg-background-strong"
							type="button"
						/>
					}
				>
					{key.ipa}
				</PopoverTrigger>
				<PopoverContent sideOffset={8}>
					<PhonemePopoverContent phonemeId={id} />
				</PopoverContent>
			</Popover>
			<button
				aria-label={`Remove ${key.ipa}`}
				className="flex h-full cursor-pointer items-center px-1 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
				onClick={onRemove}
				type="button"
			>
				<X className="size-3" />
			</button>
		</span>
	);
}
