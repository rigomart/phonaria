"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * Variant B — "Worksheet": the whole session is one page. Five rows, always all
 * visible; the palette is a summoned drawer shaped like the real IPA chart.
 *
 * Decisions this variant is arguing for:
 * - There is NO round navigation. Revision is just clicking another row, and
 *   session progress needs no indicator because you can see it.
 * - The palette is the IPA chart, not a keyboard — the place/manner grid the
 *   learner already browses in Lab, reused as the input surface.
 * - Search DIMS rather than reorders, so the chart keeps its spatial meaning.
 * - The tap conflict is resolved by a "Tap to" switch in the drawer header.
 */

import type { ConsonantSymbolId, EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import {
	getConsonantArticulationRegistryForLanguage,
	getIpaForPhonemeId,
	getLanguagePhonemeIds,
} from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { Input } from "@phonaria/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { ScrollArea, ScrollBar } from "@phonaria/ui/components/scroll-area";
import { ChevronDown, Delete, Search } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import { cn } from "@/lib/utils";
import {
	getCellKey,
	MANNER_LABELS,
	MANNER_ORDER,
	type MannerOfArticulation,
	PLACE_LABELS,
	PLACE_ORDER,
	type PlaceOfArticulation,
} from "../../../ipa-chart/_lib/consonant-grid";
import {
	DIPHTHONG_KEYS,
	MONOPHTHONG_KEYS,
	matchesQuery,
	PROTOTYPE_SESSION,
	SEARCH_INDEX,
	type SearchableKey,
} from "../_lib/palette";
import { useSessionDraft } from "../_lib/use-session-draft";
import { PhonemeChip } from "./phoneme-chip";

const searchable = new Map(SEARCH_INDEX.map((key) => [key.id, key]));

type TapMode = "add" | "explain";

export function VariantB() {
	const [activeRound, setActiveRound] = useState(0);
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [tapMode, setTapMode] = useState<TapMode>("add");
	const [query, setQuery] = useState("");
	const { drafts, append, removeLast, filledCount } = useSessionDraft();

	return (
		<div className="flex flex-1 flex-col">
			<div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-80">
				<div className="mb-6 flex flex-col gap-1">
					<h2 className="font-bold font-display text-2xl tracking-tight">Schwa · session 1</h2>
					<p className="text-muted-foreground text-sm">
						Build the sounds of all five words, in any order. Nothing is checked until you submit.
					</p>
				</div>

				<div className="divide-y rounded-xl border bg-background">
					{PROTOTYPE_SESSION.map((entry, index) => {
						const isActive = index === activeRound;
						const draft = drafts[index];

						const activate = () => {
							setActiveRound(index);
							setDrawerOpen(true);
						};

						return (
							// biome-ignore lint/a11y/useSemanticElements: prototype — the row wraps its own buttons
							<div
								className={cn(
									"flex w-full cursor-pointer flex-col gap-2 p-3 text-left transition-colors sm:flex-row sm:items-center sm:gap-4",
									isActive ? "bg-background-soft" : "hover:bg-background-soft",
								)}
								key={entry.word}
								onClick={activate}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") activate();
								}}
								role="button"
								tabIndex={0}
							>
								<div className="flex w-40 shrink-0 flex-col">
									<span className="font-display font-semibold text-lg">{entry.word}</span>
									<span className="text-muted-foreground text-xs">{entry.syllables} syllables</span>
								</div>

								<div
									className={cn(
										"flex min-h-12 flex-1 flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1",
										isActive ? "border-primary bg-background" : "border-transparent",
									)}
								>
									{draft.length === 0 && (
										<span className="text-muted-foreground text-sm">
											{isActive ? "Pick sounds below…" : "Empty"}
										</span>
									)}
									{draft.map((id, chipIndex) => (
										<PhonemeChip className="h-9" id={id} key={`${id}-${chipIndex}`} />
									))}
									{isActive && draft.length > 0 && (
										<span className="h-7 w-0.5 animate-pulse bg-primary" />
									)}
								</div>

								{isActive && draft.length > 0 && (
									<Button
										onClick={(event) => {
											event.stopPropagation();
											removeLast(index);
										}}
										size="icon"
										variant="ghost"
									>
										<Delete />
									</Button>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Sticky submit */}
			<div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background px-4 pt-2 pb-16">
				<div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
					<span className="text-muted-foreground text-sm">
						{filledCount} of {PROTOTYPE_SESSION.length} words started
					</span>
					<div className="flex items-center gap-2">
						<Button onClick={() => setDrawerOpen((open) => !open)} variant="outline">
							{drawerOpen ? "Hide sounds" : "Show sounds"}
							<ChevronDown className={cn("transition-transform", drawerOpen && "rotate-180")} />
						</Button>
						<Button>Submit session</Button>
					</div>
				</div>
			</div>

			{/* Chart drawer */}
			{drawerOpen && (
				<div className="fixed inset-x-0 bottom-28 z-10 border-t bg-background-soft shadow-lg">
					<div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-3">
						<div className="flex flex-wrap items-center gap-2">
							<span className="mr-auto font-medium text-sm">
								Sounds → <span className="font-display">{PROTOTYPE_SESSION[activeRound].word}</span>
							</span>
							<div className="relative">
								<Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="w-56 pl-8"
									onChange={(event) => setQuery(event.target.value)}
									placeholder="Find a sound…"
									value={query}
								/>
							</div>
							<div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
								<span className="px-1.5 text-muted-foreground text-xs">Tap to</span>
								{(["add", "explain"] as TapMode[]).map((mode) => (
									<button
										className={cn(
											"cursor-pointer rounded-md px-2 py-1 text-xs capitalize transition-colors",
											tapMode === mode
												? "bg-primary text-primary-foreground"
												: "text-muted-foreground",
										)}
										key={mode}
										onClick={() => setTapMode(mode)}
										type="button"
									>
										{mode}
									</button>
								))}
							</div>
						</div>

						<ScrollArea className="w-full">
							<ConsonantGridPalette
								onAdd={(id) => append(activeRound, id)}
								query={query}
								tapMode={tapMode}
							/>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>

						<div className="flex flex-wrap gap-4">
							<VowelGroup
								keys={MONOPHTHONG_KEYS}
								label="Monophthongs"
								onAdd={(id) => append(activeRound, id)}
								query={query}
								tapMode={tapMode}
							/>
							<VowelGroup
								keys={DIPHTHONG_KEYS}
								label="Diphthongs"
								onAdd={(id) => append(activeRound, id)}
								query={query}
								tapMode={tapMode}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

interface CellPhoneme {
	id: ConsonantSymbolId;
	ipa: string;
	voicing: string;
	manner: MannerOfArticulation;
	place: PlaceOfArticulation;
}

function ConsonantGridPalette({
	query,
	tapMode,
	onAdd,
}: {
	query: string;
	tapMode: TapMode;
	onAdd: (id: EnglishPhonemeSymbolId) => void;
}) {
	const { cells, mannerOrder, placeOrder } = useMemo(() => {
		const registry = getConsonantArticulationRegistryForLanguage("en-us");
		const ids = getLanguagePhonemeIds("en-us", "consonants");
		const map = new Map<string, CellPhoneme[]>();
		const usedManners = new Set<MannerOfArticulation>();
		const usedPlaces = new Set<PlaceOfArticulation>();

		for (const id of ids) {
			const { manner, place, voicing } = registry[id].features;
			const key = getCellKey(manner, place);
			map.set(key, [
				...(map.get(key) ?? []),
				{ id: id as ConsonantSymbolId, ipa: getIpaForPhonemeId(id), voicing, manner, place },
			]);
			usedManners.add(manner);
			usedPlaces.add(place);
		}

		return {
			cells: map,
			mannerOrder: MANNER_ORDER.filter((manner) => usedManners.has(manner)),
			placeOrder: PLACE_ORDER.filter((place) => usedPlaces.has(place)),
		};
	}, []);

	return (
		<div
			className="inline-grid min-w-max gap-1"
			style={{ gridTemplateColumns: `auto repeat(${placeOrder.length}, minmax(3.5rem, 1fr))` }}
		>
			<div />
			{placeOrder.map((place) => (
				<div className="pb-0.5 text-center text-[0.625rem] text-muted-foreground" key={place}>
					{PLACE_LABELS[place]}
				</div>
			))}
			{mannerOrder.map((manner) => (
				<Fragment key={manner}>
					<div className="flex items-center pr-2 text-muted-foreground text-xs">
						{MANNER_LABELS[manner]}
					</div>
					{placeOrder.map((place) => {
						const cell = cells.get(getCellKey(manner, place)) ?? [];
						return (
							<div
								className="flex items-center justify-center gap-0.5 rounded-md bg-background p-0.5"
								key={place}
							>
								{cell.map((phoneme) => (
									<PaletteButton
										id={phoneme.id as EnglishPhonemeSymbolId}
										ipa={phoneme.ipa}
										key={phoneme.id}
										onAdd={onAdd}
										query={query}
										tapMode={tapMode}
									/>
								))}
							</div>
						);
					})}
				</Fragment>
			))}
		</div>
	);
}

function VowelGroup({
	label,
	keys,
	query,
	tapMode,
	onAdd,
}: {
	label: string;
	keys: SearchableKey[] | { id: EnglishPhonemeSymbolId; ipa: string }[];
	query: string;
	tapMode: TapMode;
	onAdd: (id: EnglishPhonemeSymbolId) => void;
}) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-[0.625rem] text-muted-foreground">{label}</span>
			<div className="flex flex-wrap gap-1 rounded-md bg-background p-1">
				{keys.map((key) => (
					<PaletteButton
						id={key.id}
						ipa={key.ipa}
						key={key.id}
						onAdd={onAdd}
						query={query}
						tapMode={tapMode}
					/>
				))}
			</div>
		</div>
	);
}

function PaletteButton({
	id,
	ipa,
	query,
	tapMode,
	onAdd,
}: {
	id: EnglishPhonemeSymbolId;
	ipa: string;
	query: string;
	tapMode: TapMode;
	onAdd: (id: EnglishPhonemeSymbolId) => void;
}) {
	const key = searchable.get(id);
	const dimmed = key ? !matchesQuery(key, query) : false;
	const className = cn(
		"size-8 cursor-pointer rounded-md border bg-background font-display text-base leading-none transition-opacity hover:border-primary data-popup-open:border-primary",
		dimmed && "opacity-32",
	);

	if (tapMode === "explain") {
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
		<button className={className} onClick={() => onAdd(id)} title={key?.label ?? ipa} type="button">
			{ipa}
		</button>
	);
}
