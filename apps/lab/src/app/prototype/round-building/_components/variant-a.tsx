"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * Variant A — "Focus": one round on screen at a time, palette permanently
 * docked at the bottom like a phone keyboard.
 *
 * Decisions this variant is arguing for:
 * - Round navigation is a pill strip you can jump around in; revision means
 *   travelling back to a round.
 * - The palette is always visible, never summoned. Its cost is vertical space.
 * - Search FILTERS THE PALETTE IN PLACE, so keys keep their position.
 * - The tap conflict (insert vs. learn) is resolved by an explicit mode toggle.
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { Input } from "@phonaria/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { ArrowLeft, ArrowRight, Delete, GraduationCap, Search, X } from "lucide-react";
import { useState } from "react";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import { cn } from "@/lib/utils";
import {
	CONSONANT_KEYS,
	matchesQuery,
	PROTOTYPE_SESSION,
	ROUND_COUNT,
	SEARCH_INDEX,
	type SearchableKey,
	VOWEL_KEYS,
} from "../_lib/palette";
import { useSessionDraft } from "../_lib/use-session-draft";
import { PhonemeChip } from "./phoneme-chip";

const searchable = new Map(SEARCH_INDEX.map((key) => [key.id, key]));

function asSearchable(id: EnglishPhonemeSymbolId): SearchableKey {
	const key = searchable.get(id);
	if (!key) throw new Error(`Unknown key ${id}`);
	return key;
}

export function VariantA() {
	const [round, setRound] = useState(0);
	const [mode, setMode] = useState<"insert" | "learn">("insert");
	const [query, setQuery] = useState("");
	const { drafts, append, removeLast, clear, filledCount } = useSessionDraft();

	const current = PROTOTYPE_SESSION[round];
	const draft = drafts[round];
	const isLast = round === ROUND_COUNT - 1;

	return (
		<div className="flex flex-1 flex-col pb-64">
			{/* Round strip */}
			<div className="sticky top-0 z-20 flex items-center justify-center gap-1.5 border-b bg-background px-4 py-3">
				{PROTOTYPE_SESSION.map((entry, index) => (
					<button
						className={cn(
							"h-8 w-12 cursor-pointer rounded-md border font-medium text-xs transition-colors",
							index === round
								? "border-primary bg-primary text-primary-foreground"
								: drafts[index].length > 0
									? "border-success bg-background text-success"
									: "bg-background-soft text-muted-foreground",
						)}
						key={entry.word}
						onClick={() => setRound(index)}
						type="button"
					>
						{index + 1}
					</button>
				))}
			</div>

			{/* Focused round */}
			<div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
				<div className="flex flex-col items-center gap-1">
					<span className="text-muted-foreground text-xs uppercase tracking-wide">
						Round {round + 1} of {ROUND_COUNT} · {current.syllables} syllables
					</span>
					<h2 className="font-bold font-display text-4xl tracking-tight sm:text-5xl">
						{current.word}
					</h2>
				</div>

				<div className="flex min-h-14 w-full max-w-xl flex-wrap items-center justify-center gap-1.5 rounded-xl border bg-background-soft p-2">
					<span className="font-display text-2xl text-muted-foreground">/</span>
					{draft.map((id, index) => (
						<PhonemeChip id={id} key={`${id}-${index}`} />
					))}
					<span className="h-8 w-0.5 animate-pulse bg-primary" />
					<span className="font-display text-2xl text-muted-foreground">/</span>
				</div>

				<div className="flex items-center gap-2">
					<Button disabled={draft.length === 0} onClick={() => removeLast(round)} variant="outline">
						<Delete /> Backspace
					</Button>
					<Button disabled={draft.length === 0} onClick={() => clear(round)} variant="ghost">
						<X /> Clear
					</Button>
				</div>

				<div className="flex items-center gap-2">
					<Button
						disabled={round === 0}
						onClick={() => setRound((r) => r - 1)}
						size="lg"
						variant="outline"
					>
						<ArrowLeft /> Previous
					</Button>
					{isLast ? (
						<Button size="lg">
							Submit session ({filledCount}/{ROUND_COUNT})
						</Button>
					) : (
						<Button onClick={() => setRound((r) => r + 1)} size="lg">
							Next <ArrowRight />
						</Button>
					)}
				</div>
			</div>

			{/* Docked palette */}
			<div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background px-3 pt-2 pb-16">
				<div className="mx-auto flex max-w-3xl flex-col gap-2">
					<div className="flex items-center gap-2">
						<div className="relative flex-1">
							<Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								className="pl-8"
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Filter sounds — try “schwa”, “cat”, “SH”"
								value={query}
							/>
						</div>
						<Button
							aria-pressed={mode === "learn"}
							onClick={() => setMode((m) => (m === "insert" ? "learn" : "insert"))}
							variant={mode === "learn" ? "default" : "outline"}
						>
							<GraduationCap /> {mode === "learn" ? "Learn mode" : "Learn"}
						</Button>
					</div>

					<PaletteRow
						keys={CONSONANT_KEYS.map((key) => asSearchable(key.id))}
						label="Consonants"
						mode={mode}
						onInsert={(id) => append(round, id)}
						query={query}
					/>
					<PaletteRow
						keys={VOWEL_KEYS.map((key) => asSearchable(key.id))}
						label="Vowels"
						mode={mode}
						onInsert={(id) => append(round, id)}
						query={query}
					/>
				</div>
			</div>
		</div>
	);
}

function PaletteRow({
	label,
	keys,
	query,
	mode,
	onInsert,
}: {
	label: string;
	keys: SearchableKey[];
	query: string;
	mode: "insert" | "learn";
	onInsert: (id: EnglishPhonemeSymbolId) => void;
}) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-muted-foreground text-xs">{label}</span>
			<div className="flex flex-wrap gap-1">
				{keys.map((key) => {
					const dimmed = !matchesQuery(key, query);

					if (mode === "learn") {
						return (
							<Popover key={key.id}>
								<PopoverTrigger
									render={
										<button
											className={cn(
												"size-9 cursor-pointer rounded-md border bg-background font-display text-lg leading-none transition-opacity data-popup-open:border-primary",
												dimmed && "opacity-32",
											)}
											type="button"
										/>
									}
								>
									{key.ipa}
								</PopoverTrigger>
								<PopoverContent side="top" sideOffset={8}>
									<PhonemePopoverContent phonemeId={key.id} />
								</PopoverContent>
							</Popover>
						);
					}

					return (
						<button
							className={cn(
								"size-9 cursor-pointer rounded-md border bg-background font-display text-lg leading-none transition-opacity hover:border-primary hover:bg-background-strong",
								dimmed && "opacity-32",
							)}
							key={key.id}
							onClick={() => onInsert(key.id)}
							title={key.label}
							type="button"
						>
							{key.ipa}
						</button>
					);
				})}
			</div>
		</div>
	);
}
