"use client";

import { Loader2, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useG2PStore } from "../_store/g2p-store";

interface G2PInputFormProps {
	disabled?: boolean;
	placeholder?: string;
	maxLength?: number;
	className?: string;
}

/**
 * Enhanced G2P Input Form with Character Limit Visualization
 */
export function G2PInputForm({
	disabled = false,
	placeholder = "Enter text to see phonemic transcription...",
	maxLength = 200,
	className,
}: G2PInputFormProps) {
	const [inputText, setInputText] = useState("");
	const { transcribe, isLoading } = useG2PStore();

	const isDisabled = disabled || isLoading;
	const hasText = inputText.trim().length > 0;
	const characterCount = inputText.length;
	const characterPercentage = (characterCount / maxLength) * 100;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (hasText && !isDisabled) {
			transcribe(inputText.trim());
		}
	};

	return (
		<div className={className}>
			{/* Compact Input Section */}
			<form onSubmit={handleSubmit} className="space-y-3">
				<div className="flex gap-3">
					<Input
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder={placeholder}
						disabled={isDisabled}
						className="flex-1"
						maxLength={maxLength}
						aria-label="Text to transcribe"
					/>
					<Button
						type="submit"
						disabled={!hasText || isDisabled}
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

				{/* Character Limit Visualization */}
				<div className="space-y-2">
					<Progress value={characterPercentage} className="h-1.5" />
					<div className="flex justify-between items-center text-xs text-muted-foreground">
						<span className="text-xs text-muted-foreground">
							{characterCount} / {maxLength} characters
						</span>
						{characterCount > maxLength * 0.8 && characterCount < maxLength && (
							<span className="text-amber-600">Approaching limit</span>
						)}
						{characterCount >= maxLength && (
							<span className="text-red-600">Character limit reached</span>
						)}
					</div>
				</div>
			</form>
		</div>
	);
}
