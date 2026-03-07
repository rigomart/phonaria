"use client";

import { Button } from "@phonaria/ui/components/button";
import { Input } from "@phonaria/ui/components/input";
import { Loader2, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranscribe } from "../_hooks/use-transcribe";

interface G2PInputFormProps {
	maxLength?: number;
}

export function G2PInputForm({ maxLength = 200 }: G2PInputFormProps) {
	const [inputText, setInputText] = useState("");
	const transcribeMutation = useTranscribe();
	const isLoading = transcribeMutation.isPending;
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.metaKey || e.ctrlKey || e.altKey || e.key === "Escape" || e.key === "Tab") {
				return;
			}

			const active = document.activeElement;
			const hasFocusedControl =
				active instanceof HTMLElement &&
				active !== document.body &&
				active !== document.documentElement;

			if (!hasFocusedControl && e.key.length === 1) {
				inputRef.current?.focus();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const hasText = inputText.trim().length > 0;
	const characterCount = inputText.length;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (hasText && !isLoading) transcribeMutation.mutate({ text: inputText.trim() });
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2 flex-row w-full">
			<div className="relative flex-1">
				<Input
					ref={inputRef}
					value={inputText}
					onChange={(e) => setInputText(e.target.value)}
					placeholder="Type a word or phrase..."
					disabled={isLoading}
					size="lg"
					className="rounded-lg pr-20 border-border"
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
				size="lg"
				disabled={!hasText || isLoading}
				className="gap-2"
				aria-label="Transcribe text"
			>
				{isLoading ? (
					<Loader2 className="size-4 animate-spin" />
				) : (
					<SendHorizontal className="size-4" />
				)}
			</Button>
		</form>
	);
}
