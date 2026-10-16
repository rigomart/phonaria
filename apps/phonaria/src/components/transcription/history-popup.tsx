"use client";

import {
	AutocompleteContent,
	AutocompleteItem,
	AutocompleteList,
} from "@phonaria/ui/components/autocomplete";
import { Button } from "@phonaria/ui/components/button";
import { Trash2Icon, XIcon } from "lucide-react";
import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import type { TranscriptionHistoryEntry } from "@/lib/transcription/history";

/** Keeps focus in the field, so the list stays open while its buttons are used. */
const keepInputFocus = (event: React.PointerEvent | React.MouseEvent) => event.preventDefault();

/**
 * Recent transcriptions under the input. Picking one submits it. Each row can
 * be removed with its button or Shift+Delete, which the input handles.
 *
 * The footer is portaled away from the input, so the input sends Tab into it
 * (`footerRef`) and the footer hands focus back: Shift+Tab with `onFocusInput`,
 * Escape with `onEscape`, and Tab past its last button with `onTabOut`.
 */
export function HistoryPopup({
	anchor,
	footerRef,
	onRemove,
	onClear,
	onFocusInput,
	onEscape,
	onTabOut,
}: {
	anchor: RefObject<HTMLElement | null>;
	footerRef: RefObject<HTMLDivElement | null>;
	onRemove: (text: string) => void;
	onClear: () => void;
	onFocusInput: () => void;
	onEscape: () => void;
	onTabOut: () => void;
}) {
	return (
		// Always below, like a search box: the title animating in after Clear would
		// otherwise flip it above the field. Phones get a shorter list so it clears
		// the on-screen keyboard.
		<AutocompleteContent
			anchor={anchor}
			collisionAvoidance={{ side: "none" }}
			className="max-h-[min(var(--available-height),--spacing(80))] sm:max-h-(--available-height)"
		>
			<AutocompleteList aria-label="Recent transcriptions">
				{(entry: TranscriptionHistoryEntry) => (
					<AutocompleteItem
						key={entry.text}
						value={entry}
						className="group/history-item py-2 pe-1.5"
					>
						<span className="flex min-w-0 flex-1 flex-col gap-0.5">
							<span className="truncate font-medium">{entry.text}</span>
							{entry.ipa ? (
								<span className="truncate text-muted-foreground">/{entry.ipa}/</span>
							) : null}
						</span>
						<Button
							variant="ghost"
							size="icon-sm"
							tabIndex={-1}
							aria-label={`Remove "${entry.text}" from history`}
							className="text-muted-foreground opacity-0 hover:text-foreground group-hover/history-item:opacity-100 group-data-highlighted/history-item:opacity-100 pointer-coarse:opacity-100"
							onClick={(event) => {
								event.stopPropagation();
								onRemove(entry.text);
							}}
						>
							<XIcon aria-hidden />
						</Button>
					</AutocompleteItem>
				)}
			</AutocompleteList>
			<HistoryFooter
				ref={footerRef}
				onClear={onClear}
				onFocusInput={onFocusInput}
				onEscape={onEscape}
				onTabOut={onTabOut}
			/>
		</AutocompleteContent>
	);
}

/** Asks inline before clearing, so one stray click cannot empty the history. */
function HistoryFooter({
	ref,
	onClear,
	onFocusInput,
	onEscape,
	onTabOut,
}: {
	ref: RefObject<HTMLDivElement | null>;
	onClear: () => void;
	onFocusInput: () => void;
	onEscape: () => void;
	onTabOut: () => void;
}) {
	const [confirming, setConfirming] = useState(false);
	// The buttons swap when confirming starts or ends. A keyboard user's focus
	// moves to the new first button instead of falling to the page.
	const refocus = useRef(false);

	useLayoutEffect(() => {
		if (!refocus.current) return;
		refocus.current = false;
		ref.current?.querySelector("button")?.focus();
	}, [confirming, ref]);

	const changeConfirming = (next: boolean) => {
		refocus.current = !!ref.current?.contains(document.activeElement);
		setConfirming(next);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === "Escape") {
			onEscape();
			return;
		}
		if (event.key !== "Tab") return;
		const buttons = Array.from(ref.current?.querySelectorAll("button") ?? []);
		if (event.currentTarget !== (event.shiftKey ? buttons[0] : buttons.at(-1))) return;
		event.preventDefault();
		if (event.shiftKey) onFocusInput();
		else onTabOut();
	};

	return (
		<div
			ref={ref}
			className="flex min-h-12 shrink-0 items-center justify-between gap-2 border-t ps-4 pe-2 py-1.5"
		>
			{confirming ? (
				<>
					<p className="text-sm text-foreground">Clear all history?</p>
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							onPointerDown={keepInputFocus}
							onMouseDown={keepInputFocus}
							onKeyDown={handleKeyDown}
							onClick={() => changeConfirming(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onPointerDown={keepInputFocus}
							onMouseDown={keepInputFocus}
							onKeyDown={handleKeyDown}
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
					<p className="text-xs text-muted-foreground">Saved in this browser</p>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground hover:text-foreground"
						onPointerDown={keepInputFocus}
						onMouseDown={keepInputFocus}
						onKeyDown={handleKeyDown}
						onClick={() => changeConfirming(true)}
					>
						<Trash2Icon data-icon="inline-start" aria-hidden />
						Clear history
					</Button>
				</>
			)}
		</div>
	);
}
