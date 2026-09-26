"use client";

import { Button } from "@phonaria/ui/components/button";
import { ButtonGroup, ButtonGroupSeparator } from "@phonaria/ui/components/group";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@phonaria/ui/components/input-group";
import { Loader2, SendHorizontal, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { SpellingSuggestionLine } from "@/components/transcription/spelling-suggestion-line";
import { useSubmitTranscription } from "@/hooks/use-submit-transcription";
import { useCurrentTranscription } from "@/hooks/use-transcribe";
import { useG2PStore } from "@/lib/transcription/g2p-store";
import { TRANSCRIPTION_INPUT_MAX_LENGTH } from "@/lib/transcription/search";
import { cn } from "@/lib/utils";
import { CopyButton } from "./display/copy-button";
import { TranscriptionInfoButton } from "./display/info-button";

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

	const focusInput = () => {
		inputRef.current?.focus();
	};

	const handleClear = () => {
		clear();
		focusInput();
		requestAnimationFrame(focusInput);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		// The DOM value is what Enter submits. It can be ahead of React state when
		// the learner types before hydration finishes.
		const text = inputRef.current?.value ?? inputText;
		if (text.trim().length > 0 && !isPending) submit(text);
	};

	const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Escape" || event.nativeEvent.isComposing || !showClear) return;
		event.preventDefault();
		handleClear();
	};

	return (
		// method="get" lets Enter reach /?q= before React hydrates. aria-disabled
		// (not disabled) keeps that key from being swallowed while the draft is empty.
		<form method="get" action="/" onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
			<div className="flex w-full flex-row gap-2">
				<InputGroup className="flex-1">
					<InputGroupInput
						ref={inputRef}
						value={inputText}
						onChange={(event) => setDraftText(event.target.value)}
						onKeyDown={handleInputKeyDown}
						placeholder="Type a word or phrase..."
						disabled={isPending}
						name="q"
						size="lg"
						maxLength={maxLength}
						aria-label="Text to transcribe"
					/>
					{showClear ? (
						<InputGroupAddon align="inline-end">
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								className="text-muted-foreground"
								aria-label="Clear text"
								onMouseDown={(event) => event.preventDefault()}
								onClick={handleClear}
							>
								<X />
							</Button>
						</InputGroupAddon>
					) : null}
				</InputGroup>

				<Button
					type="submit"
					size="lg"
					disabled={isPending}
					aria-disabled={!hasText || isPending}
					className="gap-2 aria-disabled:pointer-events-none aria-disabled:opacity-64"
					aria-label="Transcribe text"
				>
					{isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<SendHorizontal className="size-4" />
					)}
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
							<ButtonGroup className="bg-background rounded-lg border shadow-sm">
								<TranscriptionInfoButton />
								<ButtonGroupSeparator />
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
