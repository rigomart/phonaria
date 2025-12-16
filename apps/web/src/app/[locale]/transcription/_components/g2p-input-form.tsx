"use client";

import { Button } from "@phonaria/ui/components/button";
import { Input } from "@phonaria/ui/components/input";
import { Keyboard, Loader2, SendHorizonal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranscribe } from "../_hooks/use-g2p";
import { useStartTypingAnywhere } from "../_hooks/use-start-typing-anywhere";

interface G2PInputFormProps {
	placeholder?: string;
	maxLength?: number;
}

export function G2PInputForm({ placeholder, maxLength = 200 }: G2PInputFormProps) {
	const t = useTranslations("g2p-page.input-form");
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
	const placeholderText = placeholder ?? t("placeholder");

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
						{t("hint")}
					</span>
					<span className="text-xs text-muted-foreground/80">
						{t("max-characters", { maxLength })}
					</span>
				</div>
			) : null}

			<form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="relative flex-1">
					<Input
						ref={inputRef}
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder={placeholderText}
						disabled={isLoading}
						size="lg"
						className="rounded-lg pr-20 border-border"
						maxLength={maxLength}
						aria-label={t("aria-label")}
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
					className="w-full gap-2 sm:w-auto"
					size="default"
				>
					{isLoading ? (
						<>
							<Loader2 className="size-4 animate-spin" />
							<span className="text-sm">{t("button.transcribing")}</span>
						</>
					) : (
						<>
							<SendHorizonal className="size-4" />
							<span className="text-sm">{t("button.transcribe")}</span>
						</>
					)}
				</Button>
			</form>
		</div>
	);
}
