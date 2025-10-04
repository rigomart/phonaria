"use client";

import { Loader2, SendHorizonal } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useTranscribe } from "../_hooks/use-g2p";
import { useStartTypingAnywhere } from "../_hooks/use-start-typing-anywhere";

interface G2PInputFormProps {
	placeholder?: string;
	maxLength?: number;
}

/**
 * Enhanced G2P Input Form with Character Limit Visualization
 */
export function G2PInputForm({
	placeholder = "Enter text to see phonemic transcription...",
	maxLength = 200,
}: G2PInputFormProps) {
	const [inputText, setInputText] = useState("");
	const transcribeMutation = useTranscribe();
	const isLoading = transcribeMutation.isPending;
	const inputRef = useRef<HTMLInputElement>(null);

	const hasText = inputText.trim().length > 0;
	const characterCount = inputText.length;

	// Handle "start typing anywhere" functionality
	const { isMobileDevice } = useStartTypingAnywhere({
		inputRef,
		disabled: isLoading,
		onTyping: (character) => {
			setInputText((current) => current + character);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (hasText && !isLoading) transcribeMutation.mutate(inputText.trim());
	};

	return (
		<div className="w-full flex flex-col gap-2">
			{!isMobileDevice && (
				<div className="text-xs text-muted-foreground/40">Type anywhere to begin transcribing</div>
			)}

			{/* Compact Input Section */}
			<form onSubmit={handleSubmit} className="space-y-3">
				<div className="flex gap-3">
					<Input
						ref={inputRef}
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder={placeholder}
						disabled={isLoading}
						className={`flex-1 transition-all duration-200`}
						maxLength={maxLength}
						aria-label="Text to transcribe"
					/>
					<Button
						type="submit"
						disabled={!hasText || isLoading}
						className="px-4 py-3"
						size="default"
					>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<SendHorizonal className="h-4 w-4" />
						)}
					</Button>
				</div>
			</form>
			{/* Character Limit Visualization */}
			<CharacterProgress current={characterCount} max={maxLength} />
		</div>
	);
}

interface CharacterProgressProps {
	current: number;
	max: number;
	className?: string;
}

function CharacterProgress({ current, max }: CharacterProgressProps) {
	const percentage = (current / max) * 100;

	return (
		<div className="flex flex-col items-start gap-1">
			<div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
				<Progress value={percentage} />
			</div>

			<div className="flex justify-between items-center self-end text-xs">
				<span className="text-xs">
					{current} / {max}
				</span>
			</div>
		</div>
	);
}
