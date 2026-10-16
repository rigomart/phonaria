"use client";

import { Autocomplete, AutocompleteInput } from "@phonaria/ui/components/autocomplete";
import { Button } from "@phonaria/ui/components/button";
import { ButtonGroup } from "@phonaria/ui/components/button-group";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@phonaria/ui/components/input-group";
import { Spinner } from "@phonaria/ui/components/spinner";
import { SendHorizontal, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SpellingSuggestionLine } from "@/components/transcription/spelling-suggestion-line";
import { useSubmitTranscription } from "@/hooks/use-submit-transcription";
import { useCurrentTranscription } from "@/hooks/use-transcribe";
import { useTranscriptionHistory } from "@/hooks/use-transcription-history";
import { useG2PStore } from "@/lib/transcription/g2p-store";
import {
	historyEntryKey,
	suggestHistory,
	type TranscriptionHistoryEntry,
} from "@/lib/transcription/history";
import { TRANSCRIPTION_INPUT_MAX_LENGTH } from "@/lib/transcription/search";
import { cn } from "@/lib/utils";
import { CopyButton } from "./display/copy-button";
import { TranscriptionInfoButton } from "./display/info-button";
import { HistoryPopup } from "./history-popup";

const CHARACTER_COUNT_VISIBLE_FROM = 0.8;
const CHARACTER_COUNT_WARNING_FROM = 0.9;

interface G2PInputFormProps {
	maxLength?: number;
}

export function G2PInputForm({ maxLength = TRANSCRIPTION_INPUT_MAX_LENGTH }: G2PInputFormProps) {
	const inputText = useG2PStore((state) => state.draftText);
	const setDraftText = useG2PStore((state) => state.setDraftText);
	const { submit, clear, isPending } = useSubmitTranscription();
	const { data: transcriptionResult } = useCurrentTranscription();
	const inputRef = useRef<HTMLInputElement>(null);
	const inputGroupRef = useRef<HTMLDivElement>(null);
	const submitRef = useRef<HTMLButtonElement>(null);
	const historyFooterRef = useRef<HTMLDivElement>(null);
	// Set while focus returns to the field after the list closed, so it stays closed.
	const keepHistoryClosed = useRef(false);
	const history = useTranscriptionHistory();
	const [historyOpen, setHistoryOpen] = useState(false);
	const highlightedEntry = useRef<TranscriptionHistoryEntry | undefined>(undefined);

	useLayoutEffect(() => {
		// A fill or autofill can write the field before React attaches onChange.
		// React keeps that DOM value. Copy it only into an empty draft: a shared
		// ?q= or a restored submission may already own the store.
		const current = inputRef.current?.value ?? "";
		if (current.length > 0 && useG2PStore.getState().draftText.length === 0) {
			setDraftText(current);
		}
	}, [setDraftText]);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (
				event.metaKey ||
				event.ctrlKey ||
				event.altKey ||
				event.key === "Escape" ||
				event.key === "Tab"
			) {
				return;
			}

			const active = document.activeElement;
			const hasFocusedControl =
				active instanceof HTMLElement &&
				active !== document.body &&
				active !== document.documentElement;

			if (!hasFocusedControl && event.key.length === 1) {
				inputRef.current?.focus();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const hasText = inputText.trim().length > 0;
	const showClear = inputText.length > 0;
	const characterCount = inputText.length;
	const showCharacterCount = characterCount >= maxLength * CHARACTER_COUNT_VISIBLE_FROM;
	const characterCountIsHigh = characterCount >= maxLength * CHARACTER_COUNT_WARNING_FROM;
	// While the result for the text in the field is showing, there is nothing to suggest.
	const showingResultForDraft =
		transcriptionResult != null &&
		historyEntryKey(transcriptionResult.originalText) === historyEntryKey(inputText);
	const suggestions = showingResultForDraft ? [] : suggestHistory(history.entries, inputText);
	const historyVisible = historyOpen && !isPending && suggestions.length > 0;

	const focusInput = () => {
		inputRef.current?.focus();
	};

	const focusInputWithHistoryClosed = () => {
		keepHistoryClosed.current = true;
		focusInput();
		keepHistoryClosed.current = false;
	};

	const clearDraft = () => {
		clear();
		focusInput();
		requestAnimationFrame(focusInput);
	};

	const handleClear = () => {
		clearDraft();
		setHistoryOpen(true);
	};

	const handleValueChange = (value: string, details: { reason: string }) => {
		if (details.reason === "item-press") {
			submit(value);
			return;
		}
		// The input's keydown handles Escape.
		if (details.reason === "escape-key") return;
		setDraftText(value);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		// The DOM value is what Enter submits. It can be ahead of React state when
		// the learner types before hydration finishes.
		const text = inputRef.current?.value ?? inputText;
		if (text.trim().length > 0 && !isPending) submit(text);
	};

	const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		// With the list open, Escape only closes it. Checked against the open state
		// rather than left to Base UI, which ignores Escape until the closing
		// animation ends, so a quick second press would do nothing.
		if (event.key === "Escape") {
			if (!event.nativeEvent.isComposing && !historyVisible && showClear) {
				event.preventDefault();
				clearDraft();
			}
			return;
		}
		// The list's footer is portaled, so Tab would skip it.
		if (event.key === "Tab" && !event.shiftKey && historyVisible) {
			const footerButton = historyFooterRef.current?.querySelector("button");
			if (footerButton) {
				event.preventDefault();
				footerButton.focus();
				return;
			}
		}
		const entry = highlightedEntry.current;
		const isRemoveKey = event.key === "Delete" || event.key === "Backspace";
		if (!event.shiftKey || !isRemoveKey || !historyVisible || !entry) return;
		event.preventDefault();
		history.remove(entry.text);
	};

	return (
		// method="get" lets Enter reach /?q= before React hydrates. aria-disabled
		// (not disabled) keeps that key from being swallowed while the draft is empty.
		<form method="get" action="/" onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
			<div className="flex w-full flex-row gap-2">
				<Autocomplete
					items={suggestions}
					filter={null}
					itemToStringValue={(entry: TranscriptionHistoryEntry) => entry.text}
					value={inputText}
					onValueChange={handleValueChange}
					open={historyVisible}
					onOpenChange={setHistoryOpen}
					openOnInputClick
					onItemHighlighted={(entry) => {
						highlightedEntry.current = entry;
					}}
					disabled={isPending}
				>
					<InputGroup ref={inputGroupRef} className="h-10 flex-1">
						<AutocompleteInput
							ref={inputRef}
							render={<InputGroupInput />}
							onFocus={() => {
								if (!keepHistoryClosed.current) setHistoryOpen(true);
							}}
							onKeyDown={handleInputKeyDown}
							placeholder="Type a word or phrase..."
							disabled={isPending}
							name="q"
							maxLength={maxLength}
							aria-label="Text to transcribe"
						/>
						{showClear ? (
							<InputGroupAddon align="inline-end">
								<InputGroupButton
									size="icon-xs"
									aria-label="Clear text"
									onMouseDown={(event) => event.preventDefault()}
									onClick={handleClear}
								>
									<X />
								</InputGroupButton>
							</InputGroupAddon>
						) : null}
					</InputGroup>
					<HistoryPopup
						anchor={inputGroupRef}
						footerRef={historyFooterRef}
						onRemove={history.remove}
						onClear={() => {
							history.clear();
							focusInputWithHistoryClosed();
						}}
						onFocusInput={focusInput}
						onEscape={focusInputWithHistoryClosed}
						onTabOut={() => {
							setHistoryOpen(false);
							submitRef.current?.focus();
						}}
					/>
				</Autocomplete>

				<Button
					ref={submitRef}
					type="submit"
					size="icon-lg"
					disabled={isPending}
					aria-disabled={!hasText || isPending}
					className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
					aria-label="Transcribe text"
				>
					{isPending ? <Spinner /> : <SendHorizontal />}
				</Button>
			</div>

			{transcriptionResult || showCharacterCount ? (
				<div className="flex items-center gap-3">
					{transcriptionResult ? (
						<div
							className="shrink-0 animate-in fade-in duration-500 fill-mode-both"
							style={{
								animationDelay: `${transcriptionResult.words.length * 50 + 400}ms`,
							}}
						>
							<ButtonGroup>
								<TranscriptionInfoButton />
								<CopyButton result={transcriptionResult} />
							</ButtonGroup>
						</div>
					) : null}
					{transcriptionResult ? <SpellingSuggestionLine /> : null}
					{showCharacterCount ? (
						<span
							className={cn(
								"ml-auto shrink-0 text-xs font-medium tabular-nums",
								characterCountIsHigh ? "text-warning-foreground" : "text-muted-foreground",
							)}
						>
							{characterCount}/{maxLength}
						</span>
					) : null}
				</div>
			) : null}
		</form>
	);
}
