"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * Variant C — "Compose": typing is the primary way to build a sequence. The
 * palette is an escape hatch behind a disclosure, and submission goes through
 * an explicit review step.
 *
 * Decisions this variant is arguing for:
 * - A beginner types what they hear ("schwa", "uh", "sh", "cat") and picks from
 *   a ranked list. Search is the main road, not an accessory to the palette.
 * - Round navigation is minimal (‹ 3 of 5 ›). Whole-session revision happens in
 *   a dedicated review step rather than by travelling between rounds.
 * - Assistance comes from the answer you already built: every committed chip
 *   opens the popover, so there is no insert/learn tap conflict at all.
 * - You cannot submit straight from a round; you must pass the review panel.
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { ChevronDown, ChevronLeft, ChevronRight, Delete, Pencil } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
	CONSONANT_KEYS,
	PROTOTYPE_SESSION,
	ROUND_COUNT,
	searchKeys,
	VOWEL_KEYS,
} from "../_lib/palette";
import { useSessionDraft } from "../_lib/use-session-draft";
import { PhonemeChip } from "./phoneme-chip";

export function VariantC() {
	const [round, setRound] = useState(0);
	const [reviewing, setReviewing] = useState(false);
	const { drafts, append, removeLast, removeAt, filledCount } = useSessionDraft();

	if (reviewing) {
		return (
			<ReviewStep
				drafts={drafts}
				filledCount={filledCount}
				onEdit={(index) => {
					setRound(index);
					setReviewing(false);
				}}
				onBack={() => setReviewing(false)}
			/>
		);
	}

	const current = PROTOTYPE_SESSION[round];

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 pb-32">
			{/* Minimal round nav */}
			<div className="flex items-center justify-between">
				<Button
					disabled={round === 0}
					onClick={() => setRound((r) => r - 1)}
					size="icon"
					variant="ghost"
				>
					<ChevronLeft />
				</Button>
				<div className="flex flex-col items-center gap-1.5">
					<span className="text-muted-foreground text-xs">
						{round + 1} of {ROUND_COUNT}
					</span>
					<div className="flex gap-1">
						{drafts.map((draft, index) => (
							<span
								className={cn(
									"h-1 w-6 rounded-full",
									index === round
										? "bg-primary"
										: draft.length > 0
											? "bg-success"
											: "bg-background-strong",
								)}
								key={PROTOTYPE_SESSION[index].word}
							/>
						))}
					</div>
				</div>
				<Button
					disabled={round === ROUND_COUNT - 1}
					onClick={() => setRound((r) => r + 1)}
					size="icon"
					variant="ghost"
				>
					<ChevronRight />
				</Button>
			</div>

			<div className="flex flex-col items-center gap-1">
				<h2 className="font-bold font-display text-4xl tracking-tight">{current.word}</h2>
				<span className="text-muted-foreground text-sm">{current.syllables} syllables</span>
			</div>

			<Composer
				draft={drafts[round]}
				onAppend={(id) => append(round, id)}
				onRemoveAt={(index) => removeAt(round, index)}
				onRemoveLast={() => removeLast(round)}
			/>

			<BrowseDisclosure onAppend={(id) => append(round, id)} />

			<div className="flex justify-center">
				<Button onClick={() => setReviewing(true)} size="lg" variant="outline">
					Review all {ROUND_COUNT} answers ({filledCount} filled)
				</Button>
			</div>
		</div>
	);
}

function Composer({
	draft,
	onAppend,
	onRemoveAt,
	onRemoveLast,
}: {
	draft: EnglishPhonemeSymbolId[];
	onAppend: (id: EnglishPhonemeSymbolId) => void;
	onRemoveAt: (index: number) => void;
	onRemoveLast: () => void;
}) {
	const [query, setQuery] = useState("");
	const [highlight, setHighlight] = useState(0);

	const matches = searchKeys(query).slice(0, 6);

	function commit(id: EnglishPhonemeSymbolId) {
		onAppend(id);
		setQuery("");
		setHighlight(0);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex min-h-16 flex-wrap items-center gap-1.5 rounded-xl border-2 border-primary bg-background p-2">
				{draft.map((id, index) => (
					<PhonemeChip id={id} key={`${id}-${index}`} onRemove={() => onRemoveAt(index)} />
				))}
				<input
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
				<ul className="overflow-hidden rounded-lg border bg-background">
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

			{draft.length > 0 && query === "" && (
				<div className="flex items-center gap-2 text-muted-foreground text-xs">
					<Delete className="size-3.5" /> Backspace deletes the last sound · click a sound for
					details
				</div>
			)}
		</div>
	);
}

function BrowseDisclosure({ onAppend }: { onAppend: (id: EnglishPhonemeSymbolId) => void }) {
	const [open, setOpen] = useState(false);

	return (
		<div className="rounded-xl border bg-background-soft">
			<button
				className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm"
				onClick={() => setOpen((value) => !value)}
				type="button"
			>
				Browse all 40 sounds
				<ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
			</button>
			{open && (
				<div className="flex flex-col gap-3 border-t px-3 py-3">
					{[
						{ label: "Consonants", keys: CONSONANT_KEYS },
						{ label: "Vowels", keys: VOWEL_KEYS },
					].map((group) => (
						<div className="flex flex-col gap-1" key={group.label}>
							<span className="text-muted-foreground text-xs">{group.label}</span>
							<div className="flex flex-wrap gap-1">
								{group.keys.map((key) => (
									<button
										className="size-9 cursor-pointer rounded-md border bg-background font-display text-lg leading-none hover:border-primary"
										key={key.id}
										onClick={() => onAppend(key.id)}
										title={key.label}
										type="button"
									>
										{key.ipa}
									</button>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function ReviewStep({
	drafts,
	filledCount,
	onEdit,
	onBack,
}: {
	drafts: EnglishPhonemeSymbolId[][];
	filledCount: number;
	onEdit: (index: number) => void;
	onBack: () => void;
}) {
	const complete = filledCount === ROUND_COUNT;

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-8 pb-32">
			<div className="flex flex-col gap-1">
				<h2 className="font-bold font-display text-2xl tracking-tight">Review before submitting</h2>
				<p className="text-muted-foreground text-sm">
					Nothing is graded yet. You can still change any answer.
				</p>
			</div>

			<div className="divide-y rounded-xl border bg-background">
				{PROTOTYPE_SESSION.map((entry, index) => (
					<div className="flex items-center gap-3 p-3" key={entry.word}>
						<span className="w-32 shrink-0 font-display font-semibold">{entry.word}</span>
						<div className="flex flex-1 flex-wrap items-center gap-1.5">
							{drafts[index].length === 0 ? (
								<span className="text-sm text-warning">Not answered</span>
							) : (
								drafts[index].map((id, chipIndex) => (
									<PhonemeChip className="h-9" id={id} key={`${id}-${chipIndex}`} />
								))
							)}
						</div>
						<Button onClick={() => onEdit(index)} size="sm" variant="ghost">
							<Pencil /> Edit
						</Button>
					</div>
				))}
			</div>

			{!complete && (
				<p className="text-sm text-warning">
					{ROUND_COUNT - filledCount} word(s) have no answer. Submitting now scores them as wrong.
				</p>
			)}

			<div className="flex items-center justify-between">
				<Button onClick={onBack} variant="ghost">
					<ChevronLeft /> Back to rounds
				</Button>
				<Button size="lg">Submit session</Button>
			</div>
		</div>
	);
}
