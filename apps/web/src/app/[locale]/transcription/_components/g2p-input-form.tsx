"use client";

import { Keyboard, Loader2, SendHorizonal } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranscribe } from "../_hooks/use-g2p";
import { useStartTypingAnywhere } from "../_hooks/use-start-typing-anywhere";

interface G2PInputFormProps {
	placeholder?: string;
	maxLength?: number;
}

export function G2PInputForm({
	placeholder = "Enter text to transcribe...",
	maxLength = 200,
}: G2PInputFormProps) {
	const [inputText, setInputText] = useState("");
	const transcribeMutation = useTranscribe();
	const isLoading = transcribeMutation.isPending;
	const inputRef = useRef<HTMLInputElement>(null);

	const hasText = inputText.trim().length > 0;
	const characterCount = inputText.length;

	const { isMobileDevice } = useStartTypingAnywhere({
		inputRef,
		disabled: isLoading,
		onTyping: (character) => {
			setInputText((current) => current + character);
		},
	});

	const showStartTypingHint = isMobileDevice === false;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (hasText && !isLoading) transcribeMutation.mutate(inputText.trim());
	};

	return (
		<div className="w-full space-y-3">
			{showStartTypingHint ? (
				<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
					<span className="inline-flex items-center gap-1">
						<Keyboard className="size-4" />
						Type anywhere or paste text to transcribe.
					</span>
					<span className="text-xs text-muted-foreground/80">
						Max {maxLength} characters • English phonemes
					</span>
				</div>
			) : null}

			<form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="relative flex-1">
					<Input
						ref={inputRef}
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder={placeholder}
						disabled={isLoading}
						className="h-12 rounded-lg border bg-background px-4 pr-20 text-base shadow-inner shadow-black/5"
						maxLength={maxLength}
						aria-label="Text to transcribe"
					/>
					<div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
						<span
							className={cn(
								"text-xs font-medium tabular-nums transition-colors",
								characterCount >= maxLength * 0.9
									? "text-orange-600 dark:text-orange-400"
									: "text-muted-foreground",
							)}
						>
							{characterCount}/{maxLength}
						</span>
					</div>
				</div>

				<Button
					type="submit"
					disabled={!hasText || isLoading}
					className="h-12 w-full gap-2 sm:w-auto"
					size="default"
				>
					{isLoading ? (
						<>
							<Loader2 className="size-4 animate-spin" />
							<span className="text-sm">Transcribing…</span>
						</>
					) : (
						<>
							<SendHorizonal className="size-4" />
							<span className="text-sm">Transcribe</span>
						</>
					)}
				</Button>
			</form>
		</div>
	);
}
