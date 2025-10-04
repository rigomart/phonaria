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
		<div className="w-full max-w-3xl mx-auto space-y-4">
			{!isMobileDevice && (
				<div className="text-xs text-muted-foreground/40 text-center">
					Type anywhere to begin transcribing
				</div>
			)}

			{/* Input Section */}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="flex gap-3">
					<Input
						ref={inputRef}
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder={placeholder}
						disabled={isLoading}
						className="flex-1 h-12 text-base px-4 py-2"
						maxLength={maxLength}
						aria-label="Text to transcribe"
					/>
					<Button
						type="submit"
						disabled={!hasText || isLoading}
						className="h-12 w-12 p-0"
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
		<div className="flex items-center justify-end gap-3">
			<div className="flex-1 max-w-xs">
				<div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
					<Progress value={percentage} className="h-full" />
				</div>
			</div>
			<span className="text-xs text-muted-foreground min-w-[60px] text-right">
				{current}/{max}
			</span>
		</div>
	);
}
